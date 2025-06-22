import { Card } from "@/components/ui/card";
import { getDashboardData } from "@/lib/storage";
import { Users, Clock } from "lucide-react";

export const PermanencesWidget = () => {
  const { permanences } = getDashboardData();

  return (
    <Card className="p-6 bg-white shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Users className="w-6 h-6" />
        Permanences
      </h2>

      {permanences.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          Aucune permanence aujourd'hui
        </div>
      ) : (
        <div className="space-y-4">
          {permanences.map((permanence) => (
            <div
              key={permanence.id}
              className="p-4 bg-gray-50 rounded-lg border-l-4 border-union-red"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 text-lg">
                    {permanence.name}
                  </h3>
                  <div className="flex items-center gap-4 mt-2 text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {permanence.time}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-gray-600 font-medium">
                    {permanence.theme}
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
