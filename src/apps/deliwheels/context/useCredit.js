import { useCallback, useState } from "react";
import api, { getSession } from "@/services/api";

export const useCredit = () => {
  const [creditSummary, setCreditSummary] = useState([]);
  const [creditSales, setCreditSales] = useState([]);
  const [creditPayments, setCreditPayments] = useState([]);
  const [isLoadingCredit, setIsLoadingCredit] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [creditError, setCreditError] = useState(null);

  const fetchCreditSummary = useCallback(async () => {
    const session = getSession();
    if (!session?.companyId) return;
    setIsLoadingCredit(true);
    setCreditError(null);
    try {
      const { data } = await api.get(`/api/v1/deliwheels/credits/company/${session.companyId}`);
      setCreditSummary(Array.isArray(data) ? data : []);
    } catch (e) {
      setCreditError(e?.response?.data?.message ?? "Failed to load credit data");
    } finally {
      setIsLoadingCredit(false);
    }
  }, []);

  const fetchCreditDetail = useCallback(async (shopUid) => {
    const session = getSession();
    if (!session?.companyId || !shopUid) return;
    setIsLoadingDetail(true);
    try {
      const [salesRes, paymentsRes] = await Promise.all([
        api.get(`/api/v1/deliwheels/credits/shop/${shopUid}/sales?companyUid=${session.companyId}`),
        api.get(`/api/v1/deliwheels/credits/shop/${shopUid}/payments?companyUid=${session.companyId}`),
      ]);
      setCreditSales(Array.isArray(salesRes.data) ? salesRes.data : []);
      setCreditPayments(Array.isArray(paymentsRes.data) ? paymentsRes.data : []);
    } catch (e) {
      console.error("fetchCreditDetail:", e);
    } finally {
      setIsLoadingDetail(false);
    }
  }, []);

  const addPayment = useCallback(async (shopUid, amount, note) => {
    const session = getSession();
    if (!session?.companyId) return;
    await api.post(`/api/v1/deliwheels/credits/shop/${shopUid}/payments`, {
      shopUid,
      companyUid: session.companyId,
      amount: parseFloat(amount),
      note: note || null,
    });
    // Refresh both summary and detail
    await Promise.all([fetchCreditSummary(), fetchCreditDetail(shopUid)]);
  }, [fetchCreditSummary, fetchCreditDetail]);

  const deletePayment = useCallback(async (paymentUid, shopUid) => {
    const session = getSession();
    if (!session?.companyId) return;
    await api.delete(`/api/v1/deliwheels/credits/payments/${paymentUid}?companyUid=${session.companyId}`);
    await Promise.all([fetchCreditSummary(), fetchCreditDetail(shopUid)]);
  }, [fetchCreditSummary, fetchCreditDetail]);

  return {
    creditSummary,
    creditSales,
    creditPayments,
    isLoadingCredit,
    isLoadingDetail,
    creditError,
    fetchCreditSummary,
    fetchCreditDetail,
    addPayment,
    deletePayment,
  };
};
