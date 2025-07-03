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

interface PermanenceCategory {
  id: string;
  type: string;
  code: string;
  label: string;
  color: string;
  description: string;
}

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
    category: "P",
    month: new Date().toLocaleDateString("fr-FR", { month: "long" }),
    year: new Date().getFullYear(),
    days: {} as Record<string, string>,
    description: "",
  });

  // Calendar days state for editing
  const [selectedDays, setSelectedDays] = useState<Record<string, string>>({});

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

  const getCategoriesForType = (type: string) => {
    return categories.filter((cat) => cat.type === type);
  };

  const getCategoryInfo = (type: string, code: string) => {
    return categories.find((cat) => cat.type === type && cat.code === code);
  };

  const handleAddPermanence = async () => {
    if (!newPermanence.name.trim() || Object.keys(selectedDays).length === 0) {
      toast({
        title: "Erreur",
        description:
          "Veuillez remplir le nom et sélectionner au moins un jour.",
        variant: "destructive",
      });
      return;
    }

    try {
      const permanence = await createPermanence({
        name: newPermanence.name,
        type: newPermanence.type,
        category: newPermanence.category,
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
          category: "P",
          month: new Date().toLocaleDateString("fr-FR", { month: "long" }),
          year: new Date().getFullYear(),
          days: {},
          description: "",
        });
        setSelectedDays({});
        onRefresh?.();
        toast({
          title: "Succès",
          description: "Permanence ajoutée avec succès.",
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

  const toggleDay = (day: string, category: string) => {
    setSelectedDays((prev) => {
      const newDays = { ...prev };
      if (newDays[day] === category) {
        delete newDays[day];
      } else {
        newDays[day] = category;
      }
      return newDays;
    });
  };

  const renderCalendar = () => {
    const daysInMonth = 31; // Simplifié pour l'exemple
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
      <div className="border rounded-lg p-4 bg-white">
        <h4 className="font-semibold mb-3">
          Calendrier - {newPermanence.month} {newPermanence.year}
        </h4>
        <div className="grid grid-cols-7 gap-1 mb-4">
          {["L", "M", "M", "J", "V", "S", "D"].map((day) => (
            <div key={day} className="text-center font-medium text-sm p-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const dayStr = day.toString();
            const isSelected = selectedDays[dayStr];
            const categoryInfo = getCategoryInfo(
              newPermanence.type,
              isSelected || newPermanence.category,
            );

            return (
              <button
                key={day}
                onClick={() => toggleDay(dayStr, newPermanence.category)}
                className={`
                  p-2 text-sm rounded transition-all
                  ${
                    isSelected
                      ? `text-white font-medium`
                      : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                  }
                `}
                style={
                  isSelected ? { backgroundColor: categoryInfo?.color } : {}
                }
              >
                {day}
                {isSelected && <div className="text-xs mt-1">{isSelected}</div>}
              </button>
            );
          })}
        </div>
      </div>
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
                  const firstCategory =
                    getCategoriesForType(type)[0]?.code || "P";
                  setNewPermanence({
                    ...newPermanence,
                    type,
                    category: firstCategory,
                  });
                }}
                className="admin-input w-full"
              >
                <option value="technique">Technique</option>
                <option value="politique">Politique</option>
              </select>
            </div>

            <div>
              <label className="admin-label">Catégorie *</label>
              <select
                value={newPermanence.category}
                onChange={(e) =>
                  setNewPermanence({
                    ...newPermanence,
                    category: e.target.value,
                  })
                }
                className="admin-input w-full"
              >
                {getCategoriesForType(newPermanence.type).map((cat) => (
                  <option key={cat.code} value={cat.code}>
                    {cat.code} - {cat.label}
                  </option>
                ))}
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
            {renderCalendar()}

            {/* Legend */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h5 className="font-medium mb-2">Légende des catégories</h5>
              <div className="grid grid-cols-2 gap-2">
                {getCategoriesForType(newPermanence.type).map((cat) => (
                  <div key={cat.code} className="flex items-center space-x-2">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: cat.color }}
                    ></div>
                    <span className="text-sm">
                      <strong>{cat.code}</strong> - {cat.label}
                    </span>
                  </div>
                ))}
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
              const categoryInfo = getCategoryInfo(
                permanence.type,
                permanence.category,
              );
              const daysCount = Object.keys(permanence.days || {}).length;

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
                            backgroundColor: categoryInfo?.color || "#6b7280",
                          }}
                        >
                          {permanence.category} - {categoryInfo?.label}
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
                          .map(([day, code]) => (
                            <span
                              key={day}
                              className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                            >
                              {day}: {code}
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
