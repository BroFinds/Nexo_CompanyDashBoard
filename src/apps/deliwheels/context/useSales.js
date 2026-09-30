import { useCallback, useRef, useState } from "react";
import api, { getSession, fetchPage } from "@/services/api";

export const mapSaleDetail = (d) => ({
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

export const mapSale = (s) => ({
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

export const useSales = () => {
  const [sales, setSales] = useState([]);
  const [isLoadingSales, setIsLoadingSales] = useState(false);
  const [salesHasMore, setSalesHasMore] = useState(true);
  const [salesLoaded, setSalesLoaded] = useState(false);

  const salesPageRef = useRef(0);
  const salesInFlightRef = useRef(false);
  const salesHasMoreRef = useRef(true);
  const salesFiltersRef = useRef({}); // { vehicleUid?, fromDate?, toDate? }
  // Bumped on every searchSales call so an in-flight fetchSales whose
  // generation no longer matches will discard its response and re-issue
  // the request with the latest filters — fixes filter-change race.
  const salesSearchGenRef = useRef(0);

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

  const fetchAllSales = useCallback(async (filters = {}) => {
    const session = getSession();
    const params = {};
    if (filters.vehicleUid) params.vehicleUid = filters.vehicleUid;
    if (filters.fromDate) params.fromDate = filters.fromDate;
    if (filters.toDate) params.toDate = filters.toDate;
    const all = [];
    let page = 0;
    let last = false;
    while (!last) {
      const result = await fetchPage(
        `/api/v1/deliwheels/sales/company/${session.companyId}`,
        { page, params },
      );
      all.push(...result.items.map(mapSale));
      last = result.last;
      page++;
    }
    return all;
  }, []);

  const getSale = useCallback(async (saleUid) => {
    const session = getSession();
    const { data } = await api.get(
      `/api/v1/deliwheels/sales/company/${session.companyId}/${saleUid}`,
    );
    return mapSale(data);
  }, []);

  return {
    sales,
    isLoadingSales,
    salesHasMore,
    salesLoaded,
    fetchSales,
    searchSales,
    fetchAllSales,
    getSale,
  };
};
