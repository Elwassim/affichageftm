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
    const pauseTime = 4000;
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
    <Card className="p-3 bg-white professional-shadow border-0 h-full">
      <div className="mb-2">
        <h2 className="text-base font-black text-cgt-gray flex items-center gap-2">
          <div className="w-5 h-5 bg-cgt-red rounded flex items-center justify-center">
            <Users className="w-3 h-3 text-white" />
          </div>
          Permanences
        </h2>
        <div className="h-px bg-gradient-to-r from-cgt-red to-transparent w-1/3 mt-1"></div>
      </div>

      {permanences.length === 0 ? (
        <div className="text-center py-4">
          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Users className="w-3 h-3 text-gray-400" />
          </div>
          <p className="text-gray-500 text-xs">Aucune permanence</p>
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="space-y-1.5 overflow-y-auto max-h-[200px] scrollbar-hide"
        >
          {permanences.map((permanence) => (
            <div
              key={permanence.id}
              className="group p-2.5 bg-gradient-to-r from-gray-50 to-white rounded-lg border-l-3 border-cgt-red hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 bg-gradient-to-br from-cgt-red to-cgt-red-dark text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {permanence.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-cgt-gray text-sm truncate leading-tight">
                    {permanence.name}
                  </h3>
                  <div className="flex items-center gap-1 text-gray-600 text-xs mt-1">
                    <Clock className="w-3 h-3 text-cgt-red" />
                    <span className="font-semibold">{permanence.time}</span>
                  </div>
                  <div className="mt-1">
                    <span className="inline-block bg-cgt-red/15 text-cgt-red px-2 py-0.5 rounded-md text-xs font-semibold">
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
