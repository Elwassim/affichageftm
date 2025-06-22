import { Card } from "@/components/ui/card";
import { getDashboardData } from "@/lib/storage";
import { Clock, MapPin } from "lucide-react";

export const MeetingsWidget = () => {
  const { meetings } = getDashboardData();

  return (
    <Card className="p-8 bg-white professional-shadow border-0">
      <div className="mb-6">
        <h2 className="text-3xl font-black text-cgt-gray flex items-center gap-3">
          <div className="w-10 h-10 bg-cgt-red rounded-lg flex items-center justify-center">
            <Clock className="w-6 h-6 text-white" />
          </div>
          Réunions du jour
        </h2>
        <div className="h-px bg-gradient-to-r from-cgt-red to-transparent w-1/3 mt-3"></div>
      </div>

      {meetings.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">
            Aucune réunion prévue aujourd'hui
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {meetings.map((meeting, index) => (
            <div
              key={meeting.id}
              className="group p-6 bg-gradient-to-r from-gray-50 to-white rounded-xl border-l-4 border-cgt-red hover:shadow-md transition-all duration-200"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-8 h-8 bg-cgt-red text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <h3 className="font-bold text-cgt-gray text-xl group-hover:text-cgt-red transition-colors">
                      {meeting.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-6 text-gray-600">
                    <span className="flex items-center gap-2 font-medium">
                      <Clock className="w-5 h-5 text-cgt-red" />
                      {meeting.time}
                    </span>
                    <span className="flex items-center gap-2 font-medium">
                      <MapPin className="w-5 h-5 text-cgt-red" />
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
