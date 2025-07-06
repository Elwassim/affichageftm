import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";
import { useEffect, useState } from "react";
import { getConfig } from "@/lib/database";

interface DiversContent {
  title: string;
  subtitle: string;
  content: string;
  isActive: boolean;
}

export const DiversWidget = () => {
  const [diversContent, setDiversContent] = useState<DiversContent>({
    title: "Informations diverses",
    subtitle: "CGT FTM",
    content: "TEST WIDGET DIVERS - SI VOUS VOYEZ CECI, LE WIDGET FONCTIONNE !",
    isActive: true,
  });

  console.log("🔍 DiversWidget: DÉMARRAGE DU WIDGET", diversContent);

  // Charger le contenu configuré
  useEffect(() => {
    console.log("🔍 DiversWidget: useEffect démarré");

    const loadDiversContent = async () => {
      try {
        console.log("🔍 DiversWidget: loadDiversContent appelé");

        // Essayer localStorage d'abord
        const localContent = localStorage.getItem("diversContent");
        console.log("🔍 DiversWidget: localStorage content", localContent);

        if (localContent) {
          const parsed = JSON.parse(localContent);
          setDiversContent(parsed);
          console.log(
            "✅ DiversWidget: État mis à jour depuis localStorage",
            parsed,
          );
        }

        // Charger depuis la BDD
        const content = await getConfig("diversContent");
        console.log("🔍 DiversWidget: BDD content", content);

        if (content) {
          const parsed = JSON.parse(content);
          setDiversContent(parsed);
          console.log("✅ DiversWidget: État mis à jour depuis BDD", parsed);

          // Mettre à jour localStorage
          localStorage.setItem("diversContent", content);
          localStorage.setItem(
            "diversContent-timestamp",
            Date.now().toString(),
          );
        }
      } catch (error) {
        console.error("❌ DiversWidget: Erreur loadDiversContent", error);
      }
    };

    loadDiversContent();

    // Écouter les événements localStorage pour sync cross-page
    const handleStorageChange = (event: StorageEvent) => {
      console.log("🔍 DiversWidget: Storage event", event);
      if (event.key === "diversContent" && event.newValue) {
        try {
          const newContent = JSON.parse(event.newValue);
          setDiversContent(newContent);
          console.log("✅ DiversWidget: Sync cross-page reçue", newContent);
        } catch (error) {
          console.error("❌ DiversWidget: Erreur parsing storage", error);
        }
      }
    };

    // Écouter les changements de configuration depuis l'admin
    const handleConfigUpdate = (event: CustomEvent) => {
      console.log("🔍 DiversWidget: Config event", event.detail);
      if (event.detail.key === "diversContent") {
        if (typeof event.detail.value === "object") {
          setDiversContent(event.detail.value);
          console.log(
            "✅ DiversWidget: État mis à jour depuis event",
            event.detail.value,
          );
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(
      "cgt-config-updated",
      handleConfigUpdate as EventListener,
    );

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "cgt-config-updated",
        handleConfigUpdate as EventListener,
      );
    };
  }, []);

  // Rendu simplifié avec debug
  return (
    <Card className="p-3 bg-white professional-shadow border-0 h-full flex flex-col">
      <div className="mb-3">
        <h2 className="text-xl font-black text-cgt-gray flex items-center gap-2">
          <div className="w-7 h-7 bg-cgt-red rounded flex items-center justify-center">
            <Info className="w-5 h-5 text-white" />
          </div>
          Divers
        </h2>
        <div className="h-px bg-gradient-to-r from-cgt-red to-transparent w-1/3 mt-1"></div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="text-center py-4">
          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Info className="w-3 h-3 text-gray-400" />
          </div>

          {/* Debug: Affichage forcé du contenu */}
          <div className="text-sm text-gray-500 mb-2">
            Debug: isActive={diversContent.isActive.toString()}
          </div>

          {diversContent.subtitle && (
            <p className="text-sm text-gray-500 mb-2">
              {diversContent.subtitle}
            </p>
          )}

          <p className="text-gray-700 text-base font-medium">
            🔴 WIDGET DIVERS ACTIF - TEST RÉUSSI ! 🔴
          </p>

          <p className="text-sm text-gray-600 mt-2">
            Contenu: {diversContent.content}
          </p>

          <p className="text-xs text-gray-400 mt-1">
            Active: {diversContent.isActive ? "OUI" : "NON"}
          </p>

          {/* Debug: Affichage du contenu brut */}
          <div className="text-xs text-gray-400 mt-2 border-t pt-2">
            Contenu: {diversContent.content}
          </div>
        </div>
      </div>
    </Card>
  );
};
