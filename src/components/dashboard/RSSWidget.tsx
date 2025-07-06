import { useState, useEffect } from "react";
import { Globe } from "lucide-react";

interface RSSItem {
  title: string;
  link: string;
  pubDate: string;
}

export const RSSWidget = () => {
  const [newsItems, setNewsItems] = useState<RSSItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  // Charger le flux RSS réel de France Info
  const loadRealRSSFeed = async (): Promise<RSSItem[]> => {
    try {
      const rssUrl = "https://www.franceinfo.fr/politique.rss";

      // Utiliser un proxy CORS pour contourner les restrictions
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`;

      console.log("📡 Chargement du flux RSS France Info depuis:", rssUrl);

      const response = await fetch(proxyUrl);
      const data = await response.json();

      if (!data.contents) {
        throw new Error("Pas de contenu RSS reçu");
      }

      // Parser le XML
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data.contents, "text/xml");

      // Extraire les items RSS
      const items = xmlDoc.querySelectorAll("item");
      const rssItems: RSSItem[] = [];

      items.forEach((item, index) => {
        if (index < 20) {
          // Limiter à 20 articles
          const title = item.querySelector("title")?.textContent || "";
          const link = item.querySelector("link")?.textContent || "";
          const pubDate = item.querySelector("pubDate")?.textContent || "";

          if (title && link) {
            rssItems.push({
              title: title.trim(),
              link: link.trim(),
              pubDate: pubDate || new Date().toISOString(),
            });
          }
        }
      });

      console.log("✅ Flux RSS réel chargé:", rssItems.length, "articles");
      return rssItems;
    } catch (error) {
      console.error("❌ Erreur chargement RSS:", error);

      // Fallback avec quelques actualités par défaut
      return [
        {
          title: "France Info - Actualités politiques en temps réel",
          link: "https://www.franceinfo.fr/politique",
          pubDate: new Date().toISOString(),
        },
        {
          title: "Suivez l'actualité politique française sur France Info",
          link: "https://www.franceinfo.fr/politique",
          pubDate: new Date().toISOString(),
        },
      ];
    }
  };

  useEffect(() => {
    const loadRSSData = async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      console.log("🔄 Chargement du flux RSS France Info politique...");

      try {
        const news = await loadRealRSSFeed();
        setNewsItems(news);
        setLastUpdate(new Date().toLocaleTimeString("fr-FR"));
        setLoading(false);
        setRefreshing(false);
        console.log("✅ Flux RSS chargé:", news.length, "articles");
      } catch (error) {
        console.error("❌ Erreur chargement RSS:", error);
        setLoading(false);
        setRefreshing(false);
        // Garder les anciens articles en cas d'erreur
      }
    };

    // Charger immédiatement
    loadRSSData();

    // Recharger le flux RSS toutes les 2 minutes pour plus de réactivité
    const interval = setInterval(() => {
      console.log("🔄 Actualisation automatique du flux RSS France Info...");
      loadRSSData();
    }, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="fixed bottom-0 left-0 w-full h-12 bg-cgt-red z-50 flex items-center">
        <div className="flex items-center px-4 gap-2">
          <Globe className="w-4 h-4 text-white animate-spin" />
          <span className="text-white font-bold text-base">
            FLUX RSS FRANCE INFO
          </span>
        </div>
        <div className="flex-1 flex items-center px-4">
          <span className="text-white text-base">
            Chargement du flux RSS France Info...
          </span>
        </div>
      </div>
    );
  }

  if (newsItems.length === 0) {
    return (
      <div className="fixed bottom-0 left-0 w-full h-12 bg-cgt-red z-50 flex items-center">
        <div className="flex items-center px-4 gap-2">
          <Globe className="w-4 h-4 text-white" />
          <span className="text-white font-bold text-base">
            FLUX RSS FRANCE INFO
          </span>
        </div>
        <div className="flex-1 flex items-center px-4">
          <span className="text-white text-base">
            Flux RSS temporairement indisponible
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 w-full h-12 bg-cgt-red z-50 overflow-hidden">
      <div className="flex items-center h-full">
        {/* Label avec statut temps réel */}
        <div className="flex items-center px-4 gap-2 bg-cgt-red flex-shrink-0">
          <Globe className="w-4 h-4 text-white" />
          <span className="text-white font-bold text-base whitespace-nowrap">
            FLUX RSS FRANCE INFO
          </span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white/90 text-xs">
              AUTO • {newsItems.length} infos • MAJ {lastUpdate}
            </span>
          </div>
        </div>

        {/* Zone de défilement des actualités */}
        <div className="flex-1 relative overflow-hidden bg-cgt-red">
          <div className="animate-marquee-rss flex items-center h-12 whitespace-nowrap">
            {newsItems.map((item, index) => (
              <div
                key={`${item.title}-${index}`}
                className="inline-flex items-center mx-8"
              >
                <div className="w-2 h-2 bg-white rounded-full mr-3 flex-shrink-0"></div>
                <span className="text-white text-sm font-medium">
                  {item.title}
                </span>
                <div className="w-px h-4 bg-white/30 mx-6"></div>
              </div>
            ))}
            {/* Répéter pour un défilement continu */}
            {newsItems.map((item, index) => (
              <div
                key={`repeat-${item.title}-${index}`}
                className="inline-flex items-center mx-8"
              >
                <div className="w-2 h-2 bg-white rounded-full mr-3 flex-shrink-0"></div>
                <span className="text-white text-sm font-medium">
                  {item.title}
                </span>
                <div className="w-px h-4 bg-white/30 mx-6"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
