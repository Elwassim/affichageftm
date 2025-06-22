import { Card } from "@/components/ui/card";
import { getDashboardData } from "@/lib/storage";
import { Clock, MapPin } from "lucide-react";

export const MeetingsWidget = () => {
  const { meetings } = getDashboardData();

  return (
    <Card className="p-6 bg-white shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Clock className="w-6 h-6" />
        Réunions du jour
      </h2>

      {meetings.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          Aucune réunion prévue aujourd'hui
        </div>
      ) : (
        <div className="space-y-4">
          {meetings.map((meeting) => (
            <div
              key={meeting.id}
              className="p-4 bg-gray-50 rounded-lg border-l-4 border-union-red"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 text-lg">
                    {meeting.title}
                  </h3>
                  <div className="flex items-center gap-4 mt-2 text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {meeting.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
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
