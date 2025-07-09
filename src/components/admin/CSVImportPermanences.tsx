import React, { useState, useRef } from "react";
import {
  Upload,
  FileUp,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { createPermanence } from "@/lib/database";

interface CSVImportPermanencesProps {
  onImportComplete?: () => void;
}

interface ParsedPermanence {
  name: string;
  type: "technique" | "politique";
  day: number;
  month: string;
  year: number;
  description: string;
}

interface ImportResult {
  success: number;
  errors: string[];
  total: number;
}

interface PersonWithDays {
  name: string;
  days: { [day: number]: boolean };
}

interface CSVData {
  month: string;
  year: number;
  people: PersonWithDays[];
  availableDays: number[];
}

export const CSVImportPermanences: React.FC<CSVImportPermanencesProps> = ({
  onImportComplete,
}) => {
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [csvData, setCsvData] = useState<CSVData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const parseCSVToData = (csvText: string): CSVData | null => {
    const lines = csvText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line);

    let monthName = "juillet";
    let year = 2025;
    let dayMapping: { [columnIndex: number]: number } = {};
    const people: PersonWithDays[] = [];

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];

      // Extraire le mois et l'année
      if (line.toLowerCase().includes("absence")) {
        const monthMatch = line.match(
          /(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)/i,
        );
        const yearMatch = line.match(/(\d{4})/);
        if (monthMatch) monthName = monthMatch[1].toLowerCase();
        if (yearMatch) year = parseInt(yearMatch[1]);
        continue;
      }

      // Extraire le mapping des jours
      if (line.includes("Nom, Prénom")) {
        const headerParts = line.split(";");
        for (let i = 3; i < headerParts.length; i++) {
          const headerValue = headerParts[i]?.trim();
          const dayNumber = parseInt(headerValue);
          if (!isNaN(dayNumber) && dayNumber >= 1 && dayNumber <= 31) {
            dayMapping[i] = dayNumber;
          }
        }
        continue;
      }

      // Extraire les personnes
      if (
        line &&
        !line.includes("P:") &&
        !line.includes("RTT:") &&
        line.length > 10
      ) {
        const parts = line.split(";");
        if (parts.length >= 4) {
          const fullName = parts[0]?.trim();
          if (fullName && !fullName.includes(":")) {
            const personDays: { [day: number]: boolean } = {};

            // Détecter automatiquement les "P" existants
            for (
              let columnIndex = 3;
              columnIndex < parts.length;
              columnIndex++
            ) {
              const cellValue = parts[columnIndex]?.trim();
              const day = dayMapping[columnIndex];
              if (day && cellValue === "P") {
                personDays[day] = true;
              }
            }

            people.push({
              name: fullName,
              days: personDays,
            });
          }
        }
      }
    }

    const availableDays = Object.values(dayMapping).sort((a, b) => a - b);

    return {
      month: monthName,
      year,
      people,
      availableDays,
    };
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
      const data = parseCSVToData(csvText);
      if (data && data.people.length > 0) {
        setCsvData(data);
        setImportResult(null);
        toast({
          title: "CSV chargé",
          description: `${data.people.length} personnes trouvées pour ${data.month} ${data.year}`,
        });
      } else {
        toast({
          title: "Erreur",
          description: "Aucune personne trouvée dans le fichier CSV.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file, "UTF-8");
  };

  const toggleDay = (personIndex: number, day: number) => {
    if (!csvData) return;

    const newCsvData = { ...csvData };
    newCsvData.people = [...csvData.people];
    newCsvData.people[personIndex] = {
      ...csvData.people[personIndex],
      days: {
        ...csvData.people[personIndex].days,
        [day]: !csvData.people[personIndex].days[day],
      },
    };
    setCsvData(newCsvData);
  };

  const importPermanences = async () => {
    if (!csvData) return;

    setIsImporting(true);
    setImportResult(null);

    const result: ImportResult = {
      success: 0,
      errors: [],
      total: 0,
    };

    try {
      for (const person of csvData.people) {
        const selectedDays = Object.entries(person.days)
          .filter(([_, selected]) => selected)
          .map(([day, _]) => parseInt(day));

        result.total += selectedDays.length;

        for (const day of selectedDays) {
          try {
            const permanence: ParsedPermanence = {
              name: person.name,
              type: "technique",
              day: day,
              month: csvData.month,
              year: csvData.year,
              description: `Permanence du ${day} ${csvData.month} ${csvData.year}`,
            };

            const created = await createPermanence(permanence);
            if (created) {
              result.success++;
            } else {
              result.errors.push(
                `Échec création ${person.name} - ${day}/${csvData.month}`,
              );
            }
          } catch (error) {
            result.errors.push(
              `Erreur ${person.name} - ${day}/${csvData.month}: ${error}`,
            );
          }
        }
      }

      setImportResult(result);

      if (result.success > 0) {
        toast({
          title: "Import réussi",
          description: `${result.success} permanences importées avec succès.`,
        });
        onImportComplete?.();
      }

      if (result.errors.length > 0) {
        toast({
          title: "Erreurs d'import",
          description: `${result.errors.length} erreurs rencontrées.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur d'import",
        description: "Impossible d'importer les permanences.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Import CSV</h3>
          <p className="text-sm text-gray-600">
            Importez vos permanences depuis un fichier CSV
          </p>
        </div>

        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isImporting}
          className="bg-cgt-red hover:bg-cgt-red-dark text-white"
        >
          {isImporting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Import en cours...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Importer des permanences
            </>
          )}
        </Button>
      </div>

      {/* Format d'aide */}
      {!csvData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 mb-2">
                Format CSV planning attendu :
              </p>
              <div className="text-blue-800 font-mono text-xs bg-white p-2 rounded border">
                <div>Absence;;juillet 2025;;;;;;;;;</div>
                <div>Nom, Prénom;;;1;2;3;4;5;6;7;8;9;10;11;12...</div>
                <div>DUPONT, JEAN;;;P;;P;PAR;;;P;;;;P;</div>
                <div>MARTIN, MARIE;;;;P;;;CP;;P;P;;;</div>
                <div>P:;Permanences;;CP:;Congés Payés;</div>
              </div>
              <p className="mt-2 text-blue-700">
                Après chargement du fichier, vous pourrez sélectionner
                manuellement les jours de permanence pour chaque personne.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Interface de sélection des permanences */}
      {csvData && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">
              Sélection des permanences - {csvData.month} {csvData.year}
            </h4>
            <div className="flex gap-2">
              <Button
                onClick={() => setCsvData(null)}
                variant="outline"
                size="sm"
              >
                Annuler
              </Button>
              <Button
                onClick={importPermanences}
                disabled={isImporting}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isImporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Import...
                  </>
                ) : (
                  <>Importer les permanences sélectionnées</>
                )}
              </Button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {csvData.people.map((person, personIndex) => (
              <div key={personIndex} className="mb-4 p-3 bg-gray-50 rounded-lg">
                <h5 className="font-medium text-gray-800 mb-2">
                  {person.name}
                </h5>
                <div className="grid grid-cols-7 gap-1">
                  {csvData.availableDays.map((day) => (
                    <button
                      key={day}
                      onClick={() => toggleDay(personIndex, day)}
                      className={`w-8 h-8 text-xs rounded border-2 transition-colors ${
                        person.days[day]
                          ? "bg-cgt-red text-white border-cgt-red"
                          : "bg-white text-gray-600 border-gray-300 hover:border-cgt-red"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {Object.values(person.days).filter(Boolean).length} jours
                  sélectionnés
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Résultats d'import */}
      {importResult && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">
            Résultats de l'import
          </h4>

          <div className="space-y-2">
            <div className="flex items-center text-green-700">
              <CheckCircle className="w-4 h-4 mr-2" />
              <span>{importResult.success} permanences créées avec succès</span>
            </div>

            {importResult.errors.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center text-red-700">
                  <XCircle className="w-4 h-4 mr-2" />
                  <span>{importResult.errors.length} erreurs rencontrées</span>
                </div>
                <div className="ml-6 text-sm text-red-600 max-h-32 overflow-y-auto">
                  {importResult.errors.slice(0, 5).map((error, index) => (
                    <div key={index}>• {error}</div>
                  ))}
                  {importResult.errors.length > 5 && (
                    <div>
                      • ... et {importResult.errors.length - 5} autres erreurs
                    </div>
                  )}
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
