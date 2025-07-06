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

  // Récupération du flux RSS France Info avec plusieurs proxies
  useEffect(() => {
    const fetchRSSFeed = async () => {
      const proxies = [
        "https://corsproxy.io/?",
        "https://api.allorigins.win/raw?url=",
        "https://api.codetabs.com/v1/proxy?quest=",
      ];

      for (let i = 0; i < proxies.length; i++) {
        try {
          const proxyUrl = proxies[i];
          const targetUrl = "https://www.franceinfo.fr/politique.rss";

          console.log(`🔄 Tentative ${i + 1}/3 avec proxy:`, proxyUrl);
          const response = await fetch(
            proxyUrl + encodeURIComponent(targetUrl),
          );

          if (!response.ok) {
            throw new Error(`Erreur réseau: ${response.status}`);
          }

          const xmlText = await response.text();

          // Parse XML pour extraire les éléments RSS
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(xmlText, "text/xml");
          const items = xmlDoc.querySelectorAll("item");

          if (items.length === 0) {
            throw new Error("Aucun élément RSS trouvé");
          }

          const rssItems: RSSItem[] = Array.from(items)
            .slice(0, 20)
            .map((item) => {
              const title = item.querySelector("title")?.textContent || "";
              const link = item.querySelector("link")?.textContent || "#";
              const pubDate =
                item.querySelector("pubDate")?.textContent ||
                new Date().toISOString();
              const description =
                item.querySelector("description")?.textContent || "";

              return {
                title: title
                  .replace(/&[^;]+;/g, "")
                  .replace(/\s+/g, " ")
                  .trim(),
                link,
                pubDate,
                description: description
                  .replace(/<[^>]*>/g, "")
                  .replace(/\s+/g, " ")
                  .substring(0, 150)
                  .trim(),
              };
            })
            .filter((item) => item.title.length > 0);

          console.log(
            "✅ Flux RSS France Info chargé:",
            rssItems.length,
            "articles",
          );
          console.log(
            "📰 Premiers titres:",
            rssItems.slice(0, 3).map((item) => item.title),
          );
          setNewsItems(rssItems);
          return; // Succès
        } catch (error) {
          console.error(`❌ Échec proxy ${i + 1}:`, error);
          if (i === proxies.length - 1) {
            // Tous les proxies ont échoué, utiliser fallback
            console.error(
              "❌ Tous les proxies ont échoué, utilisation du fallback",
            );

            const fallbackNews: RSSItem[] = [
              {
                title:
                  "France Info Politique - Actualités en cours de chargement depuis https://www.franceinfo.fr/politique.rss",
                link: "https://www.franceinfo.fr/politique",
                pubDate: new Date().toISOString(),
                description: "Connexion au flux RSS en cours",
              },
              {
                title:
                  "Politique française - Suivez l'actualité gouvernementale en temps réel",
                link: "https://www.franceinfo.fr/politique",
                pubDate: new Date().toISOString(),
                description: "Toute l'actualité politique sur France Info",
              },
              {
                title:
                  "Parlement - Sessions et débats parlementaires à l'Assemblée nationale",
                link: "https://www.franceinfo.fr/politique",
                pubDate: new Date().toISOString(),
                description: "Suivez les travaux de l'Assemblée nationale",
              },
              {
                title:
                  "Gouvernement - Annonces et déclarations ministérielles importantes",
                link: "https://www.franceinfo.fr/politique",
                pubDate: new Date().toISOString(),
                description: "Les dernières décisions gouvernementales",
              },
              {
                title:
                  "Élections - Actualités électorales et sondages politiques",
                link: "https://www.franceinfo.fr/politique",
                pubDate: new Date().toISOString(),
                description: "Toute l'actualité des élections en France",
              },
            ];
            setNewsItems(fallbackNews);
          }
        }
      }
    };

    // Charger immédiatement
    fetchRSSFeed();

    // Actualiser toutes les 3 minutes
    const interval = setInterval(fetchRSSFeed, 180000);

    return () => clearInterval(interval);
  }, []);

  // Défilement automatique des nouvelles
  useEffect(() => {
    if (newsItems.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % newsItems.length);
    }, 8000); // Change toutes les 8 secondes

    return () => clearInterval(interval);
  }, [newsItems.length]);

  if (newsItems.length === 0) {
    return (
      <div className="bg-cgt-red h-12 flex items-center w-full fixed bottom-0 left-0 z-50">
        <div className="bg-cgt-red text-white px-4 py-2 h-full flex items-center flex-shrink-0">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 animate-spin" />
            <span className="text-sm font-bold whitespace-nowrap">
              FLUX RSS FRANCE INFO
            </span>
          </div>
        </div>
        <div className="flex-1 flex items-center px-4">
          <span className="text-white text-sm">
            Chargement des actualités France Info...
          </span>
        </div>
      </div>
    );
  }

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
            animation: "marqueeScroll 120s linear infinite",
            animationDirection: "normal",
          }}
        >
          <div className="flex items-center gap-12 px-6">
            {newsItems.map((item, index) => (
              <div key={index} className="flex items-center gap-3 text-white">
                <div className="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
                <span className="text-sm font-medium">{item.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
