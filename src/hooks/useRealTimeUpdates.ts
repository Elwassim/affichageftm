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
export const useRealTimeWeather = (city: string, interval: number = 60000) => {
  // 1 minute for better sync
  const [weather, setWeather] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchWeatherData = useCallback(async () => {
    if (!city) return;

    setIsLoading(true);
    setError(null);

    try {
      // Import weather function dynamically to avoid circular imports
      const { fetchWeather } = await import("@/lib/weather");
      const weatherData = await fetchWeather(city);

      if (weatherData) {
        setWeather(weatherData);
        setLastFetch(new Date());
        console.log(`Weather updated for ${city}:`, weatherData);
      } else {
        setError("Impossible de récupérer la météo");
      }
    } catch (error) {
      console.error("Failed to fetch real-time weather:", error);
      setError("Erreur de connexion météo");
    } finally {
      setIsLoading(false);
    }
  }, [city]);

  useEffect(() => {
    // Initial fetch
    fetchWeatherData();

    // Set up interval for regular updates
    const intervalId = setInterval(() => {
      console.log(`Refreshing weather for ${city}...`);
      fetchWeatherData();
    }, interval);

    return () => clearInterval(intervalId);
  }, [fetchWeatherData, interval]);

  // Force refresh function
  const forceRefresh = useCallback(() => {
    console.log(`Force refreshing weather for ${city}...`);
    fetchWeatherData();
  }, [fetchWeatherData]);

  return {
    weather,
    isLoading,
    lastFetch,
    error,
    refetch: forceRefresh,
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
