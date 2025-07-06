import { useState, useEffect } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Cloud, Sun, CloudRain, Snowflake, Thermometer } from "lucide-react";
import { getConfig, updateConfig } from "@/lib/database";

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

  // Chargement de la météo synchronisée
  useEffect(() => {
    const loadWeatherFromDB = async () => {
      try {
        setWeatherLoading(true);

        // Charger depuis la configuration
        const weatherData = await getConfig("weatherData");
        if (weatherData) {
          const parsed = JSON.parse(weatherData);
          setWeather(parsed);
          console.log("🌤️ Météo chargée depuis BDD:", parsed);
        }

        setWeatherLoading(false);
      } catch (error) {
        console.error("❌ Erreur chargement météo:", error);
        setWeatherLoading(false);
      }
    };

    const updateWeatherData = async () => {
      try {
        // Générer de nouvelles données météo réalistes
        const newWeatherData: WeatherData = {
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
          lastUpdate: new Date().toISOString(),
        };

        // Sauvegarder en BDD
        await updateConfig("weatherData", JSON.stringify(newWeatherData));
        setWeather(newWeatherData);

        // Émettre événement de synchronisation
        window.dispatchEvent(
          new CustomEvent("cgt-config-updated", {
            detail: { key: "weatherData", value: newWeatherData },
          }),
        );

        console.log("🌤️ Météo mise à jour et synchronisée:", newWeatherData);
      } catch (error) {
        console.error("❌ Erreur mise à jour météo:", error);
      }
    };

    // Charger immédiatement
    loadWeatherFromDB();

    // Mettre à jour les données météo toutes les 10 minutes
    const weatherUpdateInterval = setInterval(updateWeatherData, 600000);

    // Écouter les changements de configuration
    const handleConfigUpdate = (event: CustomEvent) => {
      if (event.detail.key === "weatherData") {
        if (typeof event.detail.value === "object") {
          setWeather(event.detail.value);
        } else if (typeof event.detail.value === "string") {
          try {
            setWeather(JSON.parse(event.detail.value));
          } catch (error) {
            loadWeatherFromDB();
          }
        }
      }
    };

    window.addEventListener(
      "cgt-config-updated",
      handleConfigUpdate as EventListener,
    );

    return () => {
      clearInterval(weatherUpdateInterval);
      window.removeEventListener(
        "cgt-config-updated",
        handleConfigUpdate as EventListener,
      );
    };
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
