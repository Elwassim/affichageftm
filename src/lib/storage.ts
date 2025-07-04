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
  meetings: (() => {
    const today = new Date();
    const monday = new Date(today);
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    monday.setDate(today.getDate() + diff);

    const formatDate = (daysOffset: number) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + daysOffset);
      return date.toISOString().split("T")[0];
    };

    return [
      // LUNDI
      {
        id: "1",
        title: "Assemblée Générale Ordinaire",
        time: "14:00",
        room: "Salle des Congrès",
        category: "Assemblée Générale",
        date: formatDate(0), // Lundi
      },
      {
        id: "2",
        title: "Commission Exécutive",
        time: "09:00",
        room: "Bureau Confédéral",
        category: "Commission",
        date: formatDate(0), // Lundi
      },

      // MARDI
      {
        id: "3",
        title: "Négociation Salariale Métallurgie",
        time: "09:30",
        room: "Salle de Négociation",
        category: "Négociation",
        date: formatDate(1), // Mardi
      },
      {
        id: "4",
        title: "Formation délégués nouveaux adhérents",
        time: "14:00",
        room: "Salle de Formation A",
        category: "Formation",
        date: formatDate(1), // Mardi
      },

      // MERCREDI
      {
        id: "5",
        title: "Comité d'Entreprise Renault",
        time: "14:00",
        room: "Siège Renault",
        category: "Comité",
        date: formatDate(2), // Mercredi
      },
      {
        id: "6",
        title: "Commission Santé-Sécurité",
        time: "10:00",
        room: "Salle Médicale",
        category: "Commission",
        date: formatDate(2), // Mercredi
      },

      // JEUDI
      {
        id: "7",
        title: "Formation Droit Syndical",
        time: "14:00",
        room: "Salle de Formation B",
        category: "Formation",
        date: formatDate(3), // Jeudi
      },
      {
        id: "8",
        title: "Délégués du Personnel PSA",
        time: "16:00",
        room: "Usine PSA",
        category: "Délégués",
        date: formatDate(3), // Jeudi
      },
      {
        id: "9",
        title: "Commission Retraites",
        time: "08:30",
        room: "Bureau Syndical",
        category: "Commission",
        date: formatDate(3), // Jeudi
      },

      // VENDREDI
      {
        id: "10",
        title: "Assemblée Générale Extraordinaire",
        time: "09:00",
        room: "Salle des Congrès",
        category: "Assemblée Générale",
        date: formatDate(4), // Vendredi
      },
      {
        id: "11",
        title: "Formation Sécurité au Travail",
        time: "14:30",
        room: "Atelier Formation",
        category: "Formation",
        date: formatDate(4), // Vendredi
      },
      {
        id: "12",
        title: "Négociation Temps de Travail",
        time: "16:00",
        room: "Salle de Négociation",
        category: "Négociation",
        date: formatDate(4), // Vendredi
      },
    ];
  })(),
  permanences: (() => {
    const currentMonth = new Date().toLocaleDateString("fr-FR", {
      month: "long",
    });
    const currentYear = new Date().getFullYear();
    const today = new Date().getDate();
    const tomorrow = today + 1;
    const dayAfter = today + 2;

    return [
      {
        id: "1",
        name: "Marie Dubois",
        type: "technique" as const,
        month: currentMonth,
        year: currentYear,
        days: {
          [today.toString()]: { time: "09:00" },
          [tomorrow.toString()]: { time: "09:00" },
        },
        description: "Droit du travail & contentieux",
      },
      {
        id: "2",
        name: "Jean-Claude Martin",
        type: "politique" as const,
        month: currentMonth,
        year: currentYear,
        days: {
          [tomorrow.toString()]: { time: "14:00" },
          [dayAfter.toString()]: { time: "14:00" },
        },
        description: "Négociation collective",
      },
      {
        id: "3",
        name: "Sylvie Rousseau",
        type: "technique" as const,
        month: currentMonth,
        year: currentYear,
        days: { [dayAfter.toString()]: { time: "10:00" } },
        description: "Protection sociale",
      },
      {
        id: "4",
        name: "Pierre Dupont",
        type: "politique" as const,
        month: currentMonth,
        year: currentYear,
        days: { [today.toString()]: { time: "16:00" } },
        description: "Représentation politique",
      },
    ];
  })(),
  videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
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
