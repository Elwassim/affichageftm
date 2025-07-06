import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";

export const DiversWidget = () => {
  return (
    <Card className="p-3 bg-white professional-shadow border-0 h-full flex flex-col">
      <div className="mb-3">
        <h2 className="text-xl font-black text-cgt-gray flex items-center gap-2">
          <div className="w-7 h-7 bg-cgt-red rounded flex items-center justify-center">
            <Info className="w-5 h-5 text-white" />
          </div>
          Divers
        </h2>
        <div className="h-px bg-gradient-to-r from-cgt-red to-transparent w-1/3 mt-1"></div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="text-center py-4">
          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Info className="w-3 h-3 text-gray-400" />
          </div>
          <p className="text-gray-500 text-base">Informations diverses</p>
        </div>
      </div>
    </Card>
  );
};
