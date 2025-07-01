import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getDashboardData } from "@/lib/storage";
import { Heart } from "lucide-react";

export const SocialWidget = () => {
  const { socialPost } = getDashboardData();

  return (
    <Card className="p-3 bg-white professional-shadow border-0 h-full">
      <div className="mb-2">
        <h2 className="text-base font-black text-cgt-gray flex items-center gap-2">
          <div className="w-5 h-5 bg-cgt-red rounded flex items-center justify-center">
            <Heart className="w-3 h-3 text-white" />
          </div>
          Hommage
        </h2>
        <div className="h-px bg-gradient-to-r from-cgt-red to-transparent w-1/3 mt-1"></div>
      </div>

      <div className="h-[calc(100%-2.5rem)] overflow-y-auto">
        <div className="p-3 bg-gradient-to-r from-red-50 to-white rounded-lg border border-red-100 shadow-sm">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cgt-red to-cgt-red-dark rounded-full flex items-center justify-center mx-auto">
              <Heart className="w-6 h-6 text-white" />
            </div>

            <div>
              <h3 className="font-bold text-cgt-gray text-sm mb-1">
                Hommage aux Travailleurs
              </h3>
              <div className="w-8 h-px bg-cgt-red mx-auto mb-2"></div>
            </div>

            <p className="text-gray-700 leading-relaxed text-xs font-medium text-center">
              "En mémoire de nos camarades tombés pour la défense des droits des
              travailleurs. Leur engagement et leur sacrifice continuent
              d'inspirer notre lutte pour la justice sociale et la dignité au
              travail."
            </p>

            <div className="flex items-center justify-center gap-2 pt-2">
              <div className="w-2 h-2 bg-cgt-red rounded-full"></div>
              <span className="text-xs text-cgt-red font-bold uppercase tracking-wide">
                Solidarité Éternelle
              </span>
              <div className="w-2 h-2 bg-cgt-red rounded-full"></div>
            </div>

            <div className="text-xs text-gray-500 font-medium pt-1">
              CGT FTM - Fédération des Travailleurs de la Métallurgie
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
