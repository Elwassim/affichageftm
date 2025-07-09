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
    let currentType: "technique" | "politique" = "technique";

    for (const line of lines) {
      // Vérifier si c'est un titre de section
      const lowerLine = line.toLowerCase();
      if (
        lowerLine.includes("permanences techniques") ||
        lowerLine.includes("permanence technique")
      ) {
        currentType = "technique";
        continue;
      }
      if (
        lowerLine.includes("permanences politiques") ||
        lowerLine.includes("permanence politique")
      ) {
        currentType = "politique";
        continue;
      }

      // Ignorer les lignes vides ou les titres
      if (
        !line ||
        line.startsWith("#") ||
        line.includes("nom") ||
        line.includes("date")
      ) {
        continue;
      }

      // Parser la ligne de données
      // Format attendu: nom,date(AAAA-MM-JJ),description
      const parts = line
        .split(",")
        .map((part) => part.trim().replace(/^["']|["']$/g, ""));

      if (parts.length >= 2) {
        const name = parts[0];
        const dateStr = parts[1];
        const description = parts.slice(2).join(",") || "";

        // Parser la date
        const dateMatch = dateStr.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
        if (dateMatch) {
          const year = parseInt(dateMatch[1]);
          const month = parseInt(dateMatch[2]);
          const day = parseInt(dateMatch[3]);

          // Convertir le mois en nom français
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
          const monthName = monthNames[month - 1] || "janvier";

          permanences.push({
            name,
            type: currentType,
            day,
            month: monthName,
            year,
            description,
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
              Format CSV attendu :
            </p>
            <div className="text-blue-800 font-mono text-xs bg-white p-2 rounded border">
              <div>Permanences techniques</div>
              <div>Jean Dupont,2024-01-15,Maintenance réseau</div>
              <div>Marie Martin,2024-01-16,Support utilisateurs</div>
              <div className="mt-2">Permanences politiques</div>
              <div>Pierre Durand,2024-01-20,Assemblée générale</div>
            </div>
            <p className="mt-2 text-blue-700">
              Les sections sont définies par des titres contenant "Permanences
              techniques" ou "Permanences politiques". Chaque ligne de données
              contient : nom,date(AAAA-MM-JJ),description
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
