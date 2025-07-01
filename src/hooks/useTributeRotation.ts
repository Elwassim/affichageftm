import { useState, useEffect } from "react";
import { getDashboardData, type Tribute } from "@/lib/storage";

export const useTributeRotation = (intervalMs: number = 30000) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [tributes, setTributes] = useState<Tribute[]>([]);

  // Update tributes data periodically
  useEffect(() => {
    const updateData = () => {
      try {
        const data = getDashboardData();
        setTributes(data.tributes || []);
      } catch (error) {
        console.error("Error loading tributes:", error);
        setTributes([]);
      }
    };

    updateData();
    const dataTimer = setInterval(updateData, 5000); // Check for updates every 5 seconds

    return () => clearInterval(dataTimer);
  }, []);

  // Reset index if tributes list changes
  useEffect(() => {
    if (currentIndex >= tributes.length && tributes.length > 0) {
      setCurrentIndex(0);
    }
  }, [tributes.length, currentIndex]);

  // Rotation timer
  useEffect(() => {
    if (tributes.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % tributes.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [tributes.length, intervalMs]);

  const currentTribute = tributes.length > 0 ? tributes[currentIndex] : null;

  return {
    currentTribute,
    totalTributes: tributes.length,
    currentIndex,
  };
};
