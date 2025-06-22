import { useState, useEffect } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card } from "@/components/ui/card";

export const DateTimeWidget = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Card className="p-8 bg-white text-center professional-shadow border-0">
      <div className="space-y-4">
        <div className="text-5xl md:text-6xl lg:text-7xl font-black text-cgt-gray tracking-tight">
          {format(currentTime, "HH:mm", { locale: fr })}
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-cgt-red to-transparent w-1/2 mx-auto"></div>
        <div className="text-xl md:text-2xl text-cgt-gray font-semibold capitalize">
          {format(currentTime, "EEEE d MMMM yyyy", { locale: fr })}
        </div>
        <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">
          Heure officielle
        </div>
      </div>
    </Card>
  );
};
