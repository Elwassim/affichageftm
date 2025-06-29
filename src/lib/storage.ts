export interface Meeting {
  id: string;
  title: string;
  time: string;
  room: string;
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

export interface DashboardData {
  meetings: Meeting[];
  permanences: Permanence[];
  videoUrl: string;
  alertText: string;
  socialPost: SocialPost;
  weatherCity: string;
}

const DEFAULT_DATA: DashboardData = {
  meetings: [
    {
      id: "1",
      title: "Assemblée Générale CGT",
      time: "14:00",
      room: "Salle des délégués",
    },
    {
      id: "2",
      title: "Commission Négociation Collective",
      time: "16:30",
      room: "Bureau syndical",
    },
    {
      id: "3",
      title: "Réunion délégués du personnel",
      time: "18:00",
      room: "Salle de réunion A",
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
};

export const getDashboardData = (): DashboardData => {
  const stored = localStorage.getItem("union-dashboard-data");
  return stored ? JSON.parse(stored) : DEFAULT_DATA;
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
