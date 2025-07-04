import { useState, useEffect } from "react";
import { Globe } from "lucide-react";

interface RSSItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
}

export const RSSWidget = () => {
  const [newsItems, setNewsItems] = useState<RSSItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Simulation de flux RSS France Info (en prod, vous utiliseriez une vraie API)
  useEffect(() => {
    const mockNews: RSSItem[] = [
      {
        title: "Actualités économiques : La croissance française en hausse",
        link: "#",
        pubDate: new Date().toISOString(),
        description: "L'économie française montre des signes positifs",
      },
      {
        title: "Politique sociale : Nouvelles mesures pour l'emploi",
        link: "#",
        pubDate: new Date().toISOString(),
        description: "Le gouvernement annonce de nouvelles aides",
      },
      {
        title: "Syndicalisme : Mobilisation dans la métallurgie",
        link: "#",
        pubDate: new Date().toISOString(),
        description: "Les syndicats appellent à la mobilisation",
      },
      {
        title: "International : Évolutions du marché du travail européen",
        link: "#",
        pubDate: new Date().toISOString(),
        description: "Nouvelles tendances en Europe",
      },
      {
        title: "Société : Formation professionnelle et transitions",
        link: "#",
        pubDate: new Date().toISOString(),
        description: "Focus sur la formation continue",
      },
    ];

    setNewsItems(mockNews);
  }, []);

  // Défilement automatique
  useEffect(() => {
    if (newsItems.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % newsItems.length);
    }, 5000); // Change toutes les 5 secondes

    return () => clearInterval(interval);
  }, [newsItems.length]);

  if (newsItems.length === 0) {
    return (
      <div className="bg-white border-t-4 border-cgt-red h-16 flex items-center px-4">
        <div className="flex items-center gap-3 text-gray-500">
          <Globe className="w-5 h-5" />
          <span className="text-sm font-medium">
            Chargement des actualités France Info...
          </span>
        </div>
      </div>
    );
  }

  const currentNews = newsItems[currentIndex];

  return (
    <div className="bg-cgt-red h-12 flex items-center overflow-hidden relative">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg viewBox="0 0 60 60" className="w-full h-full">
          <defs>
            <pattern
              id="rss-grid"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke="white"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#rss-grid)" />
        </svg>
      </div>

      <div className="bg-cgt-red text-white px-6 py-2 h-full flex items-center relative z-10">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4" />
          <span className="text-sm font-bold whitespace-nowrap tracking-wide">
            FLUX RSS FRANCE INFO
          </span>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden h-full bg-cgt-red">
        <div
          className="absolute inset-0 flex items-center whitespace-nowrap text-white"
          style={{
            animation: "marqueeRSS 40s linear infinite",
          }}
        >
          <div className="flex items-center gap-12 px-6">
            {newsItems.map((item, index) => (
              <div key={index} className="flex items-center gap-3 text-white">
                <div className="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
                <span className="text-sm font-medium tracking-wide">
                  {item.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marqueeRSS {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  );
};
