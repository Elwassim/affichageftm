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
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-white text-center professional-shadow border-0 h-full flex flex-col justify-center">
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
