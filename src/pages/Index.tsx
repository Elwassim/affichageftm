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
    <div className="min-h-screen cgt-gradient">
      {/* Alert Banner */}
      <AlertBanner />

      {/* Professional CGT Header */}
      <CGTHeader />

      {/* Main Dashboard Grid */}
      <div className="p-6 lg:p-8 pb-12">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Top Row - Date/Time and Weather */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <DateTimeWidget />
            <WeatherWidget />
          </div>

          {/* Middle Row - Meetings and Permanences */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <MeetingsWidget />
            <PermanencesWidget />
          </div>

          {/* Bottom Row - Video and Social */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2">
              <VideoWidget />
            </div>
            <div className="xl:col-span-1">
              <SocialWidget />
            </div>
          </div>

          {/* CGT Footer */}
          <div className="mt-12 pt-8 border-t border-white/20">
            <div className="text-center text-white/90">
              <p className="text-lg font-semibold mb-2">
                Confédération Générale du Travail
              </p>
              <p className="text-sm opacity-80">
                Défendre les droits des travailleurs • Solidarité • Justice
                sociale
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
