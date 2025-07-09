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

export const CSVImportPermanences: React.FC<CSVImportPermanencesProps> = ({
  onImportComplete,
}) => {
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const parseCSV = (csvText: string): ParsedPermanence[] => {
    const lines = csvText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line);
    const permanences: ParsedPermanence[] = [];

    let monthName = "juillet"; // par défaut
    let year = 2025; // par défaut

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];

      // Extraire le mois et l'année depuis la première ligne si disponible
      if (lineIndex === 0 && line.toLowerCase().includes("absence")) {
        const monthMatch = line.match(
          /(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)/i,
        );
        const yearMatch = line.match(/(\d{4})/);
        if (monthMatch) monthName = monthMatch[1].toLowerCase();
        if (yearMatch) year = parseInt(yearMatch[1]);
        continue;
      }

      // Ignorer les lignes d'en-tête, de légende et vides
      if (
        !line ||
        line.includes("Nom, Prénom") ||
        line.includes("P:") ||
        line.includes("RTT:") ||
        lineIndex < 2
      ) {
        continue;
      }

      const parts = line.split(";");

      // Vérifier qu'il y a un nom et des données
      if (parts.length < 4) continue;

      const fullName = parts[0]?.trim();
      if (!fullName || fullName.includes(":")) continue;

      // Parser chaque jour du mois (colonnes 3 à 34 approximativement)
      for (
        let dayIndex = 3;
        dayIndex < parts.length && dayIndex <= 34;
        dayIndex++
      ) {
        const cellValue = parts[dayIndex]?.trim();

        // Ne traiter que les cellules contenant "P" (permanences)
        if (cellValue === "P") {
          const day = dayIndex - 2; // Ajuster l'index pour correspondre au jour du mois

          permanences.push({
            name: fullName,
            type: "technique", // Toutes les permanences sont techniques par défaut
            day: day,
            month: monthName,
            year: year,
            description: `Permanence du ${day} ${monthName} ${year}`,
          });
        }
      }
    }

    return permanences;
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
    reader.onload = async (e) => {
      const csvText = e.target?.result as string;
      await processCSV(csvText);
    };
    reader.readAsText(file, "UTF-8");
  };

  const processCSV = async (csvText: string) => {
    setIsImporting(true);
    setImportResult(null);

    try {
      const permanences = parseCSV(csvText);

      if (permanences.length === 0) {
        toast({
          title: "Erreur",
          description: "Aucune permanence valide trouvée dans le fichier CSV.",
          variant: "destructive",
        });
        return;
      }

      const result: ImportResult = {
        success: 0,
        errors: [],
        total: permanences.length,
      };

      // Importer les permanences une par une
      for (const permanence of permanences) {
        try {
          const created = await createPermanence(permanence);
          if (created) {
            result.success++;
          } else {
            result.errors.push(`Échec de création pour ${permanence.name}`);
          }
        } catch (error) {
          result.errors.push(`Erreur pour ${permanence.name}: ${error}`);
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
        description: "Impossible de traiter le fichier CSV.",
        variant: "destructive",
      });
      console.error("Erreur import CSV:", error);
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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
              Format planning avec noms en lignes et jours en colonnes. Seules
              les cellules contenant "P" seront importées comme permanences
              techniques. Le mois et l'année sont détectés automatiquement
              depuis la première ligne.
            </p>
          </div>
        </div>
      </div>

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
