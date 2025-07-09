import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Heart, Clock } from "lucide-react";
import { useTributeRotation } from "@/hooks/useTributeRotation";

export const SocialWidget = () => {
  const { currentTribute, totalTributes, currentIndex } =
    useTributeRotation(30000);

  const tributes = totalTributes > 0 ? [currentTribute] : [];

  return (
    <Card className="p-3 bg-white professional-shadow border-0 h-full">
      <div className="mb-2">
        <h2 className="text-xl font-black text-cgt-gray flex items-center gap-2">
          <div className="w-7 h-7 bg-cgt-red rounded flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          Hommage
        </h2>
        <div className="h-px bg-gradient-to-r from-cgt-red to-transparent w-1/3 mt-1"></div>
      </div>

      <div className="h-[calc(100%-2.5rem)] overflow-y-auto">
        {currentTribute ? (
          <div className="p-3 bg-gradient-to-r from-red-50 to-white rounded-lg border border-red-100 shadow-sm h-full">
            <div className="text-center space-y-3 h-full flex flex-col">
              {/* Progress indicator */}
              {totalTributes > 1 && (
                <div className="flex justify-center gap-1 mb-2">
                  {Array.from({ length: totalTributes }).map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentIndex ? "bg-cgt-red" : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Photo */}
              <div className="flex justify-center">
                <Avatar className="w-40 h-40 ring-4 ring-cgt-red/20">
                  <AvatarImage
                    src={currentTribute.photo}
                    alt={currentTribute.name}
                  />
                  <AvatarFallback className="bg-cgt-red text-white font-bold text-3xl">
                    {currentTribute.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Name and title */}
              <div>
                <h3 className="font-bold text-cgt-gray text-lg mb-1">
                  {currentTribute.name}
                </h3>
                <div className="w-8 h-px bg-cgt-red mx-auto"></div>
              </div>

              {/* Text */}
              <div className="flex-1 flex items-center">
                <p className="text-gray-700 leading-relaxed text-base font-semibold text-center">
                  {currentTribute.text}
                </p>
              </div>

              {/* Footer */}
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Heart className="w-3 h-3 text-cgt-red" />
                  <span className="text-xs text-cgt-red font-bold uppercase tracking-wide">
                    En Mémoire
                  </span>
                  <Heart className="w-3 h-3 text-cgt-red" />
                </div>

                {totalTributes > 1 && (
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>Rotation toutes les 30s</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-gradient-to-r from-red-50 to-white rounded-lg border border-red-100 shadow-sm h-full">
            <div className="text-center space-y-3 h-full flex flex-col items-center justify-center">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <h3 className="font-bold text-gray-500 text-sm mb-1">
                  Aucun hommage configuré
                </h3>
                <p className="text-gray-400 text-xs">
                  Ajoutez des hommages dans le panel d'administration
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
