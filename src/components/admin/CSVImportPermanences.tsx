import React, { useState, useRef } from "react";
import { Upload, Users, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface CSVImportPermanencesProps {
  onNamesImported?: (names: string[]) => void;
}

export const CSVImportPermanences: React.FC<CSVImportPermanencesProps> = ({
  onNamesImported,
}) => {
  const [importedNames, setImportedNames] = useState<string[]>([]);
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

      {/* Noms importés */}
      {importedNames.length > 0 && (
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
          <p className="text-xs text-green-600 mt-2">
            Ces noms sont maintenant disponibles pour créer des permanences.
          </p>
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
