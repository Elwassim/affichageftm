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
    const { data, error } = await supabase!
      .from("permanences")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Erreur récupération permanences:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Erreur Supabase permanences:", error);
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
      .insert([permanence])
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

// Export pour compatibilité
export {
  updateMeeting as updateMeetingInDB,
  deleteMeeting as deleteMeetingFromDB,
  createMeeting as addMeetingToDB,
  createPermanence as addPermanenceToDB,
  createTribute as addTributeToDB,
  deleteTribute as deleteTributeFromDB,
};
