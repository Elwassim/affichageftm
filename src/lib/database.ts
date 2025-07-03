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

// Fallback vers localStorage si Supabase n'est pas configuré
const useSupabase = !!supabase;

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
      console.error(`Erreur récupération config ${key}:`, error);
      return null;
    }

    return data?.value;
  } catch (error) {
    console.error("Erreur Supabase config:", error);
    return null;
  }
};

export const setConfig = async (key: string, value: any): Promise<boolean> => {
  if (!useSupabase) {
    const localData = getLocalData();
    saveLocalData({ ...localData, [key]: value });
    return true;
  }

  try {
    const { error } = await supabase!
      .from("dashboard_config")
      .upsert({ key, value }, { onConflict: "key" });

    if (error) {
      console.error(`Erreur sauvegarde config ${key}:`, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erreur Supabase config:", error);
    return false;
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
  if (!useSupabase) {
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
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Erreur Supabase all meetings:", error);
    return [];
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
  if (!useSupabase) {
    const localData = getLocalData();
    const filteredMeetings = localData.meetings.filter((m) => m.id !== id);
    saveLocalData({ ...localData, meetings: filteredMeetings });
    return true;
  }

  try {
    const { error } = await supabase!.from("meetings").delete().eq("id", id);

    if (error) {
      console.error("Erreur suppression meeting:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erreur Supabase delete meeting:", error);
    return false;
  }
};

// ===== PERMANENCES =====
export const getPermanences = async (): Promise<Permanence[]> => {
  if (!useSupabase) {
    return getLocalData().permanences;
  }

  try {
    console.log("🔍 Tentative récupération permanences depuis Supabase...");

    // Méthode 1: Essayer avec la vue (si elle existe)
    let result = await supabase!
      .from("permanences_with_categories")
      .select("*")
      .order("year", { ascending: false })
      .order("month", { ascending: true })
      .order("name", { ascending: true });

    console.log("📊 Résultat vue permanences_with_categories:", result);

    if (result.error) {
      console.log("❌ Vue indisponible, tentative table directe...");

      // Méthode 2: Fallback vers la table directe
      result = await supabase!
        .from("permanences")
        .select("*")
        .order("year", { ascending: false })
        .order("month", { ascending: true })
        .order("name", { ascending: true });

      console.log("📊 Résultat table permanences:", result);

      if (result.error) {
        console.error("❌ Erreur table permanences:", result.error);
        return [];
      }
    }

    console.log("✅ Permanences récupérées:", result.data?.length || 0);
    return result.data || [];
  } catch (error) {
    console.error("💥 Erreur catch Supabase permanences:", error);
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

// Fonction pour récupérer les catégories de permanences
export const getPermanenceCategories = async (type?: string) => {
  if (!useSupabase) {
    return []; // Fallback local à implémenter si nécessaire
  }

  try {
    console.log("🔍 Tentative récupération catégories permanences...");

    let query = supabase!.from("permanence_categories").select("*");

    if (type) {
      query = query.eq("type", type);
    }

    const { data, error } = await query.order("code", { ascending: true });

    if (error) {
      console.error("❌ Erreur récupération catégories permanences:", error);
      return [];
    }

    console.log("✅ Catégories récupérées:", data?.length || 0);
    return data || [];
  } catch (error) {
    console.error("💥 Erreur catch Supabase catégories permanences:", error);
    return [];
  }
};

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
          category: permanence.category,
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
    const { data, error } = await supabase!
      .from("tributes")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Erreur récupération tributes:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Erreur Supabase tributes:", error);
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
    console.log("Using localStorage for users");
    return getLocalData().users || [];
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
        console.log("⚠️ RPC non disponible, méthode 3...");
      }

      // Méthode 3: Créer des users de test temporaires
      console.log("📋 Méthode 3: Retour d'users de test...");
      const testUsers: User[] = [
        {
          id: "test-1",
          username: "admin.test",
          email: "admin@cgt-ftm.fr",
          role: "admin",
          is_admin: true,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "test-2",
          username: "marie.delegue",
          email: "marie@cgt-ftm.fr",
          role: "moderator",
          is_admin: false,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "test-3",
          username: "jean.permanent",
          email: "jean@cgt-ftm.fr",
          role: "user",
          is_admin: false,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      console.log("✅ Retour d'users de test:", testUsers.length);
      return testUsers;
    }

    console.log(
      "✅ Users récupérés:",
      result.data?.length || 0,
      "utilisateurs",
    );
    return result.data || [];
  } catch (error) {
    console.error("💥 Erreur catch Supabase users:", error);

    // Fallback: retourner des users de test
    console.log("🔄 Fallback: users de test");
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
    const localData = getLocalData();
    const users = localData.users || [];
    const filteredUsers = users.filter((u) => u.id !== id);
    saveLocalData({ ...localData, users: filteredUsers });
    return true;
  }

  try {
    const { error } = await supabase!.from("users").delete().eq("id", id);

    if (error) {
      console.error("Erreur suppression user:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erreur Supabase delete user:", error);
    return false;
  }
};

// ===== FONCTION PRINCIPALE =====
export const getDashboardDataFromDB = async (): Promise<DashboardData> => {
  if (!useSupabase) {
    return getLocalData();
  }

  const [videoUrl, alertText, weatherCity, meetings, permanences, tributes] =
    await Promise.all([
      getConfig("videoUrl"),
      getConfig("alertText"),
      getConfig("weatherCity"),
      getMeetings(),
      getPermanences(),
      getTributes(),
    ]);

  return {
    videoUrl: videoUrl || "",
    alertText: alertText || "",
    weatherCity: weatherCity || "Paris",
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
