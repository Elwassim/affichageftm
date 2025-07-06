import React, { useState, useEffect } from "react";
import { Cloud, Save, RefreshCw, Thermometer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getConfig, updateConfig } from "@/lib/database";

interface WeatherData {
  temperature: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  lastUpdate: string;
}

export const WeatherAdmin: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData>({
    temperature: 18,
    description: "Partiellement nuageux",
    icon: "cloud",
    humidity: 65,
    windSpeed: 12,
    lastUpdate: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Charger les données météo existantes
  useEffect(() => {
    const loadWeatherData = async () => {
      try {
        setLoading(true);
        const data = await getConfig("weatherData");
        if (data) {
          setWeatherData(JSON.parse(data));
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données météo:", error);
      } finally {
        setLoading(false);
      }
    };

    loadWeatherData();
  }, []);

  // Sauvegarder les modifications
  const handleSave = async () => {
    try {
      setSaving(true);

      const updatedData = {
        ...weatherData,
        lastUpdate: new Date().toISOString(),
      };

      await updateConfig("weatherData", JSON.stringify(updatedData));

      // Émettre événement de synchronisation
      window.dispatchEvent(
        new CustomEvent("cgt-config-updated", {
          detail: { key: "weatherData", value: updatedData },
        }),
      );

      toast({
        title: "Succès",
        description: "Données météo mises à jour avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les données météo.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Générer des données météo aléatoires
  const handleRandomWeather = () => {
    const descriptions = [
      "Ensoleillé",
      "Nuageux",
      "Partiellement nuageux",
      "Pluie légère",
      "Orageux",
      "Brumeux",
    ];

    const icons = ["sun", "cloud", "cloud-rain", "snowflake"];

    const newData = {
      temperature: Math.round(10 + Math.random() * 20), // 10-30°C
      description:
        descriptions[Math.floor(Math.random() * descriptions.length)],
      icon: icons[Math.floor(Math.random() * icons.length)],
      humidity: Math.round(40 + Math.random() * 40), // 40-80%
      windSpeed: Math.round(5 + Math.random() * 20), // 5-25 km/h
      lastUpdate: new Date().toISOString(),
    };

    setWeatherData(newData);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin text-cgt-red" />
          <span className="ml-2 text-gray-600">Chargement...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="admin-section-header">
        <div className="admin-section-title">
          <div className="admin-section-icon bg-blue-100">
            <Cloud className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Gestion de la météo
            </h2>
            <p className="text-gray-600">
              Configurez les données météo affichées avec l'heure
            </p>
          </div>
        </div>
      </div>

      {/* Configuration Form */}
      <Card className="p-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Température */}
            <div className="space-y-2">
              <Label htmlFor="temperature">Température (°C)</Label>
              <Input
                id="temperature"
                type="number"
                value={weatherData.temperature}
                onChange={(e) =>
                  setWeatherData({
                    ...weatherData,
                    temperature: parseInt(e.target.value) || 0,
                  })
                }
                min="-20"
                max="50"
              />
            </div>

            {/* Humidité */}
            <div className="space-y-2">
              <Label htmlFor="humidity">Humidité (%)</Label>
              <Input
                id="humidity"
                type="number"
                value={weatherData.humidity}
                onChange={(e) =>
                  setWeatherData({
                    ...weatherData,
                    humidity: parseInt(e.target.value) || 0,
                  })
                }
                min="0"
                max="100"
              />
            </div>

            {/* Vitesse du vent */}
            <div className="space-y-2">
              <Label htmlFor="windSpeed">Vitesse du vent (km/h)</Label>
              <Input
                id="windSpeed"
                type="number"
                value={weatherData.windSpeed}
                onChange={(e) =>
                  setWeatherData({
                    ...weatherData,
                    windSpeed: parseInt(e.target.value) || 0,
                  })
                }
                min="0"
                max="200"
              />
            </div>

            {/* Icône météo */}
            <div className="space-y-2">
              <Label htmlFor="icon">Type de météo</Label>
              <select
                id="icon"
                value={weatherData.icon}
                onChange={(e) =>
                  setWeatherData({ ...weatherData, icon: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="sun">☀️ Ensoleillé</option>
                <option value="cloud">☁️ Nuageux</option>
                <option value="cloud-rain">🌧️ Pluvieux</option>
                <option value="snowflake">❄️ Neigeux</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={weatherData.description}
              onChange={(e) =>
                setWeatherData({ ...weatherData, description: e.target.value })
              }
              placeholder="Ex: Partiellement nuageux"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-cgt-red hover:bg-cgt-red-dark text-white"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder
                </>
              )}
            </Button>

            <Button onClick={handleRandomWeather} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Météo aléatoire
            </Button>
          </div>
        </div>
      </Card>

      {/* Aperçu */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Aperçu de l'affichage
        </h3>
        <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-200">
          <div className="text-center space-y-2">
            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Paris
            </div>
            <div className="flex items-center justify-center gap-2">
              <Thermometer className="w-4 h-4 text-cgt-red" />
              <span className="text-lg font-bold text-cgt-gray">
                {weatherData.temperature}°C
              </span>
            </div>
            <div className="text-sm text-gray-600 font-medium">
              {weatherData.description}
            </div>
            <div className="text-xs text-gray-500">
              Humidité {weatherData.humidity}% • Vent {weatherData.windSpeed}{" "}
              km/h
            </div>
            <div className="text-xs text-gray-400">
              Dernière mise à jour:{" "}
              {new Date(weatherData.lastUpdate).toLocaleString("fr-FR")}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
