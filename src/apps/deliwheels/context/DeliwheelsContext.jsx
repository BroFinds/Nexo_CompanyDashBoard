import React, { createContext, useContext, useState, useCallback } from 'react';
import api, { getSession } from '@/services/api';

const DeliwheelsContext = createContext();

// ── Field mappers (API camelCase → UI snake_case) ────────────────────────────

const mapVehicle = (v) => ({
  vehicle_uid: v.vehicleUId || v.vehicle_uid,
  registration: v.vehicleNumber || v.vehicleRegistration || v.registration || '',
  model: v.vehicleName || v.model || '',
  type: v.vehicleType || v.type || 'Mini Truck',
  capacity: v.capacity || '',
  fuel: v.fuelType || v.fuel || 'Diesel',
  status: v.isActive !== undefined ? (v.isActive ? 'active' : 'inactive') : (v.status || 'active'),
  driver: v.driverName || v.driver || 'Unassigned',
  employee_uid: v.employeeUId || v.employee_uid || '',
  last_service: v.lastService || v.last_service || '',
  route_uid: v.routeUId || v.route_uid || '',
  username: v.username || '',
});

const mapRoute = (r) => ({
  route_uid: r.routeUId || r.route_uid,
  name: r.routeName || r.name || '',
  origin: r.origin || '',
  destination: r.destination || '',
  status: r.isActive !== undefined ? (r.isActive ? 'active' : 'inactive') : (r.status || 'active'),
});

const mapStockAdded = (s) => ({
  stock_uid: s.stockAddedUId || s.stockUId || s.stock_uid || '',
  product_uid: s.productUId || s.product_uid || '',
  product_name: s.productName || s.product_name || '',
  product_code: s.productCode || s.product_code || '',
  quantity: s.quantity || 0,
  vehicle_uid: s.vehicleUId || s.vehicle_uid || '',
  loaded_date: (s.stockDate || s.loadedDate || s.createdOn || '').split('T')[0],
  status: s.isActive !== undefined ? (s.isActive ? 'loaded' : 'delivered') : (s.status || 'loaded'),
});

// ── Provider ─────────────────────────────────────────────────────────────────

export const DeliwheelsProvider = ({ children }) => {
  const [vehicles, setVehicles] = useState([]);
  const [stock, setStock] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [sales, setSales] = useState([]);

  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);
  const [isLoadingStock, setIsLoadingStock] = useState(false);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
  const [isLoadingSales, setIsLoadingSales] = useState(false);

  const [isVehiclesLoaded, setIsVehiclesLoaded] = useState(false);
  const [isStockLoaded, setIsStockLoaded] = useState(false);
  const [isRoutesLoaded, setIsRoutesLoaded] = useState(false);
  const [isSalesLoaded, setIsSalesLoaded] = useState(false);

  // ── Fetchers ───────────────────────────────────────────────────────────────

  const fetchVehicles = useCallback(async () => {
    if (isVehiclesLoaded) return;
    setIsLoadingVehicles(true);
    try {
      const session = getSession();
      const { data } = await api.get(`/api/v1/deliwheels/vehicles/company/${session.companyId}`, {
        params: { page: 0, size: 500 },
      });
      setVehicles((data.content || data).map(mapVehicle));
      setIsVehiclesLoaded(true);
    } catch (e) {
      console.error('fetchVehicles:', e);
    } finally {
      setIsLoadingVehicles(false);
    }
  }, [isVehiclesLoaded]);

  const fetchRoutes = useCallback(async () => {
    if (isRoutesLoaded) return;
    setIsLoadingRoutes(true);
    try {
      const session = getSession();
      const { data } = await api.get(`/api/v1/deliwheels/routes/company/${session.companyId}`, {
        params: { page: 0, size: 500 },
      });
      setRoutes((data.content || data).map(mapRoute));
      setIsRoutesLoaded(true);
    } catch (e) {
      console.error('fetchRoutes:', e);
    } finally {
      setIsLoadingRoutes(false);
    }
  }, [isRoutesLoaded]);

  const fetchStock = useCallback(async () => {
    if (isStockLoaded) return;
    setIsLoadingStock(true);
    try {
      const session = getSession();
      const { data } = await api.get(`/api/v1/deliwheels/stock-added/company/${session.companyId}`, {
        params: { page: 0, size: 500 },
      });
      setStock((data.content || data).map(mapStockAdded));
      setIsStockLoaded(true);
    } catch (e) {
      console.error('fetchStock:', e);
    } finally {
      setIsLoadingStock(false);
    }
  }, [isStockLoaded]);

  const fetchSales = useCallback(async () => {
    if (isSalesLoaded) return;
    setIsLoadingSales(true);
    try {
      // Sales endpoint not yet documented — log placeholder
      console.warn('fetchSales: no endpoint defined yet');
      setIsSalesLoaded(true);
    } catch (e) {
      console.error('fetchSales:', e);
    } finally {
      setIsLoadingSales(false);
    }
  }, [isSalesLoaded]);

  // ── CRUD: Vehicles ─────────────────────────────────────────────────────────

  const addVehicle = useCallback(async (formData) => {
    const session = getSession();
    try {
      const { data } = await api.put('/api/v1/deliwheels/vehicles', {
        companyUid: session.companyId,
        routeUid: formData.route_uid || null,
        employeeUid: formData.employee_uid || null,
        vehicleName: formData.model,
        vehicleNumber: formData.registration,
        username: formData.username || '',
        password: formData.password || '',
      });
      const mapped = mapVehicle(data);
      setVehicles((prev) => [...prev, mapped]);
      return mapped;
    } catch (e) {
      console.error('addVehicle:', e);
      throw e;
    }
  }, []);

  const updateVehicle = useCallback(async (formData) => {
    const session = getSession();
    const uid = formData.vehicle_uid;
    try {
      const { data } = await api.put(`/api/v1/deliwheels/vehicles/${uid}`, {
        companyUid: session.companyId,
        routeUid: formData.route_uid || null,
        employeeUid: formData.employee_uid || null,
        vehicleName: formData.model,
        vehicleNumber: formData.registration,
        username: formData.username || '',
        password: formData.password || '',
      });
      const mapped = mapVehicle(data);
      setVehicles((prev) => prev.map((v) => (v.vehicle_uid === uid ? mapped : v)));
      return mapped;
    } catch (e) {
      console.error('updateVehicle:', e);
      throw e;
    }
  }, []);

  // ── CRUD: Routes ───────────────────────────────────────────────────────────

  const addRoute = useCallback(async (formData) => {
    const session = getSession();
    try {
      const { data } = await api.put('/api/v1/deliwheels/routes', {
        companyUId: session.companyId,
        routeName: formData.name,
        origin: formData.origin,
        destination: formData.destination,
      });
      const mapped = mapRoute(data);
      setRoutes((prev) => [...prev, mapped]);
      return mapped;
    } catch (e) {
      console.error('addRoute:', e);
      throw e;
    }
  }, []);

  const updateRoute = useCallback(async (formData) => {
    const session = getSession();
    const uid = formData.route_uid;
    try {
      const { data } = await api.put(`/api/v1/deliwheels/routes/${uid}`, {
        companyUId: session.companyId,
        routeName: formData.name,
        origin: formData.origin,
        destination: formData.destination,
      });
      const mapped = mapRoute(data);
      setRoutes((prev) => prev.map((r) => (r.route_uid === uid ? mapped : r)));
      return mapped;
    } catch (e) {
      console.error('updateRoute:', e);
      throw e;
    }
  }, []);

  // ── CRUD: Stock ────────────────────────────────────────────────────────────

  const addStockLoading = useCallback(async (productUid, quantity, vehicleUid) => {
    const session = getSession();
    try {
      const { data } = await api.put('/api/v1/deliwheels/stock-added', {
        companyUId: session.companyId,
        vehicleUId: vehicleUid,
        productUId: productUid,
        quantity,
      });
      const mapped = mapStockAdded(data);
      setStock((prev) => [...prev, mapped]);
      return mapped;
    } catch (e) {
      console.error('addStockLoading:', e);
      throw e;
    }
  }, []);

  const updateStock = useCallback(async (updatedEntry) => {
    const session = getSession();
    const uid = updatedEntry.stock_uid;
    try {
      const { data } = await api.put(`/api/v1/deliwheels/stock-added/${uid}`, {
        companyUId: session.companyId,
        vehicleUId: updatedEntry.vehicle_uid,
        productUId: updatedEntry.product_uid,
        quantity: updatedEntry.quantity,
      });
      const mapped = mapStockAdded(data);
      setStock((prev) => prev.map((s) => (s.stock_uid === uid ? mapped : s)));
      return mapped;
    } catch (e) {
      console.error('updateStock:', e);
      throw e;
    }
  }, []);

  const deleteVehicle = useCallback(async (uid) => {
    try {
      await api.delete(`/api/v1/deliwheels/vehicles/${uid}`);
      setVehicles((prev) => prev.filter((v) => v.vehicle_uid !== uid));
    } catch (e) {
      console.error('deleteVehicle:', e);
      throw e;
    }
  }, []);

  const deleteRoute = useCallback(async (uid) => {
    try {
      await api.delete(`/api/v1/deliwheels/routes/${uid}`);
      setRoutes((prev) => prev.filter((r) => r.route_uid !== uid));
    } catch (e) {
      console.error('deleteRoute:', e);
      throw e;
    }
  }, []);

  const deleteStock = useCallback(async (uid) => {
    try {
      await api.delete(`/api/v1/deliwheels/stock-added/${uid}`);
      setStock((prev) => prev.filter((s) => s.stock_uid !== uid));
    } catch (e) {
      console.error('deleteStock:', e);
      throw e;
    }
  }, []);

  return (
    <DeliwheelsContext.Provider
      value={{
        vehicles,
        stock,
        routes,
        sales,
        isLoadingVehicles,
        isLoadingStock,
        isLoadingRoutes,
        isLoadingSales,
        fetchVehicles,
        fetchStock,
        fetchRoutes,
        fetchSales,
        addVehicle,
        addRoute,
        addStockLoading,
        updateVehicle,
        updateRoute,
        updateStock,
        deleteVehicle,
        deleteRoute,
        deleteStock,
      }}
    >
      {children}
    </DeliwheelsContext.Provider>
  );
};

export const useDeliwheels = () => useContext(DeliwheelsContext);
