import { Card } from "@/components/ui/card";
import { getDashboardData } from "@/lib/storage";
import { Clock, MapPin } from "lucide-react";
import { useEffect, useRef } from "react";

export const MeetingsWidget = () => {
  const { meetings } = getDashboardData();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Group meetings by category
  const groupedMeetings = meetings.reduce(
    (acc, meeting) => {
      if (!acc[meeting.category]) {
        acc[meeting.category] = [];
      }
      acc[meeting.category].push(meeting);
      return acc;
    },
    {} as Record<string, typeof meetings>,
  );

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || meetings.length <= 2) return;

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
  }, [meetings.length]);

  return (
    <Card className="p-3 bg-white professional-shadow border-0 h-full flex flex-col">
      <div className="mb-3">
        <h2 className="text-lg font-black text-cgt-gray flex items-center gap-2">
          <div className="w-6 h-6 bg-cgt-red rounded flex items-center justify-center">
            <Clock className="w-4 h-4 text-white" />
          </div>
          Réunions
        </h2>
        <div className="h-px bg-gradient-to-r from-cgt-red to-transparent w-1/3 mt-1"></div>
      </div>

      {meetings.length === 0 ? (
        <div className="text-center py-4">
          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Clock className="w-3 h-3 text-gray-400" />
          </div>
          <p className="text-gray-500 text-xs">Aucune réunion</p>
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="space-y-2 overflow-y-auto flex-1 min-h-0 scrollbar-hide"
        >
          {Object.entries(groupedMeetings).map(
            ([category, categoryMeetings]) => (
              <div key={category} className="space-y-1">
                {/* Category Header */}
                <div className="flex items-center gap-2 px-2">
                  <div className="w-2 h-2 bg-cgt-red rounded-full"></div>
                  <h4 className="text-xs font-bold text-cgt-red uppercase tracking-wide">
                    {category}
                  </h4>
                  <div className="flex-1 h-px bg-cgt-red/30"></div>
                </div>

                {/* Meetings in category */}
                {categoryMeetings.map((meeting, index) => (
                  <div
                    key={meeting.id}
                    className="group p-2 bg-gradient-to-r from-gray-50 to-white rounded-lg border-l-2 border-cgt-red hover:shadow-sm transition-shadow ml-2"
                  >
                    <div className="flex items-start gap-2">
                      <span className="w-4 h-4 bg-cgt-red text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-cgt-gray text-sm truncate leading-tight">
                          {meeting.title}
                        </h3>
                        <div className="flex items-center gap-2 text-gray-600 text-xs mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-cgt-red" />
                            <span className="font-semibold">
                              {meeting.time}
                            </span>
                          </span>
                          <span className="flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 text-cgt-red" />
                            <span className="font-semibold">
                              {meeting.room}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ),
          )}
        </div>
      )}
    </Card>
  );
};
