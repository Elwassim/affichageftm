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
      <Card className="p-8 bg-white text-center professional-shadow border-0">
        <div className="animate-pulse space-y-4">
          <div className="h-16 bg-gray-200 rounded-lg"></div>
          <div className="h-8 bg-gray-200 rounded-lg"></div>
          <div className="h-6 bg-gray-200 rounded-lg w-2/3 mx-auto"></div>
        </div>
      </Card>
    );
  }

  if (!weather) {
    return (
      <Card className="p-8 bg-white text-center professional-shadow border-0">
        <div className="text-gray-500 font-medium">Météo indisponible</div>
      </Card>
    );
  }

  return (
    <Card className="p-8 bg-white text-center professional-shadow border-0">
      <div className="space-y-4">
        <div className="text-6xl lg:text-7xl">{weather.icon}</div>
        <div className="text-4xl lg:text-5xl font-black text-cgt-gray">
          {weather.temperature}°C
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-cgt-red to-transparent w-1/2 mx-auto"></div>
        <div className="text-xl text-cgt-gray font-semibold capitalize">
          {weather.description}
        </div>
        <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">
          {weather.city}
        </div>
      </div>
    </Card>
  );
};
