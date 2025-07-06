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

  // Données RSS France Info (simulées pour éviter les problèmes CORS)
  useEffect(() => {
    const franceInfoNews: RSSItem[] = [
      {
        title:
          "Politique - Emmanuel Macron annonce de nouvelles réformes sociales",
        link: "https://www.franceinfo.fr/politique",
        pubDate: new Date().toISOString(),
        description: "Le président présente son plan pour l'emploi",
      },
      {
        title: "Assemblée nationale - Débat sur le budget 2025",
        link: "https://www.franceinfo.fr/politique",
        pubDate: new Date().toISOString(),
        description: "Les députés examinent les propositions budgétaires",
      },
      {
        title: "Syndicats - Manifestation nationale prévue jeudi",
        link: "https://www.franceinfo.fr/politique",
        pubDate: new Date().toISOString(),
        description: "Les organisations syndicales appellent à la mobilisation",
      },
      {
        title: "Gouvernement - Mesures pour l'industrie française",
        link: "https://www.franceinfo.fr/politique",
        pubDate: new Date().toISOString(),
        description: "Soutien renforcé aux secteurs stratégiques",
      },
      {
        title: "Europe - Sommet des dirigeants européens à Bruxelles",
        link: "https://www.franceinfo.fr/politique",
        pubDate: new Date().toISOString(),
        description: "Questions économiques et sociales à l'ordre du jour",
      },
    ];

    setNewsItems(franceInfoNews);
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
          className="absolute flex items-center h-full whitespace-nowrap text-white"
          style={{
            animation: "marqueeScroll 40s linear infinite",
            animationDirection: "normal",
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
    </div>
  );
};
