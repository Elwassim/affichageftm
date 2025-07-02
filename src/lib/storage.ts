export interface Meeting {
  id: string;
  title: string;
  time: string;
  room: string;
  category: string;
}

export interface Permanence {
  id: string;
  name: string;
  time: string;
  theme: string;
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

export interface DashboardData {
  meetings: Meeting[];
  permanences: Permanence[];
  videoUrl: string;
  alertText: string;
  socialPost: SocialPost;
  weatherCity: string;
  tributes: Tribute[];
}

const DEFAULT_DATA: DashboardData = {
  meetings: [
    {
      id: "1",
      title: "Assemblée Générale CGT",
      time: "14:00",
      room: "Salle des délégués",
      category: "Assemblée Générale",
    },
    {
      id: "2",
      title: "Commission Négociation Collective",
      time: "16:30",
      room: "Bureau syndical",
      category: "Commission",
    },
    {
      id: "3",
      title: "Réunion délégués du personnel",
      time: "18:00",
      room: "Salle de réunion A",
      category: "Délégués",
    },
    {
      id: "4",
      title: "Formation sécurité au travail",
      time: "10:00",
      room: "Salle de formation",
      category: "Formation",
    },
    {
      id: "5",
      title: "Comité d'entreprise",
      time: "15:00",
      room: "Salle du CE",
      category: "Comité",
    },
  ],
  permanences: [
    {
      id: "1",
      name: "Marie Dubois",
      time: "09:00 - 12:00",
      theme: "Droit du travail & contentieux",
    },
    {
      id: "2",
      name: "Jean-Claude Martin",
      time: "14:00 - 17:00",
      theme: "Négociation collective",
    },
    {
      id: "3",
      name: "Sylvie Rousseau",
      time: "10:00 - 16:00",
      theme: "Protection sociale",
    },
  ],
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
