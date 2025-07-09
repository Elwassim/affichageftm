import { useState, useEffect } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card } from "@/components/ui/card";

export const DateTimeWidget = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mise à jour de l'heure
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Card className="p-3 bg-white text-center professional-shadow border-0 h-full flex flex-col">
      {/* Heure principale */}
      <div className="flex-1 flex flex-col justify-center space-y-2">
        <div className="text-5xl lg:text-6xl font-black text-cgt-gray tracking-tight">
          {format(currentTime, "HH:mm", { locale: fr })}
        </div>
        <div className="text-xl lg:text-2xl text-cgt-gray font-semibold capitalize">
          {format(currentTime, "EEE d MMM", { locale: fr })}
        </div>
      </div>
    </Card>
  );
};
