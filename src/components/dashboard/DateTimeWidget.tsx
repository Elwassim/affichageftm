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
    <Card className="p-4 bg-white text-center professional-shadow border-0 h-full flex flex-col justify-center">
      <div className="space-y-2">
        <div className="text-4xl lg:text-5xl font-black text-cgt-gray tracking-tight">
          {format(currentTime, "HH:mm", { locale: fr })}
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-cgt-red to-transparent w-1/2 mx-auto"></div>
        <div className="text-lg lg:text-xl text-cgt-gray font-semibold capitalize">
          {format(currentTime, "EEE d MMM yyyy", { locale: fr })}
        </div>
        <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">
          Heure officielle
        </div>
      </div>
    </Card>
  );
};
