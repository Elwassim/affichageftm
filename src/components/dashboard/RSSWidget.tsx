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
    <div className="bg-cgt-red h-12 flex items-center w-full fixed bottom-0 left-0 z-50">
      <div className="bg-cgt-red text-white px-4 py-2 h-full flex items-center flex-shrink-0">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4" />
          <span className="text-sm font-bold whitespace-nowrap">
            FLUX RSS FRANCE INFO
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-hidden h-full bg-cgt-red relative">
        <div
          className="absolute flex items-center h-full whitespace-nowrap text-white animate-marquee"
          style={{
            animation: "marquee 40s linear infinite",
          }}
        >
          <div className="flex items-center gap-8 px-4">
            {newsItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-white">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                <span className="text-sm font-medium">{item.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
      `}</style>
    </div>
  );
};
