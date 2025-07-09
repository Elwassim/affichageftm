import React, { useState, useRef } from "react";
import {
  Upload,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Plus,
  Save,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createPermanence } from "@/lib/database";

interface CSVImportPermanencesProps {
  onNamesImported?: (names: string[]) => void;
  onPermanencesCreated?: () => void;
}

interface PersonPermanence {
  name: string;
  dates: string[]; // YYYY-MM-DD format
  type: "technique" | "politique";
  description: string;
}

export const CSVImportPermanences: React.FC<CSVImportPermanencesProps> = ({
  onNamesImported,
  onPermanencesCreated,
}) => {
  const [importedNames, setImportedNames] = useState<string[]>([]);
  const [personPermanences, setPersonPermanences] = useState<
    PersonPermanence[]
  >([]);
  const [selectedPerson, setSelectedPerson] = useState<string>("");
  const [newDate, setNewDate] = useState<string>("");
  const [permanenceType, setPermanenceType] = useState<
    "technique" | "politique"
  >("technique");
  const [description, setDescription] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const extractNamesFromCSV = (csvText: string): string[] => {
    const lines = csvText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line);

    const names: string[] = [];

    for (const line of lines) {
      // Ignorer les lignes d'en-tête et de légende
      if (
        !line ||
        line.includes("Nom, Prénom") ||
        line.includes("P:") ||
        line.includes("RTT:") ||
        line.toLowerCase().includes("absence")
      ) {
        continue;
      }

      const parts = line.split(";");
      if (parts.length >= 1) {
        const fullName = parts[0]?.trim();
        if (fullName && !fullName.includes(":") && fullName.length > 2) {
          names.push(fullName);
        }
      }
    }

    return [...new Set(names)]; // Supprimer les doublons
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier CSV.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target?.result as string;
      const names = extractNamesFromCSV(csvText);

      if (names.length > 0) {
        setImportedNames(names);
        // Initialiser les permanences pour chaque personne
        const initialPermanences = names.map((name) => ({
          name,
          dates: [],
          type: "technique" as const,
          description: "",
        }));
        setPersonPermanences(initialPermanences);
        onNamesImported?.(names);
        toast({
          title: "Noms importés",
          description: `${names.length} personnes extraites du CSV`,
        });
      } else {
        toast({
          title: "Erreur",
          description: "Aucun nom trouvé dans le fichier CSV.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file, "UTF-8");
  };

  const addDateToPerson = () => {
    if (!selectedPerson || !newDate) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une personne et une date.",
        variant: "destructive",
      });
      return;
    }

    setPersonPermanences((prev) =>
      prev.map((person) =>
        person.name === selectedPerson
          ? {
              ...person,
              dates: [...person.dates, newDate].sort(),
              type: permanenceType,
              description: description || `Permanence ${permanenceType}`,
            }
          : person,
      ),
    );

    setNewDate("");
    toast({
      title: "Date ajoutée",
      description: `Date ajoutée pour ${selectedPerson}`,
    });
  };

  const removeDateFromPerson = (personName: string, dateToRemove: string) => {
    setPersonPermanences((prev) =>
      prev.map((person) =>
        person.name === personName
          ? {
              ...person,
              dates: person.dates.filter((date) => date !== dateToRemove),
            }
          : person,
      ),
    );
  };

  const createAllPermanences = async () => {
    setIsCreating(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const person of personPermanences) {
        for (const dateStr of person.dates) {
          try {
            const date = new Date(dateStr);
            const day = date.getDate();
            const month = date.toLocaleDateString("fr-FR", { month: "long" });
            const year = date.getFullYear();

            const permanenceData = {
              name: person.name,
              type: person.type,
              day,
              month,
              year,
              description:
                person.description || `Permanence du ${day} ${month} ${year}`,
            };

            const created = await createPermanence(permanenceData);
            if (created) {
              successCount++;
            } else {
              errorCount++;
            }
          } catch (error) {
            console.error("Erreur création permanence:", error);
            errorCount++;
          }
        }
      }

      if (successCount > 0) {
        toast({
          title: "Permanences créées",
          description: `${successCount} permanences créées avec succès`,
        });
        onPermanencesCreated?.();

        // Reset après création
        setPersonPermanences((prev) =>
          prev.map((person) => ({ ...person, dates: [] })),
        );
      }

      if (errorCount > 0) {
        toast({
          title: "Erreurs",
          description: `${errorCount} erreurs lors de la création`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer les permanences",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Import des noms
          </h3>
          <p className="text-sm text-gray-600">
            Importez rapidement les noms depuis un fichier CSV
          </p>
        </div>

        <Button
          onClick={() => fileInputRef.current?.click()}
          className="bg-cgt-red hover:bg-cgt-red-dark text-white"
        >
          <Upload className="w-4 h-4 mr-2" />
          Importer les noms
        </Button>
      </div>

      {/* Format d'aide */}
      {importedNames.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 mb-2">
                Import simple des noms :
              </p>
              <div className="text-blue-800 font-mono text-xs bg-white p-2 rounded border">
                <div>DUPONT, JEAN</div>
                <div>MARTIN, MARIE</div>
                <div>BERNARD, PAUL</div>
              </div>
              <p className="mt-2 text-blue-700">
                Le fichier CSV extrait automatiquement les noms de la première
                colonne. Vous pourrez ensuite gérer les permanences
                manuellement.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Noms importés et gestion des dates */}
      {importedNames.length > 0 && (
        <div className="space-y-6">
          {/* Liste des noms importés */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <h4 className="font-medium text-green-900">
                {importedNames.length} noms importés
              </h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {importedNames.map((name, index) => (
                <div
                  key={index}
                  className="flex items-center text-sm text-green-800"
                >
                  <Users className="w-3 h-3 mr-1" />
                  {name}
                </div>
              ))}
            </div>
          </div>

          {/* Interface d'ajout de dates */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Planifier les permanences
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <Label htmlFor="person">Personne</Label>
                <select
                  id="person"
                  value={selectedPerson}
                  onChange={(e) => setSelectedPerson(e.target.value)}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cgt-red focus:border-cgt-red"
                >
                  <option value="">Sélectionner une personne</option>
                  {importedNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="type">Type</Label>
                <select
                  id="type"
                  value={permanenceType}
                  onChange={(e) =>
                    setPermanenceType(
                      e.target.value as "technique" | "politique",
                    )
                  }
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cgt-red focus:border-cgt-red"
                >
                  <option value="technique">Technique</option>
                  <option value="politique">Politique</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={addDateToPerson}
                  disabled={!selectedPerson || !newDate}
                  className="w-full bg-cgt-red hover:bg-cgt-red-dark text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description (optionnel)</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description de la permanence"
                className="mt-1"
              />
            </div>
          </div>

          {/* Récapitulatif des permanences planifiées */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-4">
              Permanences planifiées
            </h4>

            {personPermanences.filter((p) => p.dates.length > 0).length ===
            0 ? (
              <p className="text-blue-600 text-sm">
                Aucune permanence planifiée
              </p>
            ) : (
              <div className="space-y-3">
                {personPermanences
                  .filter((person) => person.dates.length > 0)
                  .map((person) => (
                    <div key={person.name} className="bg-white rounded-lg p-3">
                      <h5 className="font-medium text-gray-800 mb-2">
                        {person.name} - {person.type}
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {person.dates.map((date) => (
                          <div
                            key={date}
                            className="flex items-center bg-gray-100 rounded px-2 py-1 text-sm"
                          >
                            <span className="mr-2">
                              {new Date(date).toLocaleDateString("fr-FR")}
                            </span>
                            <button
                              onClick={() =>
                                removeDateFromPerson(person.name, date)
                              }
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                <div className="pt-4 border-t border-blue-200">
                  <Button
                    onClick={createAllPermanences}
                    disabled={
                      isCreating ||
                      personPermanences.every((p) => p.dates.length === 0)
                    }
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isCreating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Création en cours...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Créer toutes les permanences
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Input file caché */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};
