import { useState, useEffect, useCallback } from "react";
import {
  getAllMeetings,
  getTributes,
  getPermanences,
  getUsers,
  getConfig,
  initializeDefaultConfig,
} from "../lib/database";
import type { Meeting, Tribute, Permanence, User } from "../lib/supabase";

interface DatabaseState {
  meetings: Meeting[];
  tributes: Tribute[];
  permanences: Permanence[];
  users: User[];
  config: {
    videoUrl: string;
    weatherCity: string;
    alertText: string;
  };
  loading: boolean;
  error: string | null;
  lastSync: Date | null;
}

interface UseDatabaseSyncReturn extends DatabaseState {
  refresh: () => Promise<void>;
  isConnected: boolean;
}

export const useDatabaseSync = (
  autoRefreshInterval: number = 30000,
): UseDatabaseSyncReturn => {
  const [state, setState] = useState<DatabaseState>({
    meetings: [],
    tributes: [],
    permanences: [],
    users: [],
    config: {
      videoUrl: "",
      weatherCity: "Paris",
      alertText: "",
    },
    loading: true,
    error: null,
    lastSync: null,
  });

  const [isConnected, setIsConnected] = useState(false);

  const refresh = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // Initialiser les configurations par défaut
      await initializeDefaultConfig();

      const [
        meetings,
        tributes,
        permanences,
        users,
        videoUrl,
        weatherCity,
        alertText,
      ] = await Promise.all([
        getAllMeetings(),
        getTributes(),
        getPermanences(),
        getUsers(),
        getConfig("videoUrl"),
        getConfig("weatherCity"),
        getConfig("alertText"),
      ]);

      setState({
        meetings,
        tributes,
        permanences,
        users,
        config: {
          videoUrl: videoUrl || "",
          weatherCity: weatherCity || "Paris",
          alertText: alertText || "",
        },
        loading: false,
        error: null,
        lastSync: new Date(),
      });

      setIsConnected(true);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Erreur de connexion à la base de données",
      }));
      setIsConnected(false);
    }
  }, []);

  // Chargement initial
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Auto-refresh automatique
  useEffect(() => {
    if (autoRefreshInterval > 0) {
      const interval = setInterval(refresh, autoRefreshInterval);
      return () => clearInterval(interval);
    }
  }, [refresh, autoRefreshInterval]);

  return {
    ...state,
    refresh,
    isConnected,
  };
};

// Hook spécialisé pour le tableau de bord (données publiques seulement)
export const useDashboardSync = () => {
  return useDatabaseSync(60000); // Refresh toutes les minutes
};

// Hook spécialisé pour l'admin (toutes les données + refresh fréquent)
export const useAdminSync = () => {
  return useDatabaseSync(30000); // Refresh toutes les 30 secondes
};
