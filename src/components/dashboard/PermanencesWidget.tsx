import { Card } from "@/components/ui/card";
import { getDashboardData } from "@/lib/storage";
import { Users, Clock } from "lucide-react";
import { useEffect, useRef } from "react";

export const PermanencesWidget = () => {
  const { permanences } = getDashboardData();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || permanences.length <= 2) return;

    let scrollPosition = 0;
    const scrollSpeed = 0.5;
    const pauseTime = 2000;
    let isPaused = false;

    const autoScroll = () => {
      if (isPaused) return;

      scrollPosition += scrollSpeed;
      const maxScroll =
        scrollContainer.scrollHeight - scrollContainer.clientHeight;

      if (scrollPosition >= maxScroll) {
        isPaused = true;
        setTimeout(() => {
          scrollPosition = 0;
          scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
          setTimeout(() => {
            isPaused = false;
          }, 1000);
        }, pauseTime);
      } else {
        scrollContainer.scrollTop = scrollPosition;
      }
    };

    const interval = setInterval(autoScroll, 50);
    return () => clearInterval(interval);
  }, [permanences.length]);

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
        <div
          ref={scrollRef}
          className="space-y-2 overflow-y-auto max-h-[180px] scrollbar-hide"
        >
          {permanences.map((permanence) => (
            <div
              key={permanence.id}
              className="group p-2 bg-gradient-to-r from-gray-50 to-white rounded-lg border-l-2 border-cgt-red hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-cgt-red to-cgt-red-dark text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {permanence.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-cgt-gray text-xs truncate leading-tight">
                    {permanence.name}
                  </h3>
                  <div className="flex items-center gap-1 text-gray-600 text-xs mt-0.5">
                    <Clock className="w-2.5 h-2.5 text-cgt-red" />
                    <span className="font-medium">{permanence.time}</span>
                  </div>
                  <div className="mt-0.5">
                    <span className="inline-block bg-cgt-red/10 text-cgt-red px-1.5 py-0.5 rounded text-xs font-medium">
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
