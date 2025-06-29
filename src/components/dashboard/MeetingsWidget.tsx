import { Card } from "@/components/ui/card";
import { getDashboardData } from "@/lib/storage";
import { Clock, MapPin } from "lucide-react";

export const MeetingsWidget = () => {
  const { meetings } = getDashboardData();

  return (
    <Card className="p-4 bg-white professional-shadow border-0 h-full">
      <div className="mb-3">
        <h2 className="text-lg font-black text-cgt-gray flex items-center gap-2">
          <div className="w-6 h-6 bg-cgt-red rounded flex items-center justify-center">
            <Clock className="w-4 h-4 text-white" />
          </div>
          Réunions
        </h2>
        <div className="h-px bg-gradient-to-r from-cgt-red to-transparent w-1/3 mt-1"></div>
      </div>

      {meetings.length === 0 ? (
        <div className="text-center py-6">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Clock className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-gray-500 text-xs">Aucune réunion</p>
        </div>
      ) : (
        <div className="space-y-2 overflow-y-auto max-h-[180px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {meetings.map((meeting, index) => (
            <div
              key={meeting.id}
              className="group p-2 bg-gradient-to-r from-gray-50 to-white rounded-lg border-l-2 border-cgt-red hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 bg-cgt-red text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-cgt-gray text-xs truncate leading-tight">
                    {meeting.title}
                  </h3>
                  <div className="flex items-center gap-2 text-gray-600 text-xs mt-0.5">
                    <span className="flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5 text-cgt-red" />
                      {meeting.time}
                    </span>
                    <span className="flex items-center gap-0.5 truncate">
                      <MapPin className="w-2.5 h-2.5 text-cgt-red" />
                      {meeting.room}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
