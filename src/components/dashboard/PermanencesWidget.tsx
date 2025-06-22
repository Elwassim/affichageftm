import { Card } from "@/components/ui/card";
import { getDashboardData } from "@/lib/storage";
import { Users, Clock } from "lucide-react";

export const PermanencesWidget = () => {
  const { permanences } = getDashboardData();

  return (
    <Card className="p-8 bg-white professional-shadow border-0">
      <div className="mb-6">
        <h2 className="text-3xl font-black text-cgt-gray flex items-center gap-3">
          <div className="w-10 h-10 bg-cgt-red rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          Permanences
        </h2>
        <div className="h-px bg-gradient-to-r from-cgt-red to-transparent w-1/3 mt-3"></div>
      </div>

      {permanences.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">
            Aucune permanence aujourd'hui
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {permanences.map((permanence, index) => (
            <div
              key={permanence.id}
              className="group p-6 bg-gradient-to-r from-gray-50 to-white rounded-xl border-l-4 border-cgt-red hover:shadow-md transition-all duration-200"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-cgt-red to-cgt-red-dark text-white rounded-full flex items-center justify-center font-bold text-lg">
                      {permanence.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-bold text-cgt-gray text-xl group-hover:text-cgt-red transition-colors">
                        {permanence.name}
                      </h3>
                      <div className="flex items-center gap-2 text-gray-600 mt-1">
                        <Clock className="w-4 h-4 text-cgt-red" />
                        <span className="font-medium">{permanence.time}</span>
                      </div>
                    </div>
                  </div>
                  <div className="ml-15">
                    <span className="inline-block bg-cgt-red/10 text-cgt-red px-3 py-1 rounded-full text-sm font-semibold">
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
