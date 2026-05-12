import { useCallback, useRef, useState } from "react";
import api, { getSession, fetchPage } from "@/services/api";

export const mapRoute = (r) => {
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

export const useRoutes = () => {
  const [routes, setRoutes] = useState([]);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
  const [routesHasMore, setRoutesHasMore] = useState(true);
  const [routesLoaded, setRoutesLoaded] = useState(false);

  const routesPageRef = useRef(0);
  const routesInFlightRef = useRef(false);
  const routesHasMoreRef = useRef(true);

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

  return {
    routes,
    isLoadingRoutes,
    routesHasMore,
    routesLoaded,
    fetchRoutes,
    refreshRoutes,
    addRoute,
    updateRoute,
    setRouteStatus,
    deleteRoute,
  };
};
