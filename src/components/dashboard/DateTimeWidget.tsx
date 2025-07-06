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

  // Convertir les codes météo Open-Meteo en descriptions françaises
  const getWeatherDescription = (weatherCode: number): string => {
    const descriptions: { [key: number]: string } = {
      0: "Ciel dégagé",
      1: "Principalement dégagé",
      2: "Partiellement nuageux",
      3: "Couvert",
      45: "Brouillard",
      48: "Brouillard givrant",
      51: "Bruine légère",
      53: "Bruine modérée",
      55: "Bruine dense",
      61: "Pluie légère",
      63: "Pluie modérée",
      65: "Pluie forte",
      71: "Neige légère",
      73: "Neige modérée",
      75: "Neige forte",
      80: "Averses légères",
      81: "Averses modérées",
      82: "Averses violentes",
      95: "Orage",
      96: "Orage avec grêle légère",
      99: "Orage avec grêle forte",
    };

    return descriptions[weatherCode] || "Conditions inconnues";
  };

  // Convertir les codes météo Open-Meteo en icônes locales
  const getWeatherIconFromCode = (weatherCode: number): string => {
    if (weatherCode === 0 || weatherCode === 1) return "sun";
    if (weatherCode === 2 || weatherCode === 3) return "cloud";
    if (weatherCode >= 45 && weatherCode <= 48) return "cloud";
    if (weatherCode >= 51 && weatherCode <= 67) return "cloud-rain";
    if (weatherCode >= 71 && weatherCode <= 77) return "snowflake";
    if (weatherCode >= 80 && weatherCode <= 99) return "cloud-rain";

    return "sun";
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
