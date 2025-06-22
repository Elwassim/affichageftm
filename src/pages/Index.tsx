import { DateTimeWidget } from "@/components/dashboard/DateTimeWidget";
import { WeatherWidget } from "@/components/dashboard/WeatherWidget";
import { MeetingsWidget } from "@/components/dashboard/MeetingsWidget";
import { PermanencesWidget } from "@/components/dashboard/PermanencesWidget";
import { VideoWidget } from "@/components/dashboard/VideoWidget";
import { AlertBanner } from "@/components/dashboard/AlertBanner";
import { SocialWidget } from "@/components/dashboard/SocialWidget";
import { CGTHeader } from "@/components/dashboard/CGTHeader";

const Index = () => {
  return (
    <div className="h-screen cgt-gradient overflow-hidden">
      {/* Alert Banner */}
      <AlertBanner />

      {/* Compact CGT Header */}
      <CGTHeader />

      {/* Main Dashboard Grid - Optimized for TV */}
      <div className="p-4 h-[calc(100vh-120px)]">
        <div className="max-w-7xl mx-auto h-full">
          {/* TV Grid Layout - 3 columns, 2 rows */}
          <div className="grid grid-cols-4 grid-rows-2 gap-4 h-full">
            {/* Row 1 */}
            <div className="col-span-1">
              <DateTimeWidget />
            </div>
            <div className="col-span-1">
              <WeatherWidget />
            </div>
            <div className="col-span-1">
              <MeetingsWidget />
            </div>
            <div className="col-span-1">
              <PermanencesWidget />
            </div>

            {/* Row 2 */}
            <div className="col-span-3">
              <VideoWidget />
            </div>
            <div className="col-span-1">
              <SocialWidget />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
