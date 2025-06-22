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
    <Card className="p-6 bg-white text-center shadow-lg">
      <div className="space-y-2">
        <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800">
          {format(currentTime, "HH:mm", { locale: fr })}
        </div>
        <div className="text-lg md:text-xl text-gray-600">
          {format(currentTime, "EEEE d MMMM yyyy", { locale: fr })}
        </div>
      </div>
    </Card>
  );
};
