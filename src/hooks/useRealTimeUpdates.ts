import { useState, useEffect, useCallback } from "react";

interface RealTimeConfig {
  interval: number; // Update interval in milliseconds
  enableWeather: boolean;
  enableDashboard: boolean;
}

const DEFAULT_CONFIG: RealTimeConfig = {
  interval: 60000, // 1 minute
  enableWeather: true,
  enableDashboard: true,
};

export const useRealTimeUpdates = (config: Partial<RealTimeConfig> = {}) => {
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateCount, setUpdateCount] = useState(0);

  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  const triggerUpdate = useCallback(() => {
    setIsUpdating(true);
    setLastUpdate(new Date());
    setUpdateCount((prev) => prev + 1);

    // Simulate update process
    setTimeout(() => {
      setIsUpdating(false);
    }, 500);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      triggerUpdate();
    }, finalConfig.interval);

    return () => clearInterval(interval);
  }, [finalConfig.interval, triggerUpdate]);

  // Force update function
  const forceUpdate = useCallback(() => {
    triggerUpdate();
  }, [triggerUpdate]);

  return {
    lastUpdate,
    isUpdating,
    updateCount,
    forceUpdate,
    config: finalConfig,
  };
};

// Real-time weather updates
export const useRealTimeWeather = (city: string, interval: number = 300000) => {
  // 5 minutes
  const [weather, setWeather] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  const fetchWeather = useCallback(async () => {
    if (!city) return;

    setIsLoading(true);
    try {
      // Import weather function dynamically to avoid circular imports
      const { fetchWeather } = await import("@/lib/weather");
      const weatherData = await fetchWeather(city);

      if (weatherData) {
        setWeather(weatherData);
        setLastFetch(new Date());
      }
    } catch (error) {
      console.error("Failed to fetch real-time weather:", error);
    } finally {
      setIsLoading(false);
    }
  }, [city]);

  useEffect(() => {
    fetchWeather();

    const intervalId = setInterval(fetchWeather, interval);

    return () => clearInterval(intervalId);
  }, [fetchWeather, interval]);

  return {
    weather,
    isLoading,
    lastFetch,
    refetch: fetchWeather,
  };
};

// Real-time dashboard data updates
export const useRealTimeDashboard = (interval: number = 30000) => {
  // 30 seconds
  const [dashboardData, setDashboardData] = useState(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const syncDashboard = useCallback(async () => {
    try {
      // Import storage function dynamically
      const { getDashboardData } = await import("@/lib/storage");
      const data = getDashboardData();

      setDashboardData(data);
      setLastSync(new Date());
    } catch (error) {
      console.error("Failed to sync dashboard data:", error);
    }
  }, []);

  useEffect(() => {
    syncDashboard();

    const intervalId = setInterval(syncDashboard, interval);

    return () => clearInterval(intervalId);
  }, [syncDashboard, interval]);

  return {
    dashboardData,
    lastSync,
    syncDashboard,
  };
};
