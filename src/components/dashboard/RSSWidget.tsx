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

  // Récupération du flux RSS France Info
  useEffect(() => {
    const fetchRSSFeed = async () => {
      try {
        // Utilisation d'un proxy CORS pour contourner les restrictions navigateur
        const proxyUrl = "https://api.allorigins.win/raw?url=";
        const targetUrl = "https://www.franceinfo.fr/politique.rss";

        const response = await fetch(proxyUrl + encodeURIComponent(targetUrl));
        const xmlText = await response.text();

        // Parse XML simple pour extraire les titres
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");
        const items = xmlDoc.querySelectorAll("item");

        const rssItems: RSSItem[] = Array.from(items)
          .slice(0, 10)
          .map((item) => {
            const title = item.querySelector("title")?.textContent || "";
            const link = item.querySelector("link")?.textContent || "#";
            const pubDate =
              item.querySelector("pubDate")?.textContent ||
              new Date().toISOString();
            const description =
              item.querySelector("description")?.textContent || "";

            return {
              title: title.replace(/&[^;]+;/g, ""), // Nettoie les entités HTML
              link,
              pubDate,
              description: description
                .replace(/<[^>]*>/g, "")
                .substring(0, 100), // Supprime HTML et limite
            };
          });

        setNewsItems(rssItems);
      } catch (error) {
        console.error("Erreur lors du chargement du flux RSS:", error);
        // Fallback vers des données fictives
        const fallbackNews: RSSItem[] = [
          {
            title: "France Info - Actualités politiques en temps réel",
            link: "#",
            pubDate: new Date().toISOString(),
            description: "Suivez l'actualité politique française",
          },
          {
            title: "Gouvernement - Nouvelles mesures économiques annoncées",
            link: "#",
            pubDate: new Date().toISOString(),
            description: "Le gouvernement présente son plan",
          },
          {
            title: "Parlement - Débat sur les réformes sociales",
            link: "#",
            pubDate: new Date().toISOString(),
            description: "Les députés examinent les propositions",
          },
        ];
        setNewsItems(fallbackNews);
      }
    };

    fetchRSSFeed();
    // Actualiser toutes les 10 minutes
    const interval = setInterval(fetchRSSFeed, 600000);
    return () => clearInterval(interval);
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
