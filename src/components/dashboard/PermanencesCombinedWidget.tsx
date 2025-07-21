import { Card } from "@/components/ui/card";
import { Users, Calendar } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  getNext7DaysPermanences,
  getTypeLabel,
  type DashboardPermanence,
} from "@/lib/permanencesNext7Days";

export const PermanencesCombinedWidget = () => {
  const [permanencesTech, setPermanencesTech] = useState<DashboardPermanence[]>(
    [],
  );
  const [permanencesPolitiques, setPermanencesPolitiques] = useState<
    DashboardPermanence[]
  >([]);
  const scrollRefTech = useRef<HTMLDivElement>(null);
  const scrollRefPolitiques = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadPermanences = async () => {
      try {
        const permanencesData = await getNext7DaysPermanences();
        console.log("🔍 Toutes les permanences:", permanencesData);

        const today = new Date();
        const todayStr = today.toISOString().split("T")[0]; // YYYY-MM-DD

        // Calculer le début et la fin de la semaine courante (lundi à dimanche)
        const currentDay = today.getDay();
        const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; // Dimanche = 0, donc -6 pour obtenir lundi
        const monday = new Date(today);
        monday.setDate(today.getDate() + mondayOffset);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);

        console.log("📅 Semaine courante:", monday.toDateString(), "->", sunday.toDateString());

        // Permanences techniques : seulement celle d'aujourd'hui
        const techniques = permanencesData.filter(
          (p) => p.type === "technique" && p.date === todayStr,
        );
        console.log("🔧 Permanences techniques aujourd'hui:", techniques);

        // Permanences politiques : seulement celles de cette semaine
        const politiques = permanencesData.filter((p) => {
          if (p.type !== "politique") return false;
          const permanenceDate = new Date(p.date + "T00:00:00");
          permanenceDate.setHours(0, 0, 0, 0);

          const mondayNormalized = new Date(monday);
          mondayNormalized.setHours(0, 0, 0, 0);

          const sundayNormalized = new Date(sunday);
          sundayNormalized.setHours(23, 59, 59, 999);

          const isInWeek = permanenceDate >= mondayNormalized && permanenceDate <= sundayNormalized;
          console.log("🏛️ Permanence politique:", p.name, p.date);
          console.log("   Date permanence:", permanenceDate.toDateString());
          console.log("   Lundi semaine:", mondayNormalized.toDateString());
          console.log("   Dimanche semaine:", sundayNormalized.toDateString());
          console.log("   Dans la semaine?", isInWeek);
          return isInWeek;
        });
        console.log("🏛️ Total permanences politiques cette semaine:", politiques);

        setPermanencesTech(techniques);
        setPermanencesPolitiques(politiques);
      } catch (error) {
        console.error("❌ Erreur chargement permanences:", error);
      }
    };

    loadPermanences();
    const timer = setInterval(loadPermanences, 60000);

    // Écouter les événements de mise à jour des permanences
    const handleConfigUpdate = (event: any) => {
      if (
        event.detail?.key === "permanences" ||
        event.detail?.key === "synced"
      ) {
        console.log("🔄 Rafraîchissement permanences suite à événement");
        loadPermanences();
      }
    };

    window.addEventListener("cgt-config-updated", handleConfigUpdate);

    return () => {
      clearInterval(timer);
      window.removeEventListener("cgt-config-updated", handleConfigUpdate);
    };
  }, []);

  // Auto-scroll pour les permanences techniques (sans délai)
  useEffect(() => {
    const scrollContainer = scrollRefTech.current;
    if (!scrollContainer || permanencesTech.length <= 1) return;

    let scrollPosition = 0;
    const scrollSpeed = 1;

    const autoScroll = () => {
      scrollPosition += scrollSpeed;
      const maxScroll =
        scrollContainer.scrollHeight - scrollContainer.clientHeight;

      if (scrollPosition >= maxScroll) {
        scrollPosition = 0;
        scrollContainer.scrollTo({ top: 0, behavior: "auto" });
      } else {
        scrollContainer.scrollTop = scrollPosition;
      }
    };

    const interval = setInterval(autoScroll, 50);
    return () => clearInterval(interval);
  }, [permanencesTech.length]);

  // Auto-scroll pour les permanences politiques (sans délai)
  useEffect(() => {
    const scrollContainer = scrollRefPolitiques.current;
    if (!scrollContainer || permanencesPolitiques.length <= 1) return;

    let scrollPosition = 0;
    const scrollSpeed = 1;

    const autoScroll = () => {
      scrollPosition += scrollSpeed;
      const maxScroll =
        scrollContainer.scrollHeight - scrollContainer.clientHeight;

      if (scrollPosition >= maxScroll) {
        scrollPosition = 0;
        scrollContainer.scrollTo({ top: 0, behavior: "auto" });
      } else {
        scrollContainer.scrollTop = scrollPosition;
      }
    };

    const interval = setInterval(autoScroll, 50);
    return () => clearInterval(interval);
  }, [permanencesPolitiques.length]);

  const renderPermanenceItem = (permanence: DashboardPermanence) => (
    <div
      key={permanence.id}
      className="group p-1.5 bg-gradient-to-r from-gray-50 to-white rounded-lg border-l-3 hover:shadow-md transition-shadow w-full"
      style={{ borderLeftColor: permanence.color }}
    >
      <div className="flex items-start gap-2 w-full overflow-hidden">
        <div
          className="w-7 h-7 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
          style={{ backgroundColor: permanence.color }}
        >
          {permanence.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0 overflow-hidden">
          <h3 className="font-bold text-cgt-gray text-lg truncate leading-tight">
            {permanence.name}
          </h3>
          <div className="flex items-center gap-1 text-gray-600 text-base mt-0.5 overflow-hidden">
            <Calendar
              className="w-5 h-5 flex-shrink-0"
              style={{ color: permanence.color }}
            />
            <span className="font-semibold truncate">
              {permanence.displayDate}
            </span>
          </div>
          <div className="mt-0.5">
            <span
              className="inline-block px-1.5 py-0.5 rounded text-xs font-semibold text-white truncate max-w-full"
              style={{ backgroundColor: permanence.color }}
            >
              {getTypeLabel(permanence.type)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col gap-1 overflow-hidden">
      {/* Rectangle 1 - Permanences Techniques */}
      <Card className="p-3 bg-white professional-shadow border-0 flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="mb-2 flex-shrink-0">
          <h2 className="text-lg font-black text-white bg-cgt-red px-3 py-1 rounded flex items-center gap-2">
            <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
              <Users className="w-4 h-4 text-cgt-red" />
            </div>
            <p className="truncate">PERMANENCE TECHNIQUE</p>
          </h2>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          {permanencesTech.length === 0 ? (
            <div className="text-center py-2">
              <div className="w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-1">
                <Users className="w-2 h-2 text-gray-400" />
              </div>
              <p className="text-gray-500 text-xs">
                Aucune permanence aujourd'hui
              </p>
            </div>
          ) : (
            <div
              ref={scrollRefTech}
              className="space-y-0.5 overflow-y-auto flex-1 min-h-0 scrollbar-hide h-full"
            >
              {permanencesTech.map(renderPermanenceItem)}
            </div>
          )}
        </div>
      </Card>

      {/* Rectangle 2 - Permanences Politiques */}
      <Card className="p-3 bg-white professional-shadow border-0 flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="mb-2 flex-shrink-0">
          <h2 className="text-lg font-black text-white bg-cgt-red px-3 py-1 rounded flex items-center gap-2">
            <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
              <Users className="w-4 h-4 text-cgt-red" />
            </div>
            <p className="truncate">PERMANENCE POLITIQUE</p>
          </h2>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          {permanencesPolitiques.length === 0 ? (
            <div className="text-center py-2">
              <div className="w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-1">
                <Users className="w-2 h-2 text-gray-400" />
              </div>
              <p className="text-gray-500 text-xs">
                Aucune permanence cette semaine
              </p>
            </div>
          ) : (
            <div
              ref={scrollRefPolitiques}
              className="space-y-0.5 overflow-y-auto flex-1 min-h-0 scrollbar-hide h-full"
            >
              {permanencesPolitiques.map(renderPermanenceItem)}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
