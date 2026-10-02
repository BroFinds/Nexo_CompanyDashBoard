import { useCallback, useRef, useState } from "react";
import api, { getSession, fetchPage } from "@/services/api";

// Spring's LocalDateTime deserializer rejects the trailing "Z" that
// Date.toISOString() produces. Emit "yyyy-MM-ddTHH:mm:ss.SSS" instead.
const toLocalDateTime = (d = new Date()) =>
  new Date(d).toISOString().replace(/Z$/, "");

export const mapStockAdded = (s) => ({
  stock_uid: s.stockUid || s.stock_uid || "",
  product_uid: s.productUid || s.product_uid || "",
  product_name: s.productName || s.product_name || "",
  vehicle_uid: s.vehicleUid || s.vehicle_uid || "",
  vehicle_number: s.vehicleNumber || s.vehicle_number || "",
  company_uid: s.companyUid || s.company_uid || "",
  quantity: parseInt(s.totalQuantity ?? s.total_quantity ?? s.quantity ?? 0, 10) || 0,
  delivered_quantity: parseFloat(s.deliveredQuantity ?? s.delivered_quantity ?? 0) || 0,
  remaining_quantity: parseFloat(s.remainingQuantity ?? s.remaining_quantity ?? s.totalQuantity ?? s.total_quantity ?? s.quantity ?? 0) || 0,
  loaded_date: (s.stockAddedDate || s.stock_added_date || s.createdAt || "").split("T")[0],
  is_delivery_complete: !!(s.isDeliveryComplete ?? s.is_delivery_complete ?? false),
  created_at: s.createdAt || "",
  updated_at: s.updatedAt || "",
});

export const useStock = () => {
  const [stock, setStock] = useState([]);
  const [isLoadingStock, setIsLoadingStock] = useState(false);
  const [stockHasMore, setStockHasMore] = useState(true);
  const [stockLoaded, setStockLoaded] = useState(false);

  const stockPageRef = useRef(0);
  const stockInFlightRef = useRef(false);
  const stockHasMoreRef = useRef(true);
  const stockFiltersRef = useRef({}); // { vehicleUid?, productUid?, fromDate?, toDate? }

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

  const fetchAllStock = useCallback(async (filters = {}) => {
    const session = getSession();
    const params = {};
    if (filters.vehicleUid) params.vehicleUid = filters.vehicleUid;
    if (filters.productUid) params.productUid = filters.productUid;
    if (filters.fromDate) params.fromDate = filters.fromDate;
    if (filters.toDate) params.toDate = filters.toDate;
    const all = [];
    let page = 0;
    let last = false;
    while (!last) {
      const result = await fetchPage(
        `/api/v1/deliwheels/stock-added/company/${session.companyId}`,
        { page, params },
      );
      all.push(...result.items.map(mapStockAdded));
      last = result.last;
      page++;
    }
    return all;
  }, []);

  const addStockLoading = useCallback(
    async (productUid, quantity, vehicleUid) => {
      const session = getSession();
      try {
        const { data } = await api.post("/api/v1/deliwheels/stock-added", {
          companyUid: session.companyId,
          vehicleUid,
          productUid,
          totalQuantity: quantity,
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
        totalQuantity: updatedEntry.quantity,
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

  const fetchStockLogs = useCallback(async (stockUid) => {
    const { data } = await api.get(`/api/v1/deliwheels/stock-added/${stockUid}/logs`);
    return data;
  }, []);

  const deleteStockEntry = useCallback(async (stockUid) => {
    await api.delete(`/api/v1/deliwheels/stock-added/${stockUid}`);
    setStock((prev) => prev.filter((s) => s.stock_uid !== stockUid));
  }, []);

  return {
    stock,
    isLoadingStock,
    stockHasMore,
    stockLoaded,
    fetchStock,
    searchStock,
    refreshStock,
    fetchAllStock,
    addStockLoading,
    updateStock,
    fetchStockLogs,
    deleteStockEntry,
  };
};
