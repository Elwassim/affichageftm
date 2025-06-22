import { Card } from "@/components/ui/card";
import { getDashboardData } from "@/lib/storage";
import { useRealTimeWeather } from "@/hooks/useRealTimeUpdates";
import { RefreshCw } from "lucide-react";

export const WeatherWidget = () => {
  const { weatherCity } = getDashboardData();
  const { weather, isLoading, lastFetch, error, refetch } = useRealTimeWeather(
    weatherCity,
    60000,
  ); // 1 minute

  const formatLastUpdate = () => {
    if (!lastFetch) return "Jamais";
    const now = new Date();
    const diffMs = now.getTime() - lastFetch.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);

    if (diffSeconds < 60) return `Il y a ${diffSeconds}s`;
    if (diffMinutes < 60) return `Il y a ${diffMinutes}min`;
    return lastFetch.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading && !weather) {
    return (
      <Card className="p-4 bg-white text-center professional-shadow border-0 h-full flex flex-col justify-center">
        <div className="animate-pulse space-y-2">
          <div className="h-8 bg-gray-200 rounded-lg"></div>
          <div className="h-4 bg-gray-200 rounded-lg"></div>
          <div className="h-3 bg-gray-200 rounded-lg w-2/3 mx-auto"></div>
        </div>
        <div className="text-xs text-gray-400 mt-2">
          Synchronisation météo...
        </div>
      </Card>
    );
  }

  if (error || !weather) {
    return (
      <Card className="p-4 bg-white text-center professional-shadow border-0 h-full flex flex-col justify-center">
        <div className="text-gray-500 font-medium text-sm mb-2">
          {error || "Météo indisponible"}
        </div>
        <button
          onClick={refetch}
          className="text-xs text-cgt-red hover:text-cgt-red-dark font-medium"
          disabled={isLoading}
        >
          {isLoading ? "Synchronisation..." : "🔄 Actualiser"}
        </button>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-white text-center professional-shadow border-0 h-full flex flex-col justify-center relative">
      {/* Real-time indicator with sync status */}
      <div className="absolute top-2 right-2 flex items-center gap-1">
        <RefreshCw
          className={`w-3 h-3 ${
            isLoading
              ? "text-orange-500 animate-spin"
              : error
                ? "text-red-500"
                : "text-green-500"
          }`}
        />
        <span className={`text-xs ${error ? "text-red-400" : "text-gray-400"}`}>
          {formatLastUpdate()}
        </span>
      </div>

      {/* Manual refresh button */}
      <button
        onClick={refetch}
        className="absolute top-2 left-2 text-xs text-gray-400 hover:text-cgt-red transition-colors"
        disabled={isLoading}
        title="Actualiser la météo"
      >
        🔄
      </button>

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
        {/* Live indicator */}
        <div className="flex items-center justify-center gap-1 mt-1">
          <div
            className={`w-2 h-2 rounded-full ${
              isLoading
                ? "bg-orange-400 animate-pulse"
                : error
                  ? "bg-red-400"
                  : "bg-green-400"
            }`}
          ></div>
          <span className="text-xs text-gray-400">
            {isLoading ? "Sync..." : error ? "Erreur" : "Live"}
          </span>
        </div>
      </div>
    </Card>
  );
};
