import { DateTimeWidget } from "@/components/dashboard/DateTimeWidget";
import { WeatherWidget } from "@/components/dashboard/WeatherWidget";
import { MeetingsWidget } from "@/components/dashboard/MeetingsWidget";
import { PermanencesWidget } from "@/components/dashboard/PermanencesWidget";
import { VideoWidget } from "@/components/dashboard/VideoWidget";
import { AlertBanner } from "@/components/dashboard/AlertBanner";
import { SocialWidget } from "@/components/dashboard/SocialWidget";
import { CGTHeader } from "@/components/dashboard/CGTHeader";
import { useRealTimeUpdates } from "@/hooks/useRealTimeUpdates";
import { Wifi } from "lucide-react";

const Index = () => {
  const { lastUpdate, isUpdating, updateCount } = useRealTimeUpdates({
    interval: 60000, // 1 minute
    enableWeather: true,
    enableDashboard: true,
  });

  return (
    <div className="h-screen cgt-gradient overflow-hidden relative">
      {/* Alert Banner */}
      <AlertBanner />

      {/* Compact CGT Header */}
      <CGTHeader />

      {/* Main Dashboard Grid - Optimized for TV */}
      <div className="p-4 h-[calc(100vh-120px)]">
        <div className="max-w-7xl mx-auto h-full">
          {/* TV Grid Layout - Optimized for larger video */}
          <div className="grid grid-cols-12 grid-rows-3 gap-4 h-full">
            {/* Row 1 - Top widgets */}
            <div className="col-span-3 row-span-1">
              <DateTimeWidget />
            </div>
            <div className="col-span-3 row-span-1">
              <WeatherWidget />
            </div>
            <div className="col-span-3 row-span-1">
              <MeetingsWidget />
            </div>
            <div className="col-span-3 row-span-1">
              <PermanencesWidget />
            </div>

            {/* Row 2 & 3 - Large video takes most space */}
            <div className="col-span-9 row-span-2">
              <VideoWidget />
            </div>
            <div className="col-span-3 row-span-2">
              <SocialWidget />
            </div>
          </div>

          {/* Real-time status indicator */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/20 backdrop-blur-sm rounded-full px-3 py-1">
            <Wifi
              className={`w-4 h-4 ${isUpdating ? "text-yellow-400 animate-pulse" : "text-green-400"}`}
            />
            <span className="text-white/90 text-xs">
              Temps réel • {updateCount} mises à jour
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
