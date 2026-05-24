import { useCallback, useEffect, useState } from "react";
import api, { getSession } from "@/services/api";

const toISODate = (d) => {
  const x = new Date(d);
  const tz = x.getTimezoneOffset() * 60000;
  return new Date(x.getTime() - tz).toISOString().slice(0, 10);
};

const normalizeRange = (fromDate, toDate) => {
  const to = toDate || toISODate(new Date());
  if (fromDate) return { fromDate, toDate: to };
  const from = new Date(to);
  from.setDate(from.getDate() - 29);
  return { fromDate: toISODate(from), toDate: to };
};

export const useOverviewReport = ({ enabled, fromDate, toDate } = {}) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReport = useCallback(async () => {
    if (!enabled) return;
    const session = getSession();
    if (!session?.companyId) return;
    const range = normalizeRange(fromDate, toDate);
    setIsLoading(true);
    setError(null);
    try {
      const params = { fromDate: range.fromDate, toDate: range.toDate };
      const { data: payload } = await api.get(
        `/api/v1/deliwheels/reports/overview/company/${session.companyId}`,
        { params },
      );
      setData(payload);
    } catch (e) {
      console.error("useOverviewReport:", e);
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "Failed to load overview report",
      );
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, fromDate, toDate]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  return { data, isLoading, error, refetch: fetchReport };
};
