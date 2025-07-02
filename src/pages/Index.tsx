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
    <div className="h-screen w-screen cgt-gradient overflow-hidden relative">
      {/* Alert Banner */}
      <AlertBanner />

      {/* Compact CGT Header */}
      <CGTHeader />

      {/* Main Dashboard Grid - Full Screen TV Layout */}
      <div className="p-3 h-[calc(100vh-100px)] w-full">
        <div className="w-full h-full">
          {/* TV Full Screen Layout - Matching exact design */}
          <div className="grid grid-cols-12 grid-rows-4 gap-3 h-full w-full">
            {/* Top Row - Left side: Time and Weather */}
            <div className="col-span-2 row-span-1">
              <DateTimeWidget />
            </div>
            <div className="col-span-2 row-span-1">
              <WeatherWidget />
            </div>

            {/* Top Row - Right side: Meetings and Permanences (larger) */}
            <div className="col-span-4 row-span-1">
              <MeetingsWidget />
            </div>
            <div className="col-span-4 row-span-1">
              <PermanencesWidget />
            </div>

            {/* Bottom Area - Large video on left */}
            <div className="col-span-8 row-span-3">
              <VideoWidget />
            </div>

            {/* Bottom Area - Hommage on right */}
            <div className="col-span-4 row-span-3">
              <SocialWidget />
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
    </div>
  );
};

export default Index;
