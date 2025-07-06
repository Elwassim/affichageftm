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
  const [lastUpdate, setLastUpdate] = useState<string>("");

  useEffect(() => {
    const fetchRealRSS = async () => {
      try {
        setLoading(true);
        console.log("🔄 Chargement RSS France Info...");

        // Utiliser un proxy CORS qui fonctionne vraiment
        const proxyUrl = "https://api.allorigins.win/raw?url=";
        const rssUrl = "https://www.franceinfo.fr/politique.rss";

        const response = await fetch(proxyUrl + encodeURIComponent(rssUrl), {
          method: "GET",
          headers: {
            Accept: "application/rss+xml, application/xml, text/xml",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const xmlText = await response.text();
        console.log("📡 RSS XML reçu, taille:", xmlText.length, "caractères");

        // Parser XML avec DOMParser
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "application/xml");

        // Vérifier les erreurs de parsing
        const parseError = xmlDoc.querySelector("parsererror");
        if (parseError) {
          throw new Error("Erreur de parsing XML: " + parseError.textContent);
        }

        // Extraire les items du flux RSS
        const items = xmlDoc.querySelectorAll("item");
        console.log("📰 Items RSS trouvés:", items.length);

        if (items.length === 0) {
          throw new Error("Aucun article trouvé dans le flux RSS");
        }

        const rssItems: RSSItem[] = [];

        // Parser chaque item
        items.forEach((item, index) => {
          const titleElement = item.querySelector("title");
          const linkElement = item.querySelector("link");
          const pubDateElement = item.querySelector("pubDate");

          const title = titleElement?.textContent?.trim() || "";
          const link = linkElement?.textContent?.trim() || "";
          const pubDate = pubDateElement?.textContent?.trim() || "";

          if (title && link) {
            rssItems.push({
              title: title
                .replace(/&[^;]+;/g, "")
                .replace(/\s+/g, " ")
                .trim(),
              link,
              pubDate,
            });
          }
        });

        console.log("✅ Articles RSS traités:", rssItems.length);
        console.log(
          "📋 Premiers titres:",
          rssItems.slice(0, 3).map((item) => item.title),
        );

        setNewsItems(rssItems);
        setLastUpdate(new Date().toLocaleTimeString("fr-FR"));
      } catch (error) {
        console.error("❌ Erreur chargement RSS:", error);

        // Essayer un autre proxy en cas d'échec
        try {
          console.log("🔄 Tentative avec proxy alternatif...");

          const altProxyUrl = "https://corsproxy.io/?";
          const rssUrl = "https://www.franceinfo.fr/politique.rss";

          const response = await fetch(
            altProxyUrl + encodeURIComponent(rssUrl),
          );

          if (response.ok) {
            const xmlText = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, "application/xml");
            const items = xmlDoc.querySelectorAll("item");

            if (items.length > 0) {
              const rssItems: RSSItem[] = [];

              items.forEach((item) => {
                const title =
                  item.querySelector("title")?.textContent?.trim() || "";
                const link =
                  item.querySelector("link")?.textContent?.trim() || "";
                const pubDate =
                  item.querySelector("pubDate")?.textContent?.trim() || "";

                if (title && link) {
                  rssItems.push({
                    title: title
                      .replace(/&[^;]+;/g, "")
                      .replace(/\s+/g, " ")
                      .trim(),
                    link,
                    pubDate,
                  });
                }
              });

              if (rssItems.length > 0) {
                console.log(
                  "✅ RSS chargé avec proxy alternatif:",
                  rssItems.length,
                  "articles",
                );
                setNewsItems(rssItems);
                setLastUpdate(new Date().toLocaleTimeString("fr-FR"));
                setLoading(false);
                return;
              }
            }
          }
        } catch (altError) {
          console.error("❌ Proxy alternatif échoué:", altError);
        }

        // Fallback uniquement si tous les proxies échouent
        console.log("⚠️ Utilisation du fallback, connexion RSS impossible");
        const fallbackItems: RSSItem[] = [
          {
            title:
              "France Info - Flux RSS https://www.franceinfo.fr/politique.rss temporairement indisponible",
            link: "https://www.franceinfo.fr/politique",
            pubDate: new Date().toISOString(),
          },
          {
            title:
              "Politique française - Actualités gouvernementales et parlementaires",
            link: "https://www.franceinfo.fr/politique",
            pubDate: new Date().toISOString(),
          },
          {
            title:
              "Assemblée nationale - Débats et votes sur les projets de loi",
            link: "https://www.franceinfo.fr/politique",
            pubDate: new Date().toISOString(),
          },
          {
            title: "Élysée - Déplacements et annonces présidentielles",
            link: "https://www.franceinfo.fr/politique",
            pubDate: new Date().toISOString(),
          },
          {
            title: "Gouvernement - Conseils des ministres et réformes",
            link: "https://www.franceinfo.fr/politique",
            pubDate: new Date().toISOString(),
          },
        ];

        setNewsItems(fallbackItems);
        setLastUpdate("Fallback - " + new Date().toLocaleTimeString("fr-FR"));
      } finally {
        setLoading(false);
      }
    };

    // Charger immédiatement
    fetchRealRSS();

    // Recharger toutes les 30 secondes pour du temps réel
    const interval = setInterval(fetchRealRSS, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="fixed bottom-0 left-0 w-full h-12 bg-cgt-red z-50 flex items-center">
        <div className="flex items-center px-4 gap-2">
          <Globe className="w-4 h-4 text-white animate-spin" />
          <span className="text-white font-bold text-sm">
            FLUX RSS FRANCE INFO
          </span>
        </div>
        <div className="flex-1 flex items-center px-4">
          <span className="text-white text-sm">
            Chargement temps réel depuis
            https://www.franceinfo.fr/politique.rss...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 w-full h-12 bg-cgt-red z-50 overflow-hidden">
      <div className="flex items-center h-full">
        {/* Label avec statut */}
        <div className="flex items-center px-4 gap-2 bg-cgt-red flex-shrink-0">
          <Globe className="w-4 h-4 text-white" />
          <span className="text-white font-bold text-sm whitespace-nowrap">
            FLUX RSS FRANCE INFO
          </span>
          <span className="text-white/80 text-xs">
            • {newsItems.length} articles • MAJ {lastUpdate}
          </span>
        </div>

        {/* Zone de défilement des actualités */}
        <div className="flex-1 relative overflow-hidden bg-cgt-red">
          <div className="animate-marquee-rss flex items-center h-12 whitespace-nowrap">
            {newsItems.map((item, index) => (
              <div key={index} className="inline-flex items-center mx-6">
                <div className="w-2 h-2 bg-white rounded-full mr-3 flex-shrink-0"></div>
                <span className="text-white text-sm font-medium">
                  {item.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
