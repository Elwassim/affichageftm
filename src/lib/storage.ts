export interface Meeting {
  id: string;
  title: string;
  time: string;
  room: string;
  category: string;
  date: string; // Format YYYY-MM-DD
}

export interface Permanence {
  id: string;
  name: string;
  type: "technique" | "politique"; // Type de permanence
  month: string; // Mois (juin, juillet, août, etc.)
  year: number; // Année
  days: Record<string, { time?: string }>; // Jours du mois avec heures optionnelles (1-31)
  description?: string; // Description optionnelle
  created_at?: string;
  updated_at?: string;
}

export interface SocialPost {
  id: string;
  photo: string;
  name: string;
  text: string;
  hashtag: string;
}

export interface Tribute {
  id: string;
  name: string;
  photo: string;
  text: string;
  dateAdded: string;
}

export interface User {
  id: string;
  username: string;
  password_hash?: string;
  email?: string;
  role: string;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface DashboardData {
  meetings: Meeting[];
  permanences: Permanence[];
  videoUrl: string;
  alertText: string;
  socialPost: SocialPost;
  weatherCity: string;
  tributes: Tribute[];
  users?: User[];
}

const DEFAULT_DATA: DashboardData = {
  meetings: [],
  permanences: [],
        month: currentMonth,
        year: currentYear,
        days: { [(today + 3).toString()]: {} },
        description: "Santé au travail",
      },
      {
        id: "5",
        name: "Catherine Moreau",
        type: "technique" as const,
        month: currentMonth,
        year: currentYear,
        days: { [in4Days.toString()]: {} },
        description: "Formation syndicale",
      },
      {
        id: "6",
        name: "Michel Bernard",
        type: "technique" as const,
        month: currentMonth,
        year: currentYear,
        days: { [(today + 5).toString()]: {} },
        description: "Relations sociales",
      },
      {
        id: "7",
        name: "Anne Leroy",
        type: "technique" as const,
        month: currentMonth,
        year: currentYear,
        days: { [(today + 6).toString()]: {} },
        description: "Dossiers individuels",
      },
      // Une seule permanence politique par semaine (lundi par exemple)
      {
        id: "8",
        name: "Pierre Dupont",
        type: "politique" as const,
        month: currentMonth,
        year: currentYear,
        days: { [in7Days.toString()]: {} },
        description: "Représentation politique",
      },
    ];
  })(),
  videoUrl: "https://www.youtube.com/embed/YQHsXMglC9A",
  alertText:
    "🚨 APPEL CGT FTM - Négociation collective métallurgie - Jeudi 21 mars à 14h - Siège fédéral - Mobilisation pour nos salaires !",
  socialPost: {
    id: "1",
    photo:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face",
    name: "Sophie Lefebvre",
    text: "Victoire dans les négociations métallurgie ! Nous avons obtenu 4% d'augmentation générale et amélioration des conditions de travail. La détermination des métallurgistes paye ! Continuons le combat syndical !",
    hashtag: "#CGTFTM",
  },
  weatherCity: "Paris",
  tributes: [
    {
      id: "1",
      name: "Henri Krasucki",
      photo:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      text: "Secrétaire général de la CGT de 1982 à 1992. Figure emblématique du syndicalisme français, il a consacré sa vie à la défense des travailleurs et à la justice sociale.",
      dateAdded: new Date().toISOString(),
    },
    {
      id: "2",
      name: "Pierre Mauroy",
      photo:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      text: "Ancien Premier ministre et grand défenseur des droits syndicaux. Son engagement pour les travailleurs de la métallurgie restera dans nos mémoires.",
      dateAdded: new Date().toISOString(),
    },
  ],
  users: [
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
  ],
};

export const getDashboardData = (): DashboardData => {
  const stored = localStorage.getItem("union-dashboard-data");
  if (!stored) return DEFAULT_DATA;

  try {
    const data = JSON.parse(stored);
    // Migration: add tributes field if missing
    if (!data.tributes) {
      data.tributes = DEFAULT_DATA.tributes;
      localStorage.setItem("union-dashboard-data", JSON.stringify(data));
    }
    // Migration: add users field if missing
    if (!data.users) {
      data.users = DEFAULT_DATA.users;
      localStorage.setItem("union-dashboard-data", JSON.stringify(data));
    }
    // Migration: update permanences structure with type field
    if (data.permanences && data.permanences.length > 0) {
      const firstPermanence = data.permanences[0] as any;
      if (
        !firstPermanence.type ||
        typeof firstPermanence.type === "undefined"
      ) {
        data.permanences = DEFAULT_DATA.permanences;
        localStorage.setItem("union-dashboard-data", JSON.stringify(data));
      }
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

export const saveDashboardData = (data: DashboardData): void => {
  localStorage.setItem("union-dashboard-data", JSON.stringify(data));
};

export const updateMeetings = (meetings: Meeting[]): void => {
  const data = getDashboardData();
  data.meetings = meetings;
  saveDashboardData(data);
};

export const updatePermanences = (permanences: Permanence[]): void => {
  const data = getDashboardData();
  data.permanences = permanences;
  saveDashboardData(data);
};

export const updateVideoUrl = (videoUrl: string): void => {
  const data = getDashboardData();
  data.videoUrl = videoUrl;
  saveDashboardData(data);
};

export const updateAlertText = (alertText: string): void => {
  const data = getDashboardData();
  data.alertText = alertText;
  saveDashboardData(data);
};

export const updateSocialPost = (socialPost: SocialPost): void => {
  const data = getDashboardData();
  data.socialPost = socialPost;
  saveDashboardData(data);
};

export const updateWeatherCity = (city: string): void => {
  const data = getDashboardData();
  data.weatherCity = city;
  saveDashboardData(data);
};

export const updateTributes = (tributes: Tribute[]): void => {
  const data = getDashboardData();
  data.tributes = tributes;
  saveDashboardData(data);
};

export const addTribute = (
  tribute: Omit<Tribute, "id" | "dateAdded">,
): void => {
  const data = getDashboardData();
  const newTribute: Tribute = {
    ...tribute,
    id: Date.now().toString(),
    dateAdded: new Date().toISOString(),
  };
  data.tributes = [...data.tributes, newTribute];
  saveDashboardData(data);
};

export const removeTribute = (id: string): void => {
  const data = getDashboardData();
  data.tributes = data.tributes.filter((t) => t.id !== id);
  saveDashboardData(data);
};

// Users management
export const updateUsers = (users: User[]): void => {
  const data = getDashboardData();
  data.users = users;
  saveDashboardData(data);
};

export const addUser = (user: Omit<User, "id" | "created_at">): void => {
  const data = getDashboardData();
  const newUser: User = {
    ...user,
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  data.users = [...(data.users || []), newUser];
  saveDashboardData(data);
};

export const removeUser = (id: string): void => {
  const data = getDashboardData();
  data.users = (data.users || []).filter((u) => u.id !== id);
  saveDashboardData(data);
};