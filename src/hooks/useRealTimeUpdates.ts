import { useState, useEffect, useCallback } from "react";

interface RealTimeConfig {
  interval: number; // Update interval in milliseconds
  enableDashboard: boolean;
}

const DEFAULT_CONFIG: RealTimeConfig = {
  interval: 60000, // 1 minute
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
  };
};
