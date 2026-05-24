import { useCallback, useEffect, useState } from "react";
import api, { getSession } from "@/services/api";

export const useDashboardSummary = ({ enabled = true } = {}) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSummary = useCallback(async () => {
    if (!enabled) return;
    const session = getSession();
    if (!session?.companyId) return;
    setIsLoading(true);
    setError(null);
    try {
      const { data: payload } = await api.get(
        `/api/v1/deliwheels/reports/dashboard/company/${session.companyId}`,
      );
      setData(payload);
    } catch (e) {
      console.error("useDashboardSummary:", e);
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "Failed to load dashboard summary",
      );
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { data, isLoading, error, refetch: fetchSummary };
};
