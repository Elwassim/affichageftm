import { useState, useEffect } from "react";
import { getDashboardDataFromDB, type DashboardData } from "@/lib/database";

export const useDatabase = (
  autoRefresh: boolean = true,
  interval: number = 30000,
) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setError(null);
      const result = await getDashboardDataFromDB();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    if (autoRefresh && interval > 0) {
      const timer = setInterval(fetchData, interval);
      return () => clearInterval(timer);
    }
  }, [autoRefresh, interval]);

  return {
    data,
    loading,
    error,
    refresh: fetchData,
  };
};
