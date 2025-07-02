import { Card } from "@/components/ui/card";
import { MapPin, Clock } from "lucide-react";

export const MeetingRoomWidget = () => {
  return (
    <Card className="p-3 bg-white professional-shadow border-0 h-full flex flex-col">
      <div className="mb-2">
        <h2 className="text-base font-black text-cgt-gray flex items-center gap-2">
          <div className="w-5 h-5 bg-cgt-red rounded flex items-center justify-center">
            <MapPin className="w-3 h-3 text-white" />
          </div>
          Salle de Réunion
        </h2>
        <div className="h-px bg-gradient-to-r from-cgt-red to-transparent w-1/3 mt-1"></div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-gradient-to-br from-cgt-red to-cgt-red-dark rounded-full flex items-center justify-center mx-auto">
            <MapPin className="w-6 h-6 text-white" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-cgt-gray mb-1">
              Salle Rouge
            </h3>
            <p className="text-sm text-gray-600 font-medium">
              Salle principale
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>Disponible</span>
          </div>

          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="w-3/4 h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full"></div>
          </div>
          <p className="text-xs text-gray-500">Capacité: 24/32 personnes</p>
        </div>
      </div>
    </Card>
  );
};
