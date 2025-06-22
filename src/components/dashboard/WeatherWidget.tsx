import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { fetchWeather, WeatherData } from "@/lib/weather";
import { getDashboardData } from "@/lib/storage";

export const WeatherWidget = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWeather = async () => {
      const { weatherCity } = getDashboardData();
      const weatherData = await fetchWeather(weatherCity);
      setWeather(weatherData);
      setLoading(false);
    };

    loadWeather();

    // Refresh weather every 30 minutes
    const interval = setInterval(loadWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card className="p-6 bg-white text-center shadow-lg">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded mb-4"></div>
          <div className="h-6 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  if (!weather) {
    return (
      <Card className="p-6 bg-white text-center shadow-lg">
        <div className="text-gray-500">Météo indisponible</div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white text-center shadow-lg">
      <div className="space-y-3">
        <div className="text-4xl">{weather.icon}</div>
        <div className="text-3xl font-bold text-gray-800">
          {weather.temperature}°C
        </div>
        <div className="text-lg text-gray-600 capitalize">
          {weather.description}
        </div>
        <div className="text-sm text-gray-500">{weather.city}</div>
      </div>
    </Card>
  );
};
