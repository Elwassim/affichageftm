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
    alertText: string;
    diversContent: string;
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
      alertText: "",
      diversContent: "",
    },
    loading: true,
    error: null,
    lastSync: null,
  });

  const [isConnected, setIsConnected] = useState(false);

  const refresh = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      console.log("🔄 Refresh des données depuis localStorage...");

      // Charger les données via les fonctions de database
      const [
        meetings,
        tributes,
        permanences,
        users,
        videoUrl,
        alertText,
        diversContent,
      ] = await Promise.all([
        getAllMeetings(),
        getTributes(),
        getPermanences(),
        getUsers(),
        getConfig("videoUrl"),
        getConfig("alertText"),
        getConfig("diversContent"),
      ]);

      console.log("📊 Données chargées:", {
        meetings: meetings.length,
        tributes: tributes.length,
        permanences: permanences.length,
        users: users.length,
      });

      setState({
        meetings,
        tributes,
        permanences,
        users,
        config: {
          videoUrl: videoUrl || "",
          alertText: alertText || "",
          diversContent:
            diversContent ||
            JSON.stringify({
              title: "Informations diverses",
              subtitle: "CGT FTM",
              content: "Aucune information particulière pour le moment.",
              isActive: false,
            }),
        },
        loading: false,
        error: null,
        lastSync: new Date(),
      });

      setIsConnected(true);
    } catch (error) {
      console.error("❌ Erreur refresh:", error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Erreur de chargement des données",
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

// Hook spécialisé pour l'admin (toutes les données + refresh manuel uniquement)
export const useAdminSync = () => {
  return useDatabaseSync(0); // Pas d'auto-refresh - uniquement manuel
};
