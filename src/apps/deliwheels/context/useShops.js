import { useCallback, useRef, useState } from "react";
import api, { getSession, fetchPage } from "@/services/api";

export const mapShop = (s) => ({
  shop_uid: s.shopUid || s.shop_uid || "",
  route_uid: s.routeUid || s.route_uid || "",
  company_uid: s.companyUid || s.company_uid || "",
  shop_name: s.shopName || s.shop_name || "",
  shop_owner_name: s.shopOwnerName || s.shop_owner_name || "",
  shop_contact_number: s.shopContactNumber || s.shop_contact_number || "",
  status:
    s.isActive !== undefined
      ? s.isActive
        ? "active"
        : "inactive"
      : s.is_active !== undefined
        ? s.is_active
          ? "active"
          : "inactive"
        : "active",
  route_origin: s.route?.fromPlace || "",
  route_destination: s.route?.toPlace || "",
});

export const useShops = () => {
  const [shops, setShops] = useState([]);
  const [isLoadingShops, setIsLoadingShops] = useState(false);
  const [shopsHasMore, setShopsHasMore] = useState(true);
  const [shopsLoaded, setShopsLoaded] = useState(false);

  const shopsPageRef = useRef(0);
  const shopsInFlightRef = useRef(false);
  const shopsHasMoreRef = useRef(true);
  const shopsFiltersRef = useRef({});

  const fetchShops = useCallback(async () => {
    if (shopsInFlightRef.current || !shopsHasMoreRef.current) return;
    shopsInFlightRef.current = true;
    setIsLoadingShops(true);
    try {
      const session = getSession();
      const f = shopsFiltersRef.current;
      const params = {};
      if (f.routeUid) params.routeUid = f.routeUid;
      const { items, last } = await fetchPage(
        `/api/v1/deliwheels/shops/company/${session.companyId}`,
        { page: shopsPageRef.current, params },
      );
      const mapped = items.map(mapShop);
      setShops((prev) => {
        const seen = new Set(prev.map((s) => s.shop_uid));
        return [...prev, ...mapped.filter((s) => !seen.has(s.shop_uid))];
      });
      shopsPageRef.current += 1;
      shopsHasMoreRef.current = !last;
      setShopsHasMore(!last);
      setShopsLoaded(true);
    } catch (e) {
      console.error("fetchShops:", e);
    } finally {
      shopsInFlightRef.current = false;
      setIsLoadingShops(false);
    }
  }, []);

  const fetchAllShops = useCallback(async () => {
    while (shopsHasMoreRef.current) {
      const before = shopsPageRef.current;
      await fetchShops();
      if (shopsPageRef.current === before) break;
    }
  }, [fetchShops]);

  const filterShops = useCallback(
    async (filters = {}) => {
      shopsFiltersRef.current = filters;
      shopsPageRef.current = 0;
      shopsHasMoreRef.current = true;
      setShops([]);
      setShopsHasMore(true);
      setShopsLoaded(false);
      await fetchAllShops();
    },
    [fetchAllShops],
  );

  const refreshShops = useCallback(async () => {
    shopsFiltersRef.current = {};
    shopsPageRef.current = 0;
    shopsHasMoreRef.current = true;
    setShops([]);
    setShopsHasMore(true);
    setShopsLoaded(false);
    await fetchAllShops();
  }, [fetchAllShops]);

  const addShop = useCallback(async (formData) => {
    const session = getSession();
    try {
      const { data } = await api.post("/api/v1/deliwheels/shops", {
        companyUid: session.companyId,
        routeUid: formData.route_uid,
        shopName: formData.shop_name?.trim() || "",
        shopOwnerName: formData.shop_owner_name.trim(),
        shopContactNumber: formData.shop_contact_number.trim(),
        isActive: true,
      });
      const mapped = mapShop(data);
      setShops((prev) => [mapped, ...prev]);
      return mapped;
    } catch (e) {
      console.error("addShop:", e);
      throw e;
    }
  }, []);

  const updateShop = useCallback(async (formData) => {
    const session = getSession();
    const uid = formData.shop_uid;
    try {
      const { data } = await api.put(`/api/v1/deliwheels/shops/${uid}`, {
        companyUid: session.companyId,
        routeUid: formData.route_uid,
        shopName: formData.shop_name?.trim() || "",
        shopOwnerName: formData.shop_owner_name.trim(),
        shopContactNumber: formData.shop_contact_number.trim(),
      });
      const mapped = mapShop(data);
      setShops((prev) => prev.map((s) => (s.shop_uid === uid ? mapped : s)));
      return mapped;
    } catch (e) {
      console.error("updateShop:", e);
      throw e;
    }
  }, []);

  const setShopStatus = useCallback(async (uid, active) => {
    try {
      await api.patch(`/api/v1/deliwheels/shops/${uid}/status/${active}`);
      setShops((prev) =>
        prev.map((s) =>
          s.shop_uid === uid
            ? { ...s, status: active ? "active" : "inactive" }
            : s,
        ),
      );
    } catch (e) {
      console.error("setShopStatus:", e);
      throw e;
    }
  }, []);

  return {
    shops,
    isLoadingShops,
    shopsHasMore,
    shopsLoaded,
    fetchShops,
    fetchAllShops,
    filterShops,
    refreshShops,
    addShop,
    updateShop,
    setShopStatus,
  };
};
