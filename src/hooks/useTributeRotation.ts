import { useState, useEffect } from "react";
import { getDashboardData, type Tribute } from "@/lib/storage";

export const useTributeRotation = (intervalMs: number = 30000) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [tributes, setTributes] = useState<Tribute[]>([]);

  useEffect(() => {
    const data = getDashboardData();
    setTributes(data.tributes);
  }, []);

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
