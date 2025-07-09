import { getPermanences, type Permanence } from "./database";

// Interface pour les permanences du tableau de bord (format affiché)
export interface DashboardPermanence {
  id: string;
  name: string;
  date: string; // Format YYYY-MM-DD
  day: number; // Jour du mois (1-31)
  type: "technique" | "politique";
  displayDate: string; // Format d'affichage (ex: "Lun 15 Jan")
  color: string; // Couleur selon le type
  time?: string; // Heure optionnelle (ex: "14:00")
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

// Couleurs par type
const getTypeColor = (type: "technique" | "politique"): string => {
  const colors = {
    technique: "#3b82f6", // Bleu
    politique: "#ef4444", // Rouge
  };
  return colors[type];
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
            const dayData = permanence.days[dayStr];
            dashboardPermanences.push({
              id: `${permanence.id}-${dayStr}`,
              name: permanence.name,
              date: date.toISOString().split("T")[0], // YYYY-MM-DD
              day: day,
              type: permanence.type,
              displayDate: `${getDayName(date.getDay())} ${day} ${month.slice(0, 3)}`,
              color: getTypeColor(permanence.type),
              time: dayData.time, // Inclure l'heure si disponible
            });
          }
        }
      });
    });

    // Grouper les permanences politiques par semaine
    const groupedPermanences =
      groupPoliticalPermanencesByWeek(dashboardPermanences);

    // Trier par date
    groupedPermanences.sort((a, b) => a.date.localeCompare(b.date));

    return groupedPermanences;
  } catch (error) {
    return [];
  }
};

// Fonction pour obtenir le label d'un type
export const getTypeLabel = (type: "technique" | "politique"): string => {
  const labels = {
    technique: "Technique",
    politique: "Politique",
  };
  return labels[type];
};
