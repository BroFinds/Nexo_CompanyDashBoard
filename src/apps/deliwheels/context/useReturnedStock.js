import { useCallback, useRef, useState } from "react";
import { getSession, fetchPage } from "@/services/api";

export const mapReturnedStock = (r) => ({
  returned_stock_uid: r.returnedStockUid || r.returned_stock_uid || "",
  product_uid: r.productUid || r.product_uid || "",
  product_name: r.productName || r.product_name || "",
  vehicle_uid: r.vehicleUid || r.vehicle_uid || "",
  vehicle_number: r.vehicleNumber || r.vehicle_number || "",
  company_uid: r.companyUid || r.company_uid || "",
  returned_qty: parseFloat(r.returnedStockQty ?? r.returned_stock_qty ?? r.returnedQty ?? 0) || 0,
  stock_added_date: (r.stockAddedDate || r.stock_added_date || "").split("T")[0],
  created_by: r.createdBy || r.created_by || "",
  is_active: r.isActive !== undefined ? r.isActive : true,
});

export const useReturnedStock = () => {
  const [returnedStock, setReturnedStock] = useState([]);
  const [isLoadingReturns, setIsLoadingReturns] = useState(false);
  const [returnsHasMore, setReturnsHasMore] = useState(true);
  const [returnsLoaded, setReturnsLoaded] = useState(false);

  const pageRef = useRef(0);
  const inFlightRef = useRef(false);
  const hasMoreRef = useRef(true);
  const filtersRef = useRef({});

  const fetchReturns = useCallback(async () => {
    if (inFlightRef.current || !hasMoreRef.current) return;
    inFlightRef.current = true;
    setIsLoadingReturns(true);
    try {
      const session = getSession();
      const f = filtersRef.current;
      const params = {};
      if (f.vehicleUid) params.vehicleUid = f.vehicleUid;
      if (f.fromDate) params.fromDate = f.fromDate;
      if (f.toDate) params.toDate = f.toDate;
      const { items, last } = await fetchPage(
        `/api/v1/deliwheels/returned-stock/company/${session.companyId}`,
        { page: pageRef.current, params },
      );
      const mapped = items.map(mapReturnedStock);
      setReturnedStock((prev) => {
        const seen = new Set(prev.map((r) => r.returned_stock_uid));
        return [...prev, ...mapped.filter((r) => !seen.has(r.returned_stock_uid))];
      });
      pageRef.current += 1;
      hasMoreRef.current = !last;
      setReturnsHasMore(!last);
      setReturnsLoaded(true);
    } catch (e) {
      console.error("fetchReturns:", e);
    } finally {
      inFlightRef.current = false;
      setIsLoadingReturns(false);
    }
  }, []);

  const searchReturns = useCallback(
    async (filters = {}) => {
      filtersRef.current = filters;
      pageRef.current = 0;
      hasMoreRef.current = true;
      setReturnedStock([]);
      setReturnsHasMore(true);
      setReturnsLoaded(false);
      await fetchReturns();
    },
    [fetchReturns],
  );

  return {
    returnedStock,
    isLoadingReturns,
    returnsHasMore,
    returnsLoaded,
    fetchReturns,
    searchReturns,
  };
};
