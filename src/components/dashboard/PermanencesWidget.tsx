import { Card } from "@/components/ui/card";
import { getDashboardData } from "@/lib/storage";
import { Users, Clock } from "lucide-react";

export const PermanencesWidget = () => {
  const { permanences } = getDashboardData();

  return (
    <Card className="p-4 bg-white professional-shadow border-0 h-full">
      <div className="mb-3">
        <h2 className="text-lg font-black text-cgt-gray flex items-center gap-2">
          <div className="w-6 h-6 bg-cgt-red rounded flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          Permanences
        </h2>
        <div className="h-px bg-gradient-to-r from-cgt-red to-transparent w-1/3 mt-1"></div>
      </div>

      {permanences.length === 0 ? (
        <div className="text-center py-6">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Users className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-gray-500 text-xs">Aucune permanence</p>
        </div>
      ) : (
        <div className="space-y-2 overflow-y-auto max-h-[200px]">
          {permanences.slice(0, 3).map((permanence) => (
            <div
              key={permanence.id}
              className="p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border-l-2 border-cgt-red"
            >
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-cgt-red to-cgt-red-dark text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {permanence.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-cgt-gray text-sm truncate">
                    {permanence.name}
                  </h3>
                  <div className="flex items-center gap-1 text-gray-600 text-xs mt-1">
                    <Clock className="w-3 h-3 text-cgt-red" />
                    <span className="font-medium">{permanence.time}</span>
                  </div>
                  <div className="mt-1">
                    <span className="inline-block bg-cgt-red/10 text-cgt-red px-2 py-0.5 rounded-full text-xs font-medium">
                      {permanence.theme}
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
