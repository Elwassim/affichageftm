import { Card } from "@/components/ui/card";
import { getDashboardData } from "@/lib/storage";
import { useRealTimeWeather } from "@/hooks/useRealTimeUpdates";
import { RefreshCw } from "lucide-react";

export const WeatherWidget = () => {
  const { weatherCity } = getDashboardData();
  const { weather, isLoading, lastFetch, refetch } = useRealTimeWeather(
    weatherCity,
    300000,
  ); // 5 minutes

  const formatLastUpdate = () => {
    if (!lastFetch) return "";
    return `Màj: ${lastFetch.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  if (isLoading && !weather) {
    return (
      <Card className="p-4 bg-white text-center professional-shadow border-0 h-full flex flex-col justify-center">
        <div className="animate-pulse space-y-2">
          <div className="h-8 bg-gray-200 rounded-lg"></div>
          <div className="h-4 bg-gray-200 rounded-lg"></div>
          <div className="h-3 bg-gray-200 rounded-lg w-2/3 mx-auto"></div>
        </div>
      </Card>
    );
  }

  if (!weather) {
    return (
      <Card className="p-4 bg-white text-center professional-shadow border-0 h-full flex flex-col justify-center">
        <div className="text-gray-500 font-medium text-sm">
          Météo indisponible
        </div>
        <button
          onClick={refetch}
          className="mt-2 text-xs text-cgt-red hover:text-cgt-red-dark"
        >
          Réessayer
        </button>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-white text-center professional-shadow border-0 h-full flex flex-col justify-center relative">
      {/* Real-time indicator */}
      <div className="absolute top-2 right-2 flex items-center gap-1">
        <RefreshCw
          className={`w-3 h-3 text-green-500 ${isLoading ? "animate-spin" : ""}`}
        />
        <span className="text-xs text-gray-400">{formatLastUpdate()}</span>
      </div>

      <div className="space-y-2">
        <div className="text-3xl lg:text-4xl">{weather.icon}</div>
        <div className="text-2xl lg:text-3xl font-black text-cgt-gray">
          {weather.temperature}°C
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-cgt-red to-transparent w-1/2 mx-auto"></div>
        <div className="text-sm lg:text-base text-cgt-gray font-semibold capitalize">
          {weather.description}
        </div>
        <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">
          {weather.city}
        </div>
      </div>
    </Card>
  );
};
