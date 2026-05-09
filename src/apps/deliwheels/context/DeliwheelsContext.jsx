import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";
import api, { getSession, fetchPage } from "@/services/api";

const DeliwheelsContext = createContext();

// Spring's LocalDateTime deserializer rejects the trailing "Z" that
// Date.toISOString() produces. Emit "yyyy-MM-ddTHH:mm:ss.SSS" instead.
const toLocalDateTime = (d = new Date()) =>
  new Date(d).toISOString().replace(/Z$/, "");

// ── Field mappers (API camelCase → UI snake_case) ────────────────────────────

const mapRoute = (r) => {
  if (!r) return null;
  const activeFlag = r.isActive !== undefined ? r.isActive : r.active;
  return {
    route_uid: r.routeUid || r.route_uid || "",
    origin: r.fromPlace || r.origin || "",
    destination: r.toPlace || r.destination || "",
    status:
      activeFlag !== undefined
        ? activeFlag
          ? "active"
          : "inactive"
        : r.status || "active",
  };
};

const mapVehicle = (v) => {
  const nestedRoute = mapRoute(v.route);
  const driverFromObj = v.employee?.name;
  return {
    vehicle_uid: v.vehicleUid || v.vehicle_uid || "",
    registration: v.vehicleNumber || v.vehicle_number || "",
    model: v.vehicleName || v.vehicle_name || "",
    status:
      v.isActive !== undefined
        ? v.isActive
          ? "active"
          : "inactive"
        : v.is_active !== undefined
          ? v.is_active
            ? "active"
            : "inactive"
          : v.status || "active",
    driver: v.employeeName || driverFromObj || "Unassigned",
    employee_uid: v.employeeUid || v.employee_uid || "",
    route_uid: v.routeUid || v.route_uid || nestedRoute?.route_uid || "",
    route_origin: nestedRoute?.origin || "",
    route_destination: nestedRoute?.destination || "",
    username: v.username || "",
  };
};

const mapSaleDetail = (d) => ({
  sale_detail_uid: d.saleDetailUid || d.sale_detail_uid || "",
  sale_uid: d.saleUid || d.sale_uid || "",
  product_uid: d.productUid || d.product_uid || "",
  product_code: d.productCode || d.product_code || "",
  product_name: d.productName || d.product_name || "",
  quantity: parseInt(d.quantity ?? 0, 10) || 0,
  unit_price: parseFloat(d.unitPrice ?? d.unit_price ?? 0) || 0,
  discount: parseFloat(d.discount ?? 0) || 0,
  tax_amount: parseFloat(d.taxAmount ?? d.tax_amount ?? 0) || 0,
  total_amount: parseFloat(d.totalAmount ?? d.total_amount ?? 0) || 0,
  created_on: d.createdOn || d.created_on || "",
  updated_on: d.updatedOn || d.updated_on || "",
});

const mapSale = (s) => ({
  sale_uid: s.saleUid || s.sale_uid || "",
  company_uid: s.companyUid || s.company_uid || "",
  shop_uid: s.shopUid || s.shop_uid || "",
  shop_owner_name: s.shopOwnerName || s.shop_owner_name || "",
  shop_contact_number: s.shopContactNumber || s.shop_contact_number || "",
  vehicle_uid: s.vehicleUid || s.vehicle_uid || "",
  vehicle_number: s.vehicleNumber || s.vehicle_number || "",
  invoice_no: s.invoiceNo || s.invoice_no || "",
  sale_date: s.saleDate || s.sale_date || "",
  total_amount: parseFloat(s.totalAmount ?? s.total_amount ?? 0) || 0,
  discount_amount: parseFloat(s.discountAmount ?? s.discount_amount ?? 0) || 0,
  tax_amount: parseFloat(s.taxAmount ?? s.tax_amount ?? 0) || 0,
  grand_total: parseFloat(s.grandTotal ?? s.grand_total ?? 0) || 0,
  payment_mode: s.paymentMode || s.payment_mode || "",
  payment_mode_text: s.paymentModeText || s.payment_mode_text || "",
  payment_status: s.paymentStatus || s.payment_status || "",
  payment_status_text: s.paymentStatusText || s.payment_status_text || "",
  is_active: s.isActive !== undefined ? s.isActive : s.is_active !== undefined ? s.is_active : true,
  created_on: s.createdOn || s.created_on || "",
  updated_on: s.updatedOn || s.updated_on || "",
  details: Array.isArray(s.details) ? s.details.map(mapSaleDetail) : [],
});

const mapStockAdded = (s) => ({
  stock_uid: s.stockUid || s.stock_uid || "",
  product_uid: s.productUid || s.product_uid || "",
  product_name: s.productName || s.product_name || "",
  vehicle_uid: s.vehicleUid || s.vehicle_uid || "",
  vehicle_number: s.vehicleNumber || s.vehicle_number || "",
  company_uid: s.companyUid || s.company_uid || "",
  quantity: parseInt(s.totalQuantity ?? s.total_quantity ?? s.quantity ?? 0, 10) || 0,
  loaded_date: (s.stockAddedDate || s.stock_added_date || s.createdAt || "").split("T")[0],
  created_at: s.createdAt || "",
  updated_at: s.updatedAt || "",
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
  const [salesHasMore, setSalesHasMore] = useState(true);
  const [vehiclesLoaded, setVehiclesLoaded] = useState(false);
  const [stockLoaded, setStockLoaded] = useState(false);
  const [routesLoaded, setRoutesLoaded] = useState(false);
  const [salesLoaded, setSalesLoaded] = useState(false);

  const vehiclesPageRef = useRef(0);
  const routesPageRef = useRef(0);
  const stockPageRef = useRef(0);
  const salesPageRef = useRef(0);
  const vehiclesInFlightRef = useRef(false);
  const routesInFlightRef = useRef(false);
  const stockInFlightRef = useRef(false);
  const salesInFlightRef = useRef(false);
  const vehiclesHasMoreRef = useRef(true);
  const routesHasMoreRef = useRef(true);
  const stockHasMoreRef = useRef(true);
  const salesHasMoreRef = useRef(true);
  const stockFiltersRef = useRef({}); // { vehicleUid?, productUid?, fromDate?, toDate? }
  const salesFiltersRef = useRef({}); // { vehicleUid?, fromDate?, toDate? }
  // Bumped on every searchSales call so an in-flight fetchSales whose
  // generation no longer matches will discard its response and re-issue
  // the request with the latest filters — fixes filter-change race.
  const salesSearchGenRef = useRef(0);
  const vehicleFetchesRef = useRef(new Map()); // uid -> Promise

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

  const ensureVehicle = useCallback(async (uid) => {
    if (!uid) return null;
    if (vehicleFetchesRef.current.has(uid)) {
      return vehicleFetchesRef.current.get(uid);
    }
    const promise = (async () => {
      try {
        const { data } = await api.get(`/api/v1/deliwheels/vehicles/${uid}`);
        const mapped = mapVehicle(data);
        setVehicles((prev) => {
          if (prev.some((v) => v.vehicle_uid === mapped.vehicle_uid)) return prev;
          return [...prev, mapped];
        });
        return mapped;
      } catch (e) {
        console.error("ensureVehicle:", e);
        vehicleFetchesRef.current.delete(uid);
        return null;
      }
    })();
    vehicleFetchesRef.current.set(uid, promise);
    return promise;
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
      const f = stockFiltersRef.current;
      const params = {};
      if (f.vehicleUid) params.vehicleUid = f.vehicleUid;
      if (f.productUid) params.productUid = f.productUid;
      if (f.fromDate) params.fromDate = f.fromDate;
      if (f.toDate) params.toDate = f.toDate;
      const { items, last } = await fetchPage(
        `/api/v1/deliwheels/stock-added/company/${session.companyId}`,
        { page: stockPageRef.current, params },
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

  const searchStock = useCallback(
    async (filters = {}) => {
      stockFiltersRef.current = filters;
      stockPageRef.current = 0;
      stockHasMoreRef.current = true;
      setStock([]);
      setStockHasMore(true);
      setStockLoaded(false);
      await fetchStock();
    },
    [fetchStock],
  );

  const refreshStock = useCallback(async () => {
    stockPageRef.current = 0;
    stockHasMoreRef.current = true;
    setStock([]);
    setStockHasMore(true);
    setStockLoaded(false);
    await fetchStock();
  }, [fetchStock]);

  const fetchSales = useCallback(async () => {
    if (salesInFlightRef.current || !salesHasMoreRef.current) return;
    salesInFlightRef.current = true;
    const gen = salesSearchGenRef.current;
    setIsLoadingSales(true);
    try {
      const session = getSession();
      const f = salesFiltersRef.current;
      const params = {};
      if (f.vehicleUid) params.vehicleUid = f.vehicleUid;
      if (f.fromDate) params.fromDate = f.fromDate;
      if (f.toDate) params.toDate = f.toDate;
      const { items, last } = await fetchPage(
        `/api/v1/deliwheels/sales/company/${session.companyId}`,
        { page: salesPageRef.current, params },
      );
      // Stale response — a newer search has started; drop these results.
      if (gen !== salesSearchGenRef.current) return;
      const mapped = items.map(mapSale);
      setSales((prev) => {
        const seen = new Set(prev.map((s) => s.sale_uid));
        return [...prev, ...mapped.filter((s) => !seen.has(s.sale_uid))];
      });
      salesPageRef.current += 1;
      salesHasMoreRef.current = !last;
      setSalesHasMore(!last);
      setSalesLoaded(true);
    } catch (e) {
      console.error("fetchSales:", e);
    } finally {
      salesInFlightRef.current = false;
      setIsLoadingSales(false);
    }
  }, []);

  const searchSales = useCallback(
    async (filters = {}) => {
      salesSearchGenRef.current += 1;
      salesFiltersRef.current = filters;
      salesPageRef.current = 0;
      salesHasMoreRef.current = true;
      // Clear the in-flight flag so a new search can supersede an
      // unfinished one — its response will be discarded by the gen check.
      salesInFlightRef.current = false;
      setSales([]);
      setSalesHasMore(true);
      setSalesLoaded(false);
      await fetchSales();
    },
    [fetchSales],
  );

  const getSale = useCallback(async (saleUid) => {
    const session = getSession();
    const { data } = await api.get(
      `/api/v1/deliwheels/sales/company/${session.companyId}/${saleUid}`,
    );
    return mapSale(data);
  }, []);

  // ── CRUD: Vehicles ─────────────────────────────────────────────────────────

  const addVehicle = useCallback(async (formData) => {
    const session = getSession();
    try {
      const { data } = await api.post("/api/v1/deliwheels/vehicles", {
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
      setVehicles((prev) => [mapped, ...prev]);
      return mapped;
    } catch (e) {
      console.error("addVehicle:", e);
      throw e;
    }
  }, []);

  const updateVehicle = useCallback(async (formData) => {
    const session = getSession();
    const uid = formData.vehicle_uid;
    const payload = {
      companyUid: session.companyId,
      routeUid: formData.route_uid || null,
      employeeUid: formData.employee_uid || null,
      vehicleName: formData.model,
      vehicleNumber: formData.registration,
      modifiedBy: session.userId,
    };
    if (formData.username) payload.username = formData.username;
    if (formData.password) payload.password = formData.password;
    try {
      const { data } = await api.put(
        `/api/v1/deliwheels/vehicles/${uid}`,
        payload,
      );
      const mapped = mapVehicle(data);
      // PUT response may omit the joined employee/route objects that GET returns,
      // so trust the form's selections for the relational fields and clear stale
      // cached labels — getDriverName/getRouteLabel will resolve fresh names.
      const merged = {
        ...mapped,
        employee_uid: formData.employee_uid || "",
        route_uid: formData.route_uid || "",
        driver: formData.driver || "Unassigned",
        route_origin: mapped.route_origin || "",
        route_destination: mapped.route_destination || "",
      };
      setVehicles((prev) =>
        prev.map((v) => (v.vehicle_uid === uid ? merged : v)),
      );
      return merged;
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
        const { data } = await api.post("/api/v1/deliwheels/stock-added", {
          companyUid: session.companyId,
          vehicleUid,
          productUid,
          totalQuantity: String(quantity),
          stockAddedDate: toLocalDateTime(),
          createdBy: session.userId,
        });
        const mapped = mapStockAdded(data);
        setStock((prev) => [mapped, ...prev]);
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
        companyUid: session.companyId,
        vehicleUid: updatedEntry.vehicle_uid,
        productUid: updatedEntry.product_uid,
        totalQuantity: String(updatedEntry.quantity),
        stockAddedDate: toLocalDateTime(updatedEntry.loaded_date || undefined),
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
      await api.patch(`/api/v1/deliwheels/vehicles/${uid}/status/false`);
      setVehicles((prev) =>
        prev.map((v) =>
          v.vehicle_uid === uid ? { ...v, status: "inactive" } : v,
        ),
      );
    } catch (e) {
      console.error("deleteVehicle:", e);
      throw e;
    }
  }, []);

  const setVehicleStatus = useCallback(async (uid, active) => {
    try {
      await api.patch(`/api/v1/deliwheels/vehicles/${uid}/status/${active}`);
      setVehicles((prev) =>
        prev.map((v) =>
          v.vehicle_uid === uid
            ? { ...v, status: active ? "active" : "inactive" }
            : v,
        ),
      );
    } catch (e) {
      console.error("setVehicleStatus:", e);
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
        salesHasMore,
        vehiclesLoaded,
        stockLoaded,
        routesLoaded,
        salesLoaded,
        fetchVehicles,
        fetchStock,
        searchStock,
        fetchRoutes,
        fetchSales,
        searchSales,
        getSale,
        ensureVehicle,
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
        setRouteStatus,
        setVehicleStatus,
      }}
    >
      {children}
    </DeliwheelsContext.Provider>
  );
};

export const useDeliwheels = () => useContext(DeliwheelsContext);
