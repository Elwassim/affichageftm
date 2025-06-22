import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DateTimeWidget } from "@/components/dashboard/DateTimeWidget";
import { WeatherWidget } from "@/components/dashboard/WeatherWidget";
import { MeetingsWidget } from "@/components/dashboard/MeetingsWidget";
import { PermanencesWidget } from "@/components/dashboard/PermanencesWidget";
import { VideoWidget } from "@/components/dashboard/VideoWidget";
import { AlertBanner } from "@/components/dashboard/AlertBanner";
import { SocialWidget } from "@/components/dashboard/SocialWidget";
import { Settings } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-union-red">
      {/* Alert Banner */}
      <AlertBanner />

      {/* Header with admin link */}
      <div className="p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-4xl font-bold text-white">
            SYNDICAT - TABLEAU DE BORD
          </h1>
          <Link to="/admin">
            <Button
              variant="outline"
              size="sm"
              className="bg-white text-union-red hover:bg-gray-100"
            >
              <Settings className="w-4 h-4 mr-2" />
              Administration
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="p-4 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Top Row - Date/Time and Weather */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <DateTimeWidget />
            <WeatherWidget />
          </div>

          {/* Middle Row - Meetings and Permanences */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <MeetingsWidget />
            <PermanencesWidget />
          </div>

          {/* Bottom Row - Video and Social */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <VideoWidget />
            </div>
            <div className="xl:col-span-1">
              <SocialWidget />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
