import React, { useState, useEffect } from "react";
import { Calendar, Users, Plus, Trash2, Edit, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getPermanences,
  createPermanence,
  updatePermanence,
  deletePermanence,
} from "@/lib/database";
import type { Permanence } from "@/lib/supabase";

interface PermanencesAdminProps {
  onRefresh?: () => void;
}

export const PermanencesAdmin: React.FC<PermanencesAdminProps> = ({
  onRefresh,
}) => {
  const [permanences, setPermanences] = useState<Permanence[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();

  // Form state
  const [newPermanence, setNewPermanence] = useState({
    name: "",
    type: "technique" as "technique" | "politique",
    month: new Date().toLocaleDateString("fr-FR", { month: "long" }),
    year: new Date().getFullYear(),
    days: {} as Record<string, { time?: string }>,
    description: "",
  });

  // Calendar days state for editing
  const [selectedDays, setSelectedDays] = useState<
    Record<string, { time?: string }>
  >({});

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

  const loadData = async () => {
    setLoading(true);
    try {
      const permanencesData = await getPermanences();
      setPermanences(permanencesData);
    } catch (error) {
      console.error("Erreur chargement permanences:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les permanences.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Helper functions for permanence types
  const getTypeLabel = (type: "technique" | "politique") => {
    return type === "technique" ? "Technique" : "Politique";
  };

  const getTypeColor = (type: "technique" | "politique") => {
    return type === "technique" ? "#3b82f6" : "#ef4444";
  };

  const handleAddPermanence = async () => {
    if (!newPermanence.name.trim() || Object.keys(selectedDays).length === 0) {
      toast({
        title: "Erreur",
        description:
          "Veuillez remplir le nom et s��lectionner au moins un jour.",
        variant: "destructive",
      });
      return;
    }

    try {
      const permanence = await createPermanence({
        name: newPermanence.name,
        type: newPermanence.type,
        month: newPermanence.month,
        year: newPermanence.year,
        days: selectedDays,
        description: newPermanence.description,
      });

      if (permanence) {
        await loadData();
        setNewPermanence({
          name: "",
          type: "technique",
          month: new Date().toLocaleDateString("fr-FR", { month: "long" }),
          year: new Date().getFullYear(),
          days: {},
          description: "",
        });
        setSelectedDays({});
        onRefresh?.();
        toast({
          title: "Succès",
          description: `Permanence ${getTypeLabel(newPermanence.type).toLowerCase()} ajoutée avec succès. ${Object.keys(selectedDays).length} jour(s) sélectionné(s).`,
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la permanence.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePermanence = async (id: string) => {
    try {
      const success = await deletePermanence(id);
      if (success) {
        await loadData();
        onRefresh?.();
        toast({
          title: "Succès",
          description: "Permanence supprimée avec succès.",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la permanence.",
        variant: "destructive",
      });
    }
  };

  const toggleDay = (day: string) => {
    // Pour les permanences politiques, sélectionner toute la semaine
    if (newPermanence.type === "politique") {
      selectWeekForDay(parseInt(day));
    } else {
      // Pour les permanences techniques, sélection individuelle
      setSelectedDays((prev) => {
        const newDays = { ...prev };
        if (newDays[day]) {
          delete newDays[day];
        } else {
          newDays[day] = {};
        }
        return newDays;
      });
    }
  };

  // Sélectionner toute la semaine contenant le jour donné
  const selectWeekForDay = (dayNumber: number) => {
    const currentYear = parseInt(newPermanence.year.toString());
    const monthNames = [
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
    const monthIndex = monthNames.indexOf(newPermanence.month.toLowerCase());

    if (monthIndex === -1) return;

    // Calculer le jour de la semaine pour le jour donné
    const date = new Date(currentYear, monthIndex, dayNumber);
    const dayOfWeek = date.getDay(); // 0 = dimanche, 1 = lundi, etc.

    // Calculer le début de la semaine (lundi)
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const weekStart = dayNumber + mondayOffset;
    const weekEnd = weekStart + 6;

    // Calculer le nombre de jours dans le mois
    const daysInMonth = new Date(currentYear, monthIndex + 1, 0).getDate();

    setSelectedDays((prev) => {
      const newDays = { ...prev };

      // Désélectionner tous les jours d'abord
      Object.keys(newDays).forEach((key) => {
        delete newDays[key];
      });

      // Sélectionner toute la semaine
      for (
        let day = Math.max(1, weekStart);
        day <= Math.min(daysInMonth, weekEnd);
        day++
      ) {
        newDays[day.toString()] = {};
      }

      return newDays;
    });
  };

  // Fonctions de sélection rapide
  const selectWeek = (weekNumber: number) => {
    const startDay = (weekNumber - 1) * 7 + 1;
    const endDay = Math.min(weekNumber * 7, 31);

    setSelectedDays((prev) => {
      const newDays = { ...prev };
      for (let day = startDay; day <= endDay; day++) {
        newDays[day.toString()] = {};
      }
      return newDays;
    });
  };

  const selectAllDays = () => {
    setSelectedDays((prev) => {
      const newDays = { ...prev };
      for (let day = 1; day <= 31; day++) {
        newDays[day.toString()] = {};
      }
      return newDays;
    });
  };

  const clearAllDays = () => {
    setSelectedDays({});
  };

  const renderCalendar = () => {
    // Obtenir le mois et l'année actuels
    const currentYear = parseInt(newPermanence.year.toString());
    const monthNames = [
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
    const monthIndex = monthNames.indexOf(newPermanence.month.toLowerCase());

    if (monthIndex === -1) {
      return <div>Mois invalide</div>;
    }

    // Calculer les jours du mois
    const daysInMonth = new Date(currentYear, monthIndex + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, monthIndex, 1).getDay();
    // Convertir dimanche (0) en 7 pour avoir lundi = 1
    const firstDayMondayStart = firstDayOfMonth === 0 ? 7 : firstDayOfMonth;

    // Créer un tableau avec les jours vides au début + les jours du mois
    const calendarCells = [];

    // Jours vides au début
    for (let i = 1; i < firstDayMondayStart; i++) {
      calendarCells.push(null);
    }

    // Jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      calendarCells.push(day);
    }

    return (
      <div className="border rounded-lg p-4 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold">
            Calendrier - {newPermanence.month} {newPermanence.year}
          </h4>
          <div className="flex gap-2">
            <button
              onClick={() => changeMonth(-1)}
              className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
            >
              ←
            </button>
            <button
              onClick={() => changeMonth(1)}
              className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
            >
              →
            </button>
          </div>
        </div>

        {/* En-têtes des jours */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["L", "Ma", "Me", "J", "V", "S", "D"].map((day, index) => (
            <div
              key={`day-header-${index}`}
              className="text-center font-medium text-sm p-2 text-gray-600"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Grille du calendrier */}
        <div className="grid grid-cols-7 gap-1">
          {calendarCells.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="p-2"></div>;
            }

            const dayStr = day.toString();
            const isSelected = selectedDays[dayStr];
            const typeColor = getTypeColor(newPermanence.type);
            const isToday = isCurrentMonth() && day === new Date().getDate();

            return (
              <button
                key={day}
                onClick={() => toggleDay(dayStr)}
                className={`
                  p-2 text-sm rounded transition-all relative
                  ${
                    isSelected
                      ? `text-white font-medium shadow-md`
                      : isToday
                        ? "bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium border border-blue-200"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                  }
                `}
                style={isSelected ? { backgroundColor: typeColor } : {}}
              >
                {day}
                {isToday && !isSelected && (
                  <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-3 text-xs text-gray-500">
          Cliquez sur les jours pour sélectionner les permanences
        </div>
      </div>
    );
  };

  // Fonction pour changer de mois
  const changeMonth = (direction: number) => {
    const monthNames = [
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

    const currentMonthIndex = monthNames.indexOf(
      newPermanence.month.toLowerCase(),
    );
    let newMonthIndex = currentMonthIndex + direction;
    let newYear = newPermanence.year;

    if (newMonthIndex < 0) {
      newMonthIndex = 11;
      newYear = newYear - 1;
    } else if (newMonthIndex > 11) {
      newMonthIndex = 0;
      newYear = newYear + 1;
    }

    setNewPermanence({
      ...newPermanence,
      month: monthNames[newMonthIndex],
      year: newYear,
    });

    // Réinitialiser les jours sélectionnés lors du changement de mois
    setSelectedDays({});
  };

  // Vérifier si c'est le mois actuel
  const isCurrentMonth = () => {
    const now = new Date();
    const monthNames = [
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

    return (
      newPermanence.year === now.getFullYear() &&
      newPermanence.month.toLowerCase() === monthNames[now.getMonth()]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="admin-section-header">
        <div className="admin-section-title">
          <div className="admin-section-icon bg-green-100">
            <Users className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Permanences CGT FTM
            </h2>
            <p className="text-gray-700">
              Gestion des permanences techniques et politiques
            </p>
          </div>
        </div>
        <div className="admin-section-stats">
          <span className="admin-connection-status">
            <div className="admin-connection-dot bg-green-500"></div>
            Base de données connectée
          </span>
          <span>{permanences.length} permanences configurées</span>
        </div>
      </div>

      {/* Add Permanence Form */}
      <div className="admin-add-card">
        <div className="admin-section-title">
          <div className="admin-section-icon bg-green-500">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Ajouter une permanence
            </h3>
            <p className="text-sm text-gray-700">
              Nouvelle planification de permanence
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Form fields */}
          <div className="space-y-4">
            <div>
              <label className="admin-label">Nom de la personne *</label>
              <input
                type="text"
                value={newPermanence.name}
                onChange={(e) =>
                  setNewPermanence({ ...newPermanence, name: e.target.value })
                }
                placeholder="Marie Dupont"
                className="admin-input w-full"
              />
            </div>

            <div>
              <label className="admin-label">Type de permanence *</label>
              <select
                value={newPermanence.type}
                onChange={(e) => {
                  const type = e.target.value as "technique" | "politique";
                  setNewPermanence({
                    ...newPermanence,
                    type,
                  });
                }}
                className="admin-input w-full"
              >
                <option value="technique">Technique</option>
                <option value="politique">Politique</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="admin-label">Mois *</label>
                <select
                  value={newPermanence.month}
                  onChange={(e) =>
                    setNewPermanence({
                      ...newPermanence,
                      month: e.target.value,
                    })
                  }
                  className="admin-input w-full"
                >
                  {months.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="admin-label">Année *</label>
                <input
                  type="number"
                  value={newPermanence.year}
                  onChange={(e) =>
                    setNewPermanence({
                      ...newPermanence,
                      year: parseInt(e.target.value),
                    })
                  }
                  className="admin-input w-full"
                  min="2024"
                  max="2030"
                />
              </div>
            </div>

            <div>
              <label className="admin-label">Description</label>
              <textarea
                value={newPermanence.description}
                onChange={(e) =>
                  setNewPermanence({
                    ...newPermanence,
                    description: e.target.value,
                  })
                }
                placeholder="Description optionnelle..."
                rows={3}
                className="admin-input w-full"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleAddPermanence}
                disabled={
                  !newPermanence.name.trim() ||
                  Object.keys(selectedDays).length === 0
                }
                className="admin-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter la permanence
              </button>
            </div>
          </div>

          {/* Calendar */}
          <div>
            {/* Boutons de sélection rapide */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <h5 className="font-medium mb-3 text-blue-900">
                Sélection rapide
              </h5>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <h6 className="text-sm font-medium text-blue-800">
                    Par semaine
                  </h6>
                  <div className="grid grid-cols-2 gap-1">
                    {[1, 2, 3, 4].map((week) => (
                      <button
                        key={week}
                        type="button"
                        onClick={() => selectWeek(week)}
                        className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 rounded transition-colors"
                      >
                        Sem. {week}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <h6 className="text-sm font-medium text-blue-800">Actions</h6>
                  <div className="grid grid-cols-1 gap-1">
                    <button
                      type="button"
                      onClick={selectAllDays}
                      className="px-2 py-1 text-xs bg-green-100 hover:bg-green-200 text-green-800 rounded transition-colors"
                    >
                      Tout le mois
                    </button>
                    <button
                      type="button"
                      onClick={clearAllDays}
                      className="px-2 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-800 rounded transition-colors"
                    >
                      Effacer tout
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-xs text-blue-600 mt-2">
                Sélectionnez rapidement plusieurs jours pour les permanences
                récurrentes
              </p>
            </div>

            {renderCalendar()}

            {/* Legend */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h5 className="font-medium mb-2">Types de permanences</h5>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: "#3b82f6" }}
                  ></div>
                  <span className="text-sm">
                    <strong>Technique</strong> - Permanences techniques
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: "#ef4444" }}
                  ></div>
                  <span className="text-sm">
                    <strong>Politique</strong> - Permanences politiques
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Permanences List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Permanences existantes ({permanences.length})
        </h3>

        {permanences.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Aucune permanence configurée. Ajoutez la première permanence
            ci-dessus.
          </div>
        ) : (
          <div className="space-y-4">
            {permanences.map((permanence) => {
              const daysCount = Object.keys(permanence.days || {}).length;
              const typeColor = getTypeColor(permanence.type);

              return (
                <div key={permanence.id} className="admin-list-item">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {permanence.name}
                        </h4>
                        <span
                          className="px-2 py-1 rounded text-xs font-medium text-white"
                          style={{
                            backgroundColor: typeColor,
                          }}
                        >
                          {getTypeLabel(permanence.type)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {permanence.type === "technique" ? "🔧" : "🏛️"}{" "}
                          {permanence.type}
                        </span>
                      </div>

                      <div className="text-sm text-gray-600 mb-2">
                        📅 {permanence.month} {permanence.year} • {daysCount}{" "}
                        jour(s) programmé(s)
                      </div>

                      {permanence.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {permanence.description}
                        </p>
                      )}

                      {/* Days preview */}
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(permanence.days || {})
                          .slice(0, 10)
                          .map(([day, dayData]) => (
                            <span
                              key={`${permanence.id}-day-${day}`}
                              className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                              title={
                                dayData?.time
                                  ? `${day} à ${dayData.time}`
                                  : `Jour ${day}`
                              }
                            >
                              {day}
                              {dayData?.time && (
                                <span className="block text-xs text-gray-500 mt-0.5">
                                  {dayData.time}
                                </span>
                              )}
                            </span>
                          ))}
                        {Object.keys(permanence.days || {}).length > 10 && (
                          <span className="text-xs text-gray-500">
                            +{Object.keys(permanence.days || {}).length - 10}{" "}
                            autres...
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="ml-4">
                      <button
                        onClick={() => handleDeletePermanence(permanence.id)}
                        className="admin-btn-danger"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
