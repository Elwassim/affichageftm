import { getPermanences, type Permanence } from "./database";

// Interface pour les permanences du tableau de bord (format affiché)
export interface DashboardPermanence {
  id: string;
  name: string;
  date: string; // Format YYYY-MM-DD
  day: number; // Jour du mois (1-31)
  status: string; // P, PAR, MAL, RTT, etc.
  category: string;
  type: "technique" | "politique";
  displayDate: string; // Format d'affichage (ex: "Lun 15 Jan")
  color: string; // Couleur de la catégorie
}

// Fonction pour obtenir le nom du mois en français
const getMonthName = (monthIndex: number): string => {
  const months = [
    "janvier",
    "février",
    "mars",
    "avril",
    "mai",
    "juin",
    "juillet",
    "août",
    "septembre",
    "octobre",
    "novembre",
    "décembre",
  ];
  return months[monthIndex];
};

// Fonction pour obtenir le nom abrégé du jour en français
const getDayName = (dayIndex: number): string => {
  const days = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  return days[dayIndex];
};

// Couleurs par catégorie
const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    P: "#3b82f6", // Bleu
    PAR: "#ec4899", // Rose
    MAL: "#ef4444", // Rouge
    RTT: "#10b981", // Vert
    REC: "#f59e0b", // Orange
    CP: "#8b5cf6", // Violet
    FER: "#6b7280", // Gris
  };
  return colors[category] || "#6b7280";
};

// Fonction principale pour obtenir les permanences des 7 prochains jours
export const getNext7DaysPermanences = async (): Promise<
  DashboardPermanence[]
> => {
  try {
    // Récupérer toutes les permanences
    const allPermanences = await getPermanences();

    // Calculer les 7 prochains jours
    const today = new Date();
    const next7Days: Date[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      next7Days.push(date);
    }

    const dashboardPermanences: DashboardPermanence[] = [];

    // Pour chaque jour des 7 prochains jours
    next7Days.forEach((date) => {
      const year = date.getFullYear();
      const month = getMonthName(date.getMonth());
      const day = date.getDate();

      // Trouver les permanences correspondant à ce jour
      allPermanences.forEach((permanence) => {
        // Vérifier si la permanence correspond au mois/année
        if (permanence.year === year && permanence.month === month) {
          // Vérifier si ce jour spécifique a une permanence
          const dayStr = day.toString();
          if (permanence.days[dayStr]) {
            const status = permanence.days[dayStr];

            dashboardPermanences.push({
              id: `${permanence.id}-${dayStr}`,
              name: permanence.name,
              date: date.toISOString().split("T")[0], // YYYY-MM-DD
              day: day,
              status: status,
              category: permanence.category,
              type: permanence.type,
              displayDate: `${getDayName(date.getDay())} ${day} ${month.slice(0, 3)}`,
              color: getCategoryColor(status),
            });
          }
        }
      });
    });

    // Trier par date
    dashboardPermanences.sort((a, b) => a.date.localeCompare(b.date));

    console.log(
      `📅 Permanences 7 prochains jours: ${dashboardPermanences.length} trouvées`,
    );
    return dashboardPermanences;
  } catch (error) {
    console.error("❌ Erreur récupération permanences 7 jours:", error);
    return [];
  }
};

// Fonction pour obtenir le label d'une catégorie
export const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    P: "Permanence",
    PAR: "Congé Parental",
    MAL: "Maladie",
    RTT: "RTT",
    REC: "Récupération",
    CP: "Congé Payé",
    FER: "Férié",
  };
  return labels[category] || category;
};
