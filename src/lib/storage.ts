import type { DashboardData } from "./supabase";

// Version simplifiée sans données par défaut pour éviter les contenus non voulus
const DEFAULT_DATA: DashboardData = {
  meetings: [],
  permanences: [],
  videoUrl: "",
  alertText: "",
  socialPost: {
    id: "",
    photo: "",
    name: "",
    text: "",
    hashtag: "",
  },
  weatherCity: "Paris",
  diversContent: "",
  tributes: [],
  users: [],
};

export const saveDashboardData = (data: DashboardData) => {
  localStorage.setItem("union-dashboard-data", JSON.stringify(data));
};

export const getDashboardData = (): DashboardData => {
  try {
    const stored = localStorage.getItem("union-dashboard-data");
    if (!stored) return DEFAULT_DATA;

    const data = JSON.parse(stored);

    // Validation et ajout des propriétés manquantes
    if (!data.tributes) {
      data.tributes = DEFAULT_DATA.tributes;
      localStorage.setItem("union-dashboard-data", JSON.stringify(data));
    }

    if (!data.users) {
      data.users = DEFAULT_DATA.users;
      localStorage.setItem("union-dashboard-data", JSON.stringify(data));
    }

    // Validation permanences
    if (
      data.permanences &&
      Array.isArray(data.permanences) &&
      data.permanences.some((p: any) => typeof p.days === "string")
    ) {
      data.permanences = DEFAULT_DATA.permanences;
      localStorage.setItem("union-dashboard-data", JSON.stringify(data));
    } else if (!data.permanences) {
      data.permanences = DEFAULT_DATA.permanences;
      localStorage.setItem("union-dashboard-data", JSON.stringify(data));
    }

    return data;
  } catch (error) {
    console.error("Error parsing stored data:", error);
    return DEFAULT_DATA;
  }
};

export const clearDashboardData = () => {
  localStorage.removeItem("union-dashboard-data");
};

// Fonctions de mise à jour spécifiques
export const updateVideoUrl = (url: string) => {
  const data = getDashboardData();
  data.videoUrl = url;
  saveDashboardData(data);
};

export const updateAlertText = (text: string) => {
  const data = getDashboardData();
  data.alertText = text;
  saveDashboardData(data);
};

export const updateSocialPost = (post: DashboardData["socialPost"]) => {
  const data = getDashboardData();
  data.socialPost = post;
  saveDashboardData(data);
};

export const updateWeatherCity = (city: string) => {
  const data = getDashboardData();
  data.weatherCity = city;
  saveDashboardData(data);
};

export const updateDiversContent = (content: string) => {
  const data = getDashboardData();
  data.diversContent = content;
  saveDashboardData(data);
};
