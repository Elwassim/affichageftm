import { useState, useEffect } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Cloud, Sun, CloudRain, Snowflake, Thermometer } from "lucide-react";

interface WeatherData {
  temperature: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
}

export const DateTimeWidget = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  // Mise à jour de l'heure
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Chargement de la météo
  useEffect(() => {
    const loadWeather = async () => {
      try {
        setWeatherLoading(true);

        // Utiliser l'API OpenWeatherMap (gratuite)
        const API_KEY = "demo"; // Pour la démo, on utilisera des données simulées

        // Simuler des données météo réalistes pour Paris
        const mockWeatherData: WeatherData = {
          temperature: Math.round(15 + Math.random() * 10), // 15-25°C
          description: [
            "Ensoleillé",
            "Nuageux",
            "Partiellement nuageux",
            "Pluie légère",
          ][Math.floor(Math.random() * 4)],
          icon: ["sun", "cloud", "cloud-rain", "snowflake"][
            Math.floor(Math.random() * 4)
          ],
          humidity: Math.round(45 + Math.random() * 30), // 45-75%
          windSpeed: Math.round(5 + Math.random() * 15), // 5-20 km/h
        };

        setWeather(mockWeatherData);
        setWeatherLoading(false);

        console.log("🌤️ Météo Paris chargée:", mockWeatherData);
      } catch (error) {
        console.error("❌ Erreur chargement météo:", error);
        setWeatherLoading(false);
      }
    };

    // Charger immédiatement
    loadWeather();

    // Actualiser toutes les 10 minutes
    const weatherInterval = setInterval(loadWeather, 600000);

    return () => clearInterval(weatherInterval);
  }, []);

  // Icône météo selon le type
  const getWeatherIcon = (iconType: string) => {
    switch (iconType) {
      case "sun":
        return <Sun className="w-6 h-6 text-yellow-500" />;
      case "cloud":
        return <Cloud className="w-6 h-6 text-gray-500" />;
      case "cloud-rain":
        return <CloudRain className="w-6 h-6 text-blue-500" />;
      case "snowflake":
        return <Snowflake className="w-6 h-6 text-blue-300" />;
      default:
        return <Sun className="w-6 h-6 text-yellow-500" />;
    }
  };

  return (
    <Card className="p-3 bg-white text-center professional-shadow border-0 h-full flex flex-col">
      {/* Heure principale */}
      <div className="flex-1 flex flex-col justify-center space-y-2">
        <div className="text-3xl lg:text-4xl font-black text-cgt-gray tracking-tight">
          {format(currentTime, "HH:mm", { locale: fr })}
        </div>
        <div className="text-base lg:text-lg text-cgt-gray font-semibold capitalize">
          {format(currentTime, "EEE d MMM", { locale: fr })}
        </div>
      </div>

      {/* Séparateur */}
      <div className="h-px bg-gradient-to-r from-transparent via-cgt-red to-transparent w-3/4 mx-auto my-2"></div>

      {/* Météo Paris */}
      <div className="space-y-1">
        <div className="flex items-center justify-center gap-2">
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Paris
          </div>
          {!weatherLoading && weather && getWeatherIcon(weather.icon)}
        </div>

        {weatherLoading ? (
          <div className="text-sm text-gray-500">Chargement...</div>
        ) : weather ? (
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <Thermometer className="w-4 h-4 text-cgt-red" />
              <span className="text-lg font-bold text-cgt-gray">
                {weather.temperature}°C
              </span>
            </div>
            <div className="text-sm text-gray-600 font-medium">
              {weather.description}
            </div>
            <div className="text-xs text-gray-500">
              Humidité {weather.humidity}% • Vent {weather.windSpeed} km/h
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">Météo indisponible</div>
        )}
      </div>
    </Card>
  );
};
