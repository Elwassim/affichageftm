import {
  supabase,
  type Meeting,
  type Permanence,
  type User,
  type SocialPost,
  type Tribute,
  type DashboardData,
} from "./supabase";
import bcrypt from "bcryptjs";
import {
  getDashboardData as getLocalData,
  saveDashboardData as saveLocalData,
} from "./storage";
import {
  initializeSupabaseTables,
  insertDefaultData,
} from "./initializeSupabase";

// Utiliser Supabase si configuré, sinon localStorage en fallback
const useSupabase = !!supabase;

// Initialisation automatique de Supabase au premier chargement
let supabaseInitialized = false;
const ensureSupabaseReady = async (): Promise<boolean> => {
  if (!useSupabase || supabaseInitialized) return useSupabase;

  try {
    console.log("🔧 Initialisation automatique de Supabase...");
    const success = await initializeSupabaseTables();
    if (success) {
      await insertDefaultData();
      supabaseInitialized = true;
      console.log("✅ Supabase initialisé et prêt");
    }
    return success;
  } catch (error) {
    console.error("❌ Échec initialisation Supabase:", error);
    return false;
  }
};

// ===== CONFIGURATION =====
export const getConfig = async (key: string): Promise<any> => {
  if (!useSupabase) {
    const localData = getLocalData();
    return localData[key as keyof typeof localData];
  }

  try {
    const { data, error } = await supabase!
      .from("dashboard_config")
      .select("value")
      .eq("key", key)
      .single();

    if (error) {
      return null;
    }

    return data?.value;
  } catch (error) {
    return null;
  }
};

export const setConfig = async (key: string, value: any): Promise<boolean> => {
  console.log("⚙️ setConfig appelé:", { key, value, useSupabase });

  if (!useSupabase) {
    console.log("📁 Mode localStorage");
    const localData = getLocalData();
    saveLocalData({ ...localData, [key]: value });
    return true;
  }

  try {
    console.log("🔗 Mode Supabase - tentative upsert sur dashboard_config");
    const { error } = await supabase!
      .from("dashboard_config")
      .upsert({ key, value }, { onConflict: "key" });

    if (error) {
      console.error("❌ Erreur Supabase dashboard_config:", error);
      return false;
    }

    console.log("✅ Sauvegarde Supabase réussie");
    return true;
  } catch (error) {
    console.error("💥 Exception Supabase setConfig:", error);
    return false;
  }
};

// Initialiser les configurations par défaut
export const initializeDefaultConfig = async (): Promise<void> => {
  const defaults = {
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    alertText:
      "🚨 APPEL CGT FTM - Rejoignez-nous pour défendre vos droits ! 🚨",
    diversContent: JSON.stringify({
      title: "Informations diverses",
      subtitle: "CGT FTM",
      content: "Aucune information particulière pour le moment.",
      isActive: false,
    }),
  };

  for (const [key, defaultValue] of Object.entries(defaults)) {
    const existingValue = await getConfig(key);
    if (!existingValue) {
      await setConfig(key, defaultValue);
    }
  }
};

// ===== HELPER FUNCTIONS =====
const getCurrentWeekDates = () => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);

  // Calculer le lundi de cette semaine
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Dimanche = 0, donc -6 pour aller au lundi précédent
  monday.setDate(now.getDate() + diff);

  // Calculer le dimanche de cette semaine
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  return {
    start: formatDate(monday),
    end: formatDate(sunday),
  };
};

// ===== RÉUNIONS =====
export const getMeetings = async (): Promise<Meeting[]> => {
  if (!useSupabase) {
    // Pour localStorage, filtrer les réunions par semaine actuelle
    const allMeetings = getLocalData().meetings;
    const { start, end } = getCurrentWeekDates();

    return allMeetings.filter((meeting) => {
      if (!meeting.date) return true; // Garder les réunions sans date pour compatibilité
      return meeting.date >= start && meeting.date <= end;
    });
  }

  try {
    const { start, end } = getCurrentWeekDates();

    const { data, error } = await supabase!
      .from("meetings")
      .select("*")
      .gte("date", start)
      .lte("date", end)
      .order("date", { ascending: true })
      .order("time", { ascending: true });

    if (error) {
      console.error("Erreur récupération meetings:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Erreur Supabase meetings:", error);
    return [];
  }
};

export const getAllMeetings = async (): Promise<Meeting[]> => {
  const supabaseReady = await ensureSupabaseReady();

  if (!supabaseReady) {
    console.log("📱 Utilisation du localStorage pour les réunions");
    return getLocalData().meetings;
  }

  try {
    const { data, error } = await supabase!
      .from("meetings")
      .select("*")
      .order("date", { ascending: true })
      .order("time", { ascending: true });

    if (error) {
      console.error("Erreur récupération all meetings:", error);
      // Fallback vers localStorage en cas d'erreur
      console.log("📱 Fallback vers localStorage");
      return getLocalData().meetings;
    }

    console.log("🗄️ Réunions chargées depuis Supabase:", data?.length || 0);
    return data || [];
  } catch (error) {
    console.error("Erreur Supabase all meetings:", error);
    // Fallback vers localStorage en cas d'erreur
    console.log("📱 Fallback vers localStorage");
    return getLocalData().meetings;
  }
};

export const createMeeting = async (
  meeting: Omit<Meeting, "id" | "created_at" | "updated_at">,
): Promise<Meeting | null> => {
  if (!useSupabase) {
    const localData = getLocalData();
    const newMeeting = { ...meeting, id: Date.now().toString() };
    saveLocalData({
      ...localData,
      meetings: [...localData.meetings, newMeeting],
    });
    return newMeeting;
  }

  try {
    const { data, error } = await supabase!
      .from("meetings")
      .insert([meeting])
      .select()
      .single();

    if (error) {
      console.error("Erreur création meeting:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Erreur Supabase create meeting:", error);
    return null;
  }
};

export const updateMeeting = async (
  id: string,
  updates: Partial<Meeting>,
): Promise<boolean> => {
  if (!useSupabase) {
    const localData = getLocalData();
    const updatedMeetings = localData.meetings.map((m) =>
      m.id === id ? { ...m, ...updates } : m,
    );
    saveLocalData({ ...localData, meetings: updatedMeetings });
    return true;
  }

  try {
    const { error } = await supabase!
      .from("meetings")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("Erreur mise à jour meeting:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erreur Supabase update meeting:", error);
    return false;
  }
};

export const deleteMeeting = async (id: string): Promise<boolean> => {
  console.log("🗑️ deleteMeeting appelé pour ID:", id);

  const supabaseReady = await ensureSupabaseReady();
  console.log("🗑️ Mode base de données:", supabaseReady ? "Supabase" : "Local");

  if (!supabaseReady) {
    try {
      const localData = getLocalData();
      console.log(
        "🗑️ Données locales avant suppression:",
        localData.meetings.length,
        "réunions",
      );
      console.log(
        "🗑️ Liste des IDs avant:",
        localData.meetings.map((m) => m.id),
      );

      const filteredMeetings = localData.meetings.filter((m) => m.id !== id);
      console.log(
        "🗑️ Données après filtrage:",
        filteredMeetings.length,
        "réunions",
      );
      console.log(
        "🗑️ Liste des IDs après:",
        filteredMeetings.map((m) => m.id),
      );

      const updatedData = { ...localData, meetings: filteredMeetings };
      saveLocalData(updatedData);

      // Vérifier que les données ont bien été sauvegardées
      const verifyData = getLocalData();
      console.log(
        "🔍 Vérification après sauvegarde:",
        verifyData.meetings.length,
        "réunions",
      );

      const wasDeleted = !verifyData.meetings.some((m) => m.id === id);
      console.log("✅ Suppression locale réussie:", wasDeleted);

      return wasDeleted;
    } catch (error) {
      console.error("❌ Erreur lors de la suppression locale:", error);
      return false;
    }
  }

  try {
    console.log("🗑️ Tentative suppression Supabase...");
    const { error } = await supabase!.from("meetings").delete().eq("id", id);

    if (error) {
      console.error("❌ Erreur suppression meeting:", error);
      return false;
    }

    console.log("✅ Suppression Supabase réussie");
    return true;
  } catch (error) {
    console.error("❌ Erreur Supabase delete meeting:", error);
    return false;
  }
};

// ===== PERMANENCES =====
export const getPermanences = async (): Promise<Permanence[]> => {
  if (!useSupabase) {
    return getLocalData().permanences;
  }

  try {
    // Essayer avec la vue (si elle existe)
    let result = await supabase!
      .from("permanences_with_categories")
      .select("*")
      .order("year", { ascending: false })
      .order("month", { ascending: true })
      .order("name", { ascending: true });

    if (result.error) {
      // Fallback vers la table directe
      result = await supabase!
        .from("permanences")
        .select("*")
        .order("year", { ascending: false })
        .order("month", { ascending: true })
        .order("name", { ascending: true });

      if (result.error) {
        // RPC bypass RLS
        try {
          const rpcResult = await supabase!.rpc("get_all_permanences");
          if (!rpcResult.error && rpcResult.data) {
            return rpcResult.data;
          }
        } catch (rpcError) {
          // RPC non disponible
        }
        return [];
      }
    }

    return result.data || [];
  } catch (error) {
    return [];
  }
};

// Nouvelle fonction pour récupérer les permanences d'un mois spécifique
export const getPermanencesForMonth = async (
  month: string,
  year: number = new Date().getFullYear(),
): Promise<Permanence[]> => {
  if (!useSupabase) {
    const allPermanences = getLocalData().permanences;
    return allPermanences.filter((p) => p.month === month && p.year === year);
  }

  try {
    const { data, error } = await supabase!.rpc("get_permanences_for_month", {
      target_month: month,
      target_year: year,
    });

    if (error) {
      console.error("Erreur récupération permanences du mois:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Erreur Supabase permanences mois:", error);
    return [];
  }
};

// Note: getPermanenceCategories supprimée - plus de sous-catégories nécessaires

export const createPermanence = async (
  permanence: Omit<Permanence, "id" | "created_at" | "updated_at">,
): Promise<Permanence | null> => {
  if (!useSupabase) {
    const localData = getLocalData();
    const newPermanence = { ...permanence, id: Date.now().toString() };
    saveLocalData({
      ...localData,
      permanences: [...localData.permanences, newPermanence],
    });
    return newPermanence;
  }

  try {
    const { data, error } = await supabase!
      .from("permanences")
      .insert([
        {
          name: permanence.name,
          type: permanence.type,
          month: permanence.month,
          year: permanence.year,
          days: permanence.days,
          description: permanence.description,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Erreur création permanence:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Erreur Supabase create permanence:", error);
    return null;
  }
};

// ===== TRIBUTES =====
export const getTributes = async (): Promise<Tribute[]> => {
  if (!useSupabase) {
    return getLocalData().tributes || [];
  }

  try {
    console.log("🔍 Tentative récupération tributes depuis Supabase...");

    const { data, error } = await supabase!
      .from("tributes")
      .select("*")
      .order("created_at", { ascending: true });

    console.log("📊 Résultat tributes:", { data, error });

    if (error) {
      console.log("❌ Table tributes bloquée par RLS, tentative RPC...");

      // Fallback RPC bypass RLS
      try {
        const rpcResult = await supabase!.rpc("get_all_tributes");
        console.log("📊 Résultat RPC tributes:", rpcResult);

        if (!rpcResult.error && rpcResult.data) {
          console.log("✅ RPC tributes réussie!");
          return rpcResult.data;
        }
      } catch (rpcError) {
        console.log("⚠️ RPC tributes non disponible");
      }

      console.error("❌ Erreur récupération tributes:", error);
      return [];
    }

    console.log("✅ Tributes récupérés:", data?.length || 0);
    return data || [];
  } catch (error) {
    console.error("💥 Erreur catch Supabase tributes:", error);
    return [];
  }
};

export const createTribute = async (
  tribute: Omit<Tribute, "id" | "created_at" | "updated_at">,
): Promise<Tribute | null> => {
  if (!useSupabase) {
    const localData = getLocalData();
    const newTribute = {
      ...tribute,
      id: Date.now().toString(),
      date_added: new Date().toISOString(),
    };
    const tributes = localData.tributes || [];
    saveLocalData({
      ...localData,
      tributes: [...tributes, newTribute],
    });
    return newTribute;
  }

  try {
    const { data, error } = await supabase!
      .from("tributes")
      .insert([tribute])
      .select()
      .single();

    if (error) {
      console.error("Erreur création tribute:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Erreur Supabase create tribute:", error);
    return null;
  }
};

export const deleteTribute = async (id: string): Promise<boolean> => {
  if (!useSupabase) {
    const localData = getLocalData();
    const tributes = localData.tributes || [];
    const filteredTributes = tributes.filter((t) => t.id !== id);
    saveLocalData({ ...localData, tributes: filteredTributes });
    return true;
  }

  try {
    const { error } = await supabase!.from("tributes").delete().eq("id", id);

    if (error) {
      console.error("Erreur suppression tribute:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erreur Supabase delete tribute:", error);
    return false;
  }
};

// ===== UTILISATEURS =====
export const authenticateUser = async (
  username: string,
  password: string,
): Promise<User | null> => {
  if (!useSupabase) {
    // Fallback vers l'auth locale
    const { authenticateUser: localAuth } = await import("./auth");
    return localAuth(username, password);
  }

  try {
    const { data, error } = await supabase!
      .from("users")
      .select("*")
      .eq("username", username)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      return null;
    }

    const isValid = await bcrypt.compare(password, data.password_hash);
    if (!isValid) {
      return null;
    }

    const { password_hash, ...userWithoutPassword } = data;
    return userWithoutPassword as User;
  } catch (error) {
    console.error("Erreur Supabase auth:", error);
    return null;
  }
};

export const getUsers = async (): Promise<User[]> => {
  if (!useSupabase) {
    const localData = getLocalData();

    // Si aucun utilisateur dans localStorage, créer des utilisateurs par défaut
    if (!localData.users || localData.users.length === 0) {
      const defaultUsers: User[] = [
        {
          id: "admin-1",
          username: "admin.test",
          email: "admin@cgt-ftm.fr",
          role: "admin",
          is_admin: true,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "user-1",
          username: "marie.delegue",
          email: "marie@cgt-ftm.fr",
          role: "moderator",
          is_admin: false,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "user-2",
          username: "jean.permanent",
          email: "jean@cgt-ftm.fr",
          role: "user",
          is_admin: false,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      // Sauvegarder les utilisateurs par défaut
      saveLocalData({ ...localData, users: defaultUsers });
      return defaultUsers;
    }

    return localData.users;
  }

  try {
    console.log("🔍 Tentative récupération users depuis Supabase...");

    // SOLUTION DE CONTOURNEMENT: Essayer plusieurs méthodes

    // Méthode 1: Requête normale
    console.log("📋 Méthode 1: Requête normale...");
    let result = await supabase!
      .from("users")
      .select("*")
      .order("created_at", { ascending: true });

    console.log("📊 Résultat méthode 1:", result);

    if (result.error) {
      console.log("❌ Méthode 1 échouée, tentative méthode 2...");

      // Méthode 2: Requête avec RPC (bypass RLS)
      try {
        console.log("📋 Méthode 2: Tentative avec RPC...");
        const rpcResult = await supabase!.rpc("get_all_users");
        console.log("📊 Résultat RPC:", rpcResult);

        if (!rpcResult.error && rpcResult.data) {
          console.log("✅ Méthode RPC réussie!");
          return rpcResult.data;
        }
      } catch (rpcError) {
        console.log("⚠️ RPC non disponible, fallback localStorage...");
      }

      // Fallback vers localStorage
      console.log("📋 Fallback: localStorage...");
      return getUsers(); // Récursion vers localStorage
    }

    console.log(
      "✅ Users récupérés:",
      result.data?.length || 0,
      "utilisateurs",
    );
    return result.data || [];
  } catch (error) {
    console.error("💥 Erreur catch Supabase users:", error);

    // Fallback: retourner localStorage
    console.log("🔄 Fallback: localStorage");
    return [
      {
        id: "fallback-1",
        username: "admin.fallback",
        email: "admin@cgt-ftm.fr",
        role: "admin",
        is_admin: true,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }
};

export const createUser = async (user: {
  username: string;
  password: string;
  email?: string;
  role: string;
  is_admin: boolean;
}): Promise<User | null> => {
  if (!useSupabase) {
    const localData = getLocalData();
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const newUser: User = {
      id: Date.now().toString(),
      username: user.username,
      email: user.email,
      role: user.role,
      is_admin: user.is_admin,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const users = localData.users || [];
    saveLocalData({
      ...localData,
      users: [...users, newUser],
    });
    return newUser;
  }

  try {
    // Temporairement utiliser un hash simple pour debug
    const hashedPassword = `$2b$10$hash_${user.password}_${Date.now()}`;
    console.log("Tentative création user:", {
      username: user.username,
      email: user.email,
      role: user.role,
      is_admin: user.is_admin,
    });

    const { data, error } = await supabase!
      .from("users")
      .insert([
        {
          username: user.username,
          password_hash: hashedPassword,
          email: user.email,
          role: user.role,
          is_admin: user.is_admin,
          is_active: true,
        },
      ])
      .select(
        "id, username, email, role, is_admin, is_active, created_at, updated_at",
      )
      .single();

    if (error) {
      console.error("Erreur création user:", error);
      console.error(
        "Détails erreur:",
        error.message,
        error.details,
        error.hint,
      );
      return null;
    }

    console.log("User créé avec succès:", data);
    return data;
  } catch (error) {
    console.error("Erreur Supabase create user:", error);
    return null;
  }
};

export const updateUser = async (
  id: string,
  updates: Partial<User>,
): Promise<boolean> => {
  if (!useSupabase) {
    const localData = getLocalData();
    const users = localData.users || [];
    const updatedUsers = users.map((u) =>
      u.id === id
        ? { ...u, ...updates, updated_at: new Date().toISOString() }
        : u,
    );
    saveLocalData({ ...localData, users: updatedUsers });
    return true;
  }

  try {
    const { error } = await supabase!
      .from("users")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("Erreur mise à jour user:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erreur Supabase update user:", error);
    return false;
  }
};

export const deleteUser = async (id: string): Promise<boolean> => {
  if (!useSupabase) {
    try {
      const { removeUser } = await import("./storage");
      removeUser(id);
      return true;
    } catch (error) {
      console.error("Erreur suppression user localStorage:", error);
      return false;
    }
  }

  try {
    // Essayer d'abord avec RPC (contourne RLS)
    const { data: rpcResult, error: rpcError } = await supabase!.rpc(
      "delete_user_by_id",
      {
        user_id: id,
      },
    );

    if (!rpcError && rpcResult === true) {
      return true;
    }

    // Fallback: tentative avec requête directe
    const { error } = await supabase!.from("users").delete().eq("id", id);

    if (error) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
};

// ===== FONCTION PRINCIPALE =====
export const getDashboardDataFromDB = async (): Promise<DashboardData> => {
  if (!useSupabase) {
    return getLocalData();
  }

  const [videoUrl, alertText, meetings, permanences, tributes] =
    await Promise.all([
      getConfig("videoUrl"),
      getConfig("alertText"),
      getMeetings(),
      getPermanences(),
      getTributes(),
    ]);

  return {
    videoUrl: videoUrl || "",
    alertText: alertText || "",
    meetings,
    permanences,
    tributes,
    socialPost: {
      id: "1",
      name: "CGT FTM",
      text: "Message syndical par défaut",
      hashtag: "#CGTFTM",
      photo: "",
      is_active: true,
    },
    users: [],
  };
};

// ===== FONCTIONS ADMIN SPÉCIFIQUES =====
export const updateMeetingInDB = updateMeeting;
export const deleteMeetingFromDB = deleteMeeting;
export const addMeetingToDB = createMeeting;
export const addPermanenceToDB = createPermanence;
export const addTributeToDB = createTribute;
export const deleteTributeFromDB = deleteTribute;

export const updatePermanence = async (
  id: string,
  updates: Partial<Permanence>,
): Promise<boolean> => {
  if (!useSupabase) {
    const localData = getLocalData();
    const updatedPermanences = localData.permanences.map((p) =>
      p.id === id ? { ...p, ...updates } : p,
    );
    saveLocalData({ ...localData, permanences: updatedPermanences });
    return true;
  }

  try {
    const { error } = await supabase!
      .from("permanences")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("Erreur mise à jour permanence:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erreur Supabase update permanence:", error);
    return false;
  }
};

export const deletePermanence = async (id: string): Promise<boolean> => {
  if (!useSupabase) {
    const localData = getLocalData();
    const filteredPermanences = localData.permanences.filter(
      (p) => p.id !== id,
    );
    saveLocalData({ ...localData, permanences: filteredPermanences });
    return true;
  }

  try {
    const { error } = await supabase!.from("permanences").delete().eq("id", id);

    if (error) {
      console.error("Erreur suppression permanence:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erreur Supabase delete permanence:", error);
    return false;
  }
};

export const updateConfig = async (
  key: string,
  value: any,
): Promise<boolean> => {
  return await setConfig(key, value);
};

// ===== EXPORTS POUR L'ADMIN =====
export const addUserToDB = createUser;
export const getUsersFromDB = getUsers;
export const updateUserInDB = updateUser;
export const deleteUserFromDB = deleteUser;
export const updatePermanenceInDB = updatePermanence;
export const deletePermanenceFromDB = deletePermanence;
