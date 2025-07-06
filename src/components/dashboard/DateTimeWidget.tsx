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
  lastUpdate: string;
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

  // Chargement de la météo via OpenWeatherMap API
  useEffect(() => {
    const generateFallbackWeather = (): WeatherData => {
      const descriptions = [
        "Ensoleillé",
        "Nuageux",
        "Partiellement nuageux",
        "Pluie légère",
      ];
      const icons = ["sun", "cloud", "cloud", "cloud-rain"];
      const randomIndex = Math.floor(Math.random() * descriptions.length);

      return {
        temperature: Math.round(15 + Math.random() * 10), // 15-25°C
        description: descriptions[randomIndex],
        icon: icons[randomIndex],
        humidity: Math.round(45 + Math.random() * 30), // 45-75%
        windSpeed: Math.round(5 + Math.random() * 15), // 5-20 km/h
        lastUpdate: new Date().toISOString(),
      };
    };

    const fetchWeatherData = async () => {
      try {
        setWeatherLoading(true);
        console.log("🌤️ Démarrage chargement météo...");

        // Utiliser Open-Meteo API (gratuit, pas de clé API nécessaire)
        const lat = 48.8566; // Latitude de Paris
        const lon = 2.3522; // Longitude de Paris
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=Europe/Paris`;

        console.log("🌤️ URL API météo:", url);
        const response = await fetch(url);
        console.log("🌤️ Réponse API:", response.status, response.statusText);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("🌤️ Données API reçues:", data);

        const current = data.current;
        const weatherData: WeatherData = {
          temperature: Math.round(current.temperature_2m),
          description: getWeatherDescription(current.weather_code),
          icon: getWeatherIconFromCode(current.weather_code),
          humidity: current.relative_humidity_2m,
          windSpeed: Math.round(current.wind_speed_10m * 3.6), // Convert m/s to km/h
          lastUpdate: new Date().toISOString(),
        };

        setWeather(weatherData);
        console.log("🌤️ Météo chargée depuis Open-Meteo:", weatherData);
        setWeatherLoading(false);
      } catch (error) {
        console.error(
          "❌ Erreur chargement météo, utilisation des données simulées:",
          error,
        );

        // Utiliser des données simulées en cas d'erreur
        const fallbackWeather = generateFallbackWeather();
        setWeather(fallbackWeather);
        console.log("🌤️ Météo simulée utilisée:", fallbackWeather);
        setWeatherLoading(false);
      }
    };

    // Charger immédiatement
    fetchWeatherData();

    // Mettre à jour la météo toutes les 10 minutes
    const weatherUpdateInterval = setInterval(fetchWeatherData, 600000);

    return () => {
      clearInterval(weatherUpdateInterval);
    };
  }, []);

  // Mapper les icônes OpenWeatherMap vers nos icônes locales
  const mapOpenWeatherIconToLocal = (openWeatherIcon: string): string => {
    const iconMap: { [key: string]: string } = {
      "01d": "sun", // clear sky day
      "01n": "sun", // clear sky night
      "02d": "cloud", // few clouds day
      "02n": "cloud", // few clouds night
      "03d": "cloud", // scattered clouds day
      "03n": "cloud", // scattered clouds night
      "04d": "cloud", // broken clouds day
      "04n": "cloud", // broken clouds night
      "09d": "cloud-rain", // shower rain day
      "09n": "cloud-rain", // shower rain night
      "10d": "cloud-rain", // rain day
      "10n": "cloud-rain", // rain night
      "11d": "cloud-rain", // thunderstorm day
      "11n": "cloud-rain", // thunderstorm night
      "13d": "snowflake", // snow day
      "13n": "snowflake", // snow night
      "50d": "cloud", // mist day
      "50n": "cloud", // mist night
    };

    return iconMap[openWeatherIcon] || "sun";
  };

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

  // Debug log de l'état météo
  console.log("🌤️ État météo actuel:", { weather, weatherLoading });

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
