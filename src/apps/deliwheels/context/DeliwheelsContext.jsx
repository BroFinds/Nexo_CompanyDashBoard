import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";
import api, { getSession, fetchPage } from "@/services/api";

const DeliwheelsContext = createContext();

// ── Field mappers (API camelCase → UI snake_case) ────────────────────────────

const mapVehicle = (v) => ({
  vehicle_uid: v.vehicleUId || v.vehicle_uid,
  registration:
    v.vehicleNumber || v.vehicleRegistration || v.registration || "",
  model: v.vehicleName || v.model || "",
  type: v.vehicleType || v.type || "Mini Truck",
  capacity: v.capacity || "",
  fuel: v.fuelType || v.fuel || "Diesel",
  status:
    v.isActive !== undefined
      ? v.isActive
        ? "active"
        : "inactive"
      : v.status || "active",
  driver: v.driverName || v.driver || "Unassigned",
  employee_uid: v.employeeUId || v.employee_uid || "",
  last_service: v.lastService || v.last_service || "",
  route_uid: v.routeUId || v.route_uid || "",
  username: v.username || "",
});

const mapRoute = (r) => {
  const activeFlag = r.isActive !== undefined ? r.isActive : r.active;
  return {
    route_uid: r.routeUid || r.route_uid,
    origin: r.fromPlace || "",
    destination: r.toPlace || "",
    status:
      activeFlag !== undefined
        ? activeFlag
          ? "active"
          : "inactive"
        : r.status || "active",
  };
};

const mapStockAdded = (s) => ({
  stock_uid: s.stockAddedUId || s.stockUId || s.stock_uid || "",
  product_uid: s.productUId || s.product_uid || "",
  product_name: s.productName || s.product_name || "",
  product_code: s.productCode || s.product_code || "",
  quantity: s.quantity || 0,
  vehicle_uid: s.vehicleUId || s.vehicle_uid || "",
  loaded_date: (s.stockDate || s.loadedDate || s.createdOn || "").split("T")[0],
  status:
    s.isActive !== undefined
      ? s.isActive
        ? "loaded"
        : "delivered"
      : s.status || "loaded",
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

  const [vehiclesHasMore, setVehiclesHasMore] = useState(true);
  const [stockHasMore, setStockHasMore] = useState(true);
  const [routesHasMore, setRoutesHasMore] = useState(true);
  const [vehiclesLoaded, setVehiclesLoaded] = useState(false);
  const [stockLoaded, setStockLoaded] = useState(false);
  const [routesLoaded, setRoutesLoaded] = useState(false);
  const [isSalesLoaded, setIsSalesLoaded] = useState(false);

  const vehiclesPageRef = useRef(0);
  const routesPageRef = useRef(0);
  const stockPageRef = useRef(0);
  const vehiclesInFlightRef = useRef(false);
  const routesInFlightRef = useRef(false);
  const stockInFlightRef = useRef(false);
  const vehiclesHasMoreRef = useRef(true);
  const routesHasMoreRef = useRef(true);
  const stockHasMoreRef = useRef(true);

  // ── Fetchers (paginated, append on each call) ──────────────────────────────

  const fetchVehicles = useCallback(async () => {
    if (vehiclesInFlightRef.current || !vehiclesHasMoreRef.current) return;
    vehiclesInFlightRef.current = true;
    setIsLoadingVehicles(true);
    try {
      const session = getSession();
      const { items, last } = await fetchPage(
        `/api/v1/deliwheels/vehicles/company/${session.companyId}`,
        { page: vehiclesPageRef.current },
      );
      const mapped = items.map(mapVehicle);
      setVehicles((prev) => {
        const seen = new Set(prev.map((v) => v.vehicle_uid));
        return [...prev, ...mapped.filter((v) => !seen.has(v.vehicle_uid))];
      });
      vehiclesPageRef.current += 1;
      vehiclesHasMoreRef.current = !last;
      setVehiclesHasMore(!last);
      setVehiclesLoaded(true);
    } catch (e) {
      console.error("fetchVehicles:", e);
    } finally {
      vehiclesInFlightRef.current = false;
      setIsLoadingVehicles(false);
    }
  }, []);

  const refreshVehicles = useCallback(async () => {
    vehiclesPageRef.current = 0;
    vehiclesHasMoreRef.current = true;
    setVehicles([]);
    setVehiclesHasMore(true);
    setVehiclesLoaded(false);
    await fetchVehicles();
  }, [fetchVehicles]);

  const fetchRoutes = useCallback(async () => {
    if (routesInFlightRef.current || !routesHasMoreRef.current) return;
    routesInFlightRef.current = true;
    setIsLoadingRoutes(true);
    try {
      const session = getSession();
      const { items, last } = await fetchPage(
        `/api/v1/deliwheels/routes/company/${session.companyId}`,
        { page: routesPageRef.current },
      );
      const mapped = items.map(mapRoute);
      setRoutes((prev) => {
        const seen = new Set(prev.map((r) => r.route_uid));
        return [...prev, ...mapped.filter((r) => !seen.has(r.route_uid))];
      });
      routesPageRef.current += 1;
      routesHasMoreRef.current = !last;
      setRoutesHasMore(!last);
      setRoutesLoaded(true);
    } catch (e) {
      console.error("fetchRoutes:", e);
    } finally {
      routesInFlightRef.current = false;
      setIsLoadingRoutes(false);
    }
  }, []);

  const refreshRoutes = useCallback(async () => {
    routesPageRef.current = 0;
    routesHasMoreRef.current = true;
    setRoutes([]);
    setRoutesHasMore(true);
    setRoutesLoaded(false);
    await fetchRoutes();
  }, [fetchRoutes]);

  const fetchStock = useCallback(async () => {
    if (stockInFlightRef.current || !stockHasMoreRef.current) return;
    stockInFlightRef.current = true;
    setIsLoadingStock(true);
    try {
      const session = getSession();
      const { items, last } = await fetchPage(
        `/api/v1/deliwheels/stock-added/company/${session.companyId}`,
        { page: stockPageRef.current },
      );
      const mapped = items.map(mapStockAdded);
      setStock((prev) => {
        const seen = new Set(prev.map((s) => s.stock_uid));
        return [...prev, ...mapped.filter((s) => !seen.has(s.stock_uid))];
      });
      stockPageRef.current += 1;
      stockHasMoreRef.current = !last;
      setStockHasMore(!last);
      setStockLoaded(true);
    } catch (e) {
      console.error("fetchStock:", e);
    } finally {
      stockInFlightRef.current = false;
      setIsLoadingStock(false);
    }
  }, []);

  const refreshStock = useCallback(async () => {
    stockPageRef.current = 0;
    stockHasMoreRef.current = true;
    setStock([]);
    setStockHasMore(true);
    setStockLoaded(false);
    await fetchStock();
  }, [fetchStock]);

  const fetchSales = useCallback(async () => {
    if (isSalesLoaded) return;
    setIsLoadingSales(true);
    try {
      // Sales endpoint not yet documented — log placeholder
      console.warn("fetchSales: no endpoint defined yet");
      setIsSalesLoaded(true);
    } catch (e) {
      console.error("fetchSales:", e);
    } finally {
      setIsLoadingSales(false);
    }
  }, [isSalesLoaded]);

  // ── CRUD: Vehicles ─────────────────────────────────────────────────────────

  const addVehicle = useCallback(async (formData) => {
    const session = getSession();
    try {
      const { data } = await api.put("/api/v1/deliwheels/vehicles", {
        companyUid: session.companyId,
        routeUid: formData.route_uid || null,
        employeeUid: formData.employee_uid || null,
        vehicleName: formData.model,
        vehicleNumber: formData.registration,
        username: formData.username || "",
        password: formData.password || "",
        createdBy: session.userId,
      });
      const mapped = mapVehicle(data);
      setVehicles((prev) => [...prev, mapped]);
      return mapped;
    } catch (e) {
      console.error("addVehicle:", e);
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
        username: formData.username || "",
        password: formData.password || "",
        modifiedBy: session.userId,
      });
      const mapped = mapVehicle(data);
      setVehicles((prev) =>
        prev.map((v) => (v.vehicle_uid === uid ? mapped : v)),
      );
      return mapped;
    } catch (e) {
      console.error("updateVehicle:", e);
      throw e;
    }
  }, []);

  // ── CRUD: Routes ───────────────────────────────────────────────────────────

  const addRoute = useCallback(async (formData) => {
    const session = getSession();
    try {
      const { data } = await api.post("/api/v1/deliwheels/routes", {
        companyUid: session.companyId,
        fromPlace: (formData.origin || "").trim(),
        toPlace: (formData.destination || "").trim(),
        active: formData.is_active !== undefined ? formData.is_active : true,
      });
      const mapped = mapRoute(data);
      setRoutes((prev) => [...prev, mapped]);
      return mapped;
    } catch (e) {
      console.error("addRoute:", e);
      throw e;
    }
  }, []);

  const updateRoute = useCallback(async (formData) => {
    const session = getSession();
    const uid = formData.route_uid;
    try {
      const { data } = await api.put(`/api/v1/deliwheels/routes/${uid}`, {
        companyUid: session.companyId,
        fromPlace: (formData.origin || "").trim(),
        toPlace: (formData.destination || "").trim(),
      });
      const mapped = mapRoute(data);
      setRoutes((prev) => prev.map((r) => (r.route_uid === uid ? mapped : r)));
      return mapped;
    } catch (e) {
      console.error("updateRoute:", e);
      throw e;
    }
  }, []);

  const setRouteStatus = useCallback(async (uid, active) => {
    try {
      await api.patch(`/api/v1/deliwheels/routes/${uid}/status/${active}`);
      setRoutes((prev) =>
        prev.map((r) =>
          r.route_uid === uid
            ? { ...r, status: active ? "active" : "inactive" }
            : r,
        ),
      );
    } catch (e) {
      console.error("setRouteStatus:", e);
      throw e;
    }
  }, []);

  // ── CRUD: Stock ────────────────────────────────────────────────────────────

  const addStockLoading = useCallback(
    async (productUid, quantity, vehicleUid) => {
      const session = getSession();
      try {
        const { data } = await api.put("/api/v1/deliwheels/stock-added", {
          companyUId: session.companyId,
          vehicleUId: vehicleUid,
          productUId: productUid,
          quantity,
          createdBy: session.userId,
        });
        const mapped = mapStockAdded(data);
        setStock((prev) => [...prev, mapped]);
        return mapped;
      } catch (e) {
        console.error("addStockLoading:", e);
        throw e;
      }
    },
    [],
  );

  const updateStock = useCallback(async (updatedEntry) => {
    const session = getSession();
    const uid = updatedEntry.stock_uid;
    try {
      const { data } = await api.put(`/api/v1/deliwheels/stock-added/${uid}`, {
        companyUId: session.companyId,
        vehicleUId: updatedEntry.vehicle_uid,
        productUId: updatedEntry.product_uid,
        quantity: updatedEntry.quantity,
        modifiedBy: session.userId,
      });
      const mapped = mapStockAdded(data);
      setStock((prev) => prev.map((s) => (s.stock_uid === uid ? mapped : s)));
      return mapped;
    } catch (e) {
      console.error("updateStock:", e);
      throw e;
    }
  }, []);

  const deleteVehicle = useCallback(async (uid) => {
    try {
      await api.delete(`/api/v1/deliwheels/vehicles/${uid}`);
      setVehicles((prev) => prev.filter((v) => v.vehicle_uid !== uid));
    } catch (e) {
      console.error("deleteVehicle:", e);
      throw e;
    }
  }, []);

  const deleteRoute = useCallback(async (uid) => {
    try {
      await api.patch(`/api/v1/deliwheels/routes/${uid}/status/false`);
      setRoutes((prev) =>
        prev.map((r) =>
          r.route_uid === uid ? { ...r, status: "inactive" } : r,
        ),
      );
    } catch (e) {
      console.error("deleteRoute:", e);
      throw e;
    }
  }, []);

  const deleteStock = useCallback(async (uid) => {
    try {
      await api.delete(`/api/v1/deliwheels/stock-added/${uid}`);
      setStock((prev) => prev.filter((s) => s.stock_uid !== uid));
    } catch (e) {
      console.error("deleteStock:", e);
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
        vehiclesHasMore,
        stockHasMore,
        routesHasMore,
        vehiclesLoaded,
        stockLoaded,
        routesLoaded,
        fetchVehicles,
        fetchStock,
        fetchRoutes,
        fetchSales,
        refreshVehicles,
        refreshRoutes,
        refreshStock,
        addVehicle,
        addRoute,
        addStockLoading,
        updateVehicle,
        updateRoute,
        updateStock,
        deleteVehicle,
        deleteRoute,
        deleteStock,
        setRouteStatus,
      }}
    >
      {children}
    </DeliwheelsContext.Provider>
  );
};

export const useDeliwheels = () => useContext(DeliwheelsContext);
