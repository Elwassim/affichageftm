import { Card } from "@/components/ui/card";
import { Clock, MapPin, Calendar } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getMeetings, type Meeting } from "@/lib/database";

export const MeetingsWidget = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      console.log("Formatting date:", dateString);

      // Parse date correctly (assuming YYYY-MM-DD format)
      const date = new Date(dateString + "T00:00:00");
      const today = new Date();
      const tomorrow = new Date(today);

      // Normalize dates to midnight for proper comparison
      today.setHours(0, 0, 0, 0);
      tomorrow.setDate(today.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);

      console.log("Parsed date:", date.toDateString());
      console.log("Today:", today.toDateString());
      console.log("Tomorrow:", tomorrow.toDateString());

      // Check if it's today
      if (date.getTime() === today.getTime()) {
        return "Aujourd'hui";
      }

      // Check if it's tomorrow
      if (date.getTime() === tomorrow.getTime()) {
        return "Demain";
      }

      // Otherwise show day name and date
      const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
      const dayName = dayNames[date.getDay()];
      const day = date.getDate();
      const monthNames = [
        "Jan",
        "Fév",
        "Mar",
        "Avr",
        "Mai",
        "Jun",
        "Jul",
        "Aoû",
        "Sep",
        "Oct",
        "Nov",
        "Déc",
      ];
      const month = monthNames[date.getMonth()];

      return `${dayName} ${day} ${month}`;
    } catch (error) {
      console.error("Date formatting error:", error);
      return dateString;
    }
  };

  // Filter meetings for next 7 days
  const filterNext7DaysMeetings = (meetings: Meeting[]) => {
    const today = new Date();
    const next7Days = new Date(today);
    next7Days.setDate(today.getDate() + 7);

    return meetings.filter((meeting) => {
      const meetingDate = new Date(meeting.date);
      return meetingDate >= today && meetingDate <= next7Days;
    });
  };

  useEffect(() => {
    const loadMeetings = async () => {
      try {
        const meetingsData = await getMeetings();
        const filteredMeetings = filterNext7DaysMeetings(meetingsData);
        setMeetings(filteredMeetings);
      } catch (error) {
        console.error("Error loading meetings:", error);
      }
    };

    loadMeetings();
    const timer = setInterval(loadMeetings, 60000); // Refresh every 60 seconds

    return () => clearInterval(timer);
  }, []);

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
            <Calendar className="w-4 h-4 text-white" />
          </div>
          Réunions - 7 jours
        </h2>
        <div className="h-px bg-gradient-to-r from-cgt-red to-transparent w-1/3 mt-1"></div>
      </div>

      {meetings.length === 0 ? (
        <div className="text-center py-4">
          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Calendar className="w-3 h-3 text-gray-400" />
          </div>
          <p className="text-gray-500 text-xs">
            Aucune réunion ces 7 prochains jours
          </p>
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
                        <div className="flex items-center gap-1 text-gray-600 text-xs mt-1">
                          <Calendar className="w-3 h-3 text-cgt-red" />
                          <span className="font-semibold text-cgt-red">
                            {formatDate(meeting.date)}
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
