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

  // Charger le flux RSS réel de France Info avec plusieurs API de fallback
  const loadRealRSSFeed = async (): Promise<RSSItem[]> => {
    const rssUrl = "https://www.franceinfo.fr/politique.rss";

    // API primaire : rss2json
    try {
      const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
      console.log("📡 Tentative 1 : api.rss2json.com...");

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-cache",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.items || data.status !== "ok") {
        throw new Error("Erreur API rss2json ou pas d'articles");
      }

      const rssItems: RSSItem[] = data.items.slice(0, 15).map((item: any) => ({
        title: item.title.trim(),
        link: item.link.trim(),
        pubDate: item.pubDate || new Date().toISOString(),
      }));

      console.log(
        "✅ Flux RSS chargé via rss2json:",
        rssItems.length,
        "articles",
      );
      return rssItems;
    } catch (error1) {
      console.warn("⚠️ Erreur API 1 (rss2json):", error1);
    }

    // API fallback : AllOrigins
    try {
      const fallbackUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`;
      console.log("📡 Tentative 2 : api.allorigins.win...");

      const response = await fetch(fallbackUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-cache",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.contents) {
        throw new Error("Pas de contenu dans la réponse AllOrigins");
      }

      // Parser le XML RSS manuellement
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data.contents, "text/xml");
      const items = xmlDoc.querySelectorAll("item");

      const rssItems: RSSItem[] = Array.from(items)
        .slice(0, 15)
        .map((item) => ({
          title:
            item.querySelector("title")?.textContent?.trim() ||
            "Titre non disponible",
          link:
            item.querySelector("link")?.textContent?.trim() ||
            "https://www.franceinfo.fr/politique",
          pubDate:
            item.querySelector("pubDate")?.textContent?.trim() ||
            new Date().toISOString(),
        }));

      console.log(
        "✅ Flux RSS chargé via AllOrigins:",
        rssItems.length,
        "articles",
      );
      return rssItems;
    } catch (error2) {
      console.warn("⚠️ Erreur API 2 (AllOrigins):", error2);
    }

    // Fallback final avec du contenu statique mais réaliste
    console.log("🔄 Utilisation du contenu de fallback");
    return [
      {
        title: "Actualités politiques françaises - Flux RSS France Info",
        link: "https://www.franceinfo.fr/politique",
        pubDate: new Date().toISOString(),
      },
      {
        title: "Suivez l'actualité politique en temps réel sur France Info",
        link: "https://www.franceinfo.fr/politique",
        pubDate: new Date().toISOString(),
      },
      {
        title: "Informations et analyses politiques - France Info",
        link: "https://www.franceinfo.fr/politique",
        pubDate: new Date().toISOString(),
      },
      {
        title: "Déclarations gouvernementales et réactions politiques",
        link: "https://www.franceinfo.fr/politique",
        pubDate: new Date().toISOString(),
      },
      {
        title: "Débats parlementaires et actualité institutionnelle",
        link: "https://www.franceinfo.fr/politique",
        pubDate: new Date().toISOString(),
      },
    ];
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
      loadRSSData(true); // Mode refresh
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
            {refreshing ? (
              <Globe className="w-3 h-3 text-white animate-spin" />
            ) : (
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            )}
            <span className="text-white/90 text-xs">
              {refreshing
                ? "ACTUALISATION..."
                : `AUTO • ${newsItems.length} infos • MAJ ${lastUpdate}`}
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
