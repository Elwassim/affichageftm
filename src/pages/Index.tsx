import { DateTimeWidget } from "@/components/dashboard/DateTimeWidget";
import { MeetingsWidget } from "@/components/dashboard/MeetingsWidget";
import { DiversWidget } from "@/components/dashboard/DiversWidget";
import { VideoWidget } from "@/components/dashboard/VideoWidget";
import { AlertBanner } from "@/components/dashboard/AlertBanner";
import { SocialWidget } from "@/components/dashboard/SocialWidget";
import { RSSWidget } from "@/components/dashboard/RSSWidget";
import { CGTHeader } from "@/components/dashboard/CGTHeader";
import { PermanencesCombinedWidget } from "@/components/dashboard/PermanencesCombinedWidget";
import { useRealTimeUpdates } from "@/hooks/useRealTimeUpdates";
import { Wifi } from "lucide-react";

const Index = () => {
  const { lastUpdate, isUpdating, updateCount } = useRealTimeUpdates({
    interval: 60000, // 1 minute
    enableDashboard: true,
  });

  return (
    <div className="h-screen w-screen cgt-gradient overflow-hidden relative">
      {/* Alert Banner */}
      <AlertBanner />

      {/* Compact CGT Header */}
      <CGTHeader />

      {/* Main Dashboard Grid - Full Screen TV Layout */}
      <div className="p-3 h-[calc(100vh-150px)] w-full">
        <div className="w-full h-full">
          {/* Layout avec permanences - 4 colonnes */}
          <div
            className="grid grid-cols-4 gap-4 h-full"
            style={{ gridTemplateRows: "1fr 2fr" }}
          >
            {/* Col 1 Row 1: DATE/MÉTÉO */}
            <div className="col-start-1 col-end-2 row-start-1 row-end-2">
              <DateTimeWidget />
            </div>

            {/* Col 2 Row 1: DIVERS */}
            <div className="col-start-2 col-end-3 row-start-1 row-end-2">
              <DiversWidget />
            </div>

            {/* Col 3 Row 1: PERMANENCES */}
            <div className="col-start-3 col-end-4 row-start-1 row-end-2">
              <PermanencesCombinedWidget />
            </div>

            {/* Col 4 Row 1-2: HOMMAGE (2 rangées) */}
            <div className="col-start-4 col-end-5 row-start-1 row-end-3">
              <SocialWidget />
            </div>

            {/* Col 1 Row 2: REUNION */}
            <div className="col-start-1 col-end-2 row-start-2 row-end-3">
              <MeetingsWidget />
            </div>

            {/* Col 2 Row 2: VIDEO */}
            <div className="col-start-2 col-end-3 row-start-2 row-end-3">
              <VideoWidget />
            </div>

            {/* Col 3 Row 2: Empty space */}
            <div className="col-start-3 col-end-4 row-start-2 row-end-3">
              {/* Espace libre */}
            </div>
          </div>

          {/* Real-time status indicator */}
          <div className="absolute bottom-2 left-2 flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-full px-2 py-1">
            <Wifi
              className={`w-3 h-3 ${isUpdating ? "text-yellow-400 animate-pulse" : "text-green-400"}`}
            />
            <span className="text-white/90 text-xs">
              Temps réel • {updateCount}
            </span>
          </div>
        </div>
      </div>

      {/* RSS France Info Widget - Full Width Bottom */}
      <RSSWidget />
    </div>
  );
};

export default Index;
