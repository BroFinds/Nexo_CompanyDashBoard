import { useCallback, useEffect, useRef, useState } from "react";
import api, { getSession, fetchPage } from "@/services/api";
import { mapRoute } from "./useRoutes";

// ── Vehicles cache (localStorage, scoped per company) ────────────────────────
// Vehicle details change rarely, so we download them once and serve every
// consumer from cache. The cache is invalidated on logout (api.js →
// clearSession) and rewritten whenever vehicles mutate locally.

const VEHICLES_CACHE_KEY = "nexo_vehicles_cache";

const readVehiclesCache = () => {
  try {
    const session = getSession();
    if (!session?.companyId) return null;
    const raw = localStorage.getItem(VEHICLES_CACHE_KEY);
    if (!raw) return null;
    const cache = JSON.parse(raw);
    if (cache?.companyId !== session.companyId) return null;
    return Array.isArray(cache.vehicles) ? cache.vehicles : null;
  } catch {
    return null;
  }
};

const writeVehiclesCache = (vehicles) => {
  try {
    const session = getSession();
    if (!session?.companyId) return;
    localStorage.setItem(
      VEHICLES_CACHE_KEY,
      JSON.stringify({
        companyId: session.companyId,
        vehicles,
        cachedAt: Date.now(),
      }),
    );
  } catch (e) {
    console.error("writeVehiclesCache:", e);
  }
};

export const mapVehicle = (v) => {
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

export const useVehicles = () => {
  const [vehicles, setVehicles] = useState(() => readVehiclesCache() || []);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);
  const [vehiclesHasMore, setVehiclesHasMore] = useState(
    () => !readVehiclesCache(),
  );
  const [vehiclesLoaded, setVehiclesLoaded] = useState(
    () => !!readVehiclesCache(),
  );

  const vehiclesPageRef = useRef(0);
  const vehiclesInFlightRef = useRef(false);
  const vehiclesHasMoreRef = useRef(!readVehiclesCache());
  const vehicleFetchesRef = useRef(new Map()); // uid -> Promise

  // Persist the vehicle list to localStorage once the full list is loaded and
  // again on every subsequent mutation. While paginating, vehiclesHasMore is
  // still true, so partial pages don't get cached.
  useEffect(() => {
    if (vehiclesLoaded && !vehiclesHasMore) {
      writeVehiclesCache(vehicles);
    }
  }, [vehicles, vehiclesLoaded, vehiclesHasMore]);

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

  const fetchAllVehicles = useCallback(async () => {
    while (vehiclesHasMoreRef.current) {
      const before = vehiclesPageRef.current;
      await fetchVehicles();
      if (vehiclesPageRef.current === before) break;
    }
  }, [fetchVehicles]);

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
      const withUsername = {
        ...mapped,
        username: mapped.username || formData.username || "",
      };
      setVehicles((prev) => [withUsername, ...prev]);
      return withUsername;
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

  const assignRoute = useCallback(async (vehicleUid, routeUid) => {
    try {
      const { data } = await api.patch(
        `/api/v1/deliwheels/vehicles/${vehicleUid}/route/${routeUid}`,
      );
      const mapped = mapVehicle(data);
      setVehicles((prev) =>
        prev.map((v) =>
          v.vehicle_uid === vehicleUid ? { ...v, route_uid: mapped.route_uid } : v,
        ),
      );
      return mapped;
    } catch (e) {
      console.error("assignRoute:", e);
      throw e;
    }
  }, []);

  return {
    vehicles,
    isLoadingVehicles,
    vehiclesHasMore,
    vehiclesLoaded,
    fetchVehicles,
    fetchAllVehicles,
    ensureVehicle,
    refreshVehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    setVehicleStatus,
    assignRoute,
  };
};
