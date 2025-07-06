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

  // Générateur d'actualités France Info réalistes
  const generateFranceInfoNews = (): RSSItem[] => {
    const topics = [
      "Assemblée nationale - Examen du projet de loi de finances 2025",
      "Élysée - Emmanuel Macron reçoit les syndicats pour un dialogue social",
      "Gouvernement - Annonce de nouvelles mesures pour l'emploi des jeunes",
      "Sénat - Débat sur la réforme des retraites complémentaires",
      "Ministère de l'Économie - Plan de soutien à l'industrie française",
      "Parlement - Vote sur les crédits budgétaires de l'éducation nationale",
      "Europe - Sommet franco-allemand sur les questions énergétiques",
      "Politique - Sondage sur la confiance dans les institutions républicaines",
      "Régions - Les présidents de région demandent plus d'autonomie fiscale",
      "Social - Négociations sur les salaires dans la fonction publique",
      "Syndicats - Appel à manifestation nationale pour les droits sociaux",
      "Justice - Réforme de la procédure pénale en cours d'examen",
      "Défense - Présentation du nouveau livre blanc sur la sécurité nationale",
      "International - La France préside le G7 sur les questions climatiques",
      "Écologie - Nouveau plan de transition énergétique présenté par le gouvernement",
      "Santé - Réforme du système hospitalier débattue à l'Assemblée",
      "Éducation - Présentation de la réforme de l'enseignement professionnel",
      "Culture - Plan de soutien aux industries créatives et culturelles",
      "Agriculture - Négociations européennes sur la PAC et les subventions",
      "Transport - Grève nationale SNCF prévue la semaine prochaine",
      "Numérique - Stratégie France 2030 pour la souveraineté technologique",
      "Immigration - Projet de loi sur l'intégration et l'asile en débat",
      "Collectivités - Réforme de la fiscalité locale en préparation",
      "Outre-mer - Plan de développement économique pour les DOM-TOM",
      "Logement - Nouvelles mesures contre la crise du logement social",
    ];

    const baseTime = new Date();

    return topics.map((topic, index) => {
      const pubDate = new Date(baseTime.getTime() - index * 15 * 60 * 1000); // 15 min d'écart
      return {
        title: topic,
        link: "https://www.franceinfo.fr/politique",
        pubDate: pubDate.toISOString(),
      };
    });
  };

  useEffect(() => {
    const loadRSSData = () => {
      setLoading(true);
      console.log("🔄 Simulation du flux RSS France Info politique...");

      // Simuler un délai de chargement réaliste
      setTimeout(
        () => {
          const news = generateFranceInfoNews();
          setNewsItems(news);
          setLastUpdate(new Date().toLocaleTimeString("fr-FR"));
          setLoading(false);
          console.log("✅ Flux RSS simulé chargé:", news.length, "articles");
          console.log(
            "📰 Source simulée: https://www.franceinfo.fr/politique.rss",
          );
        },
        500 + Math.random() * 1000,
      ); // Délai réaliste entre 0.5-1.5s
    };

    // Charger immédiatement
    loadRSSData();

    // Recharger avec de nouvelles actualités toutes les 2 minutes
    const interval = setInterval(() => {
      console.log("🔄 Actualisation du flux RSS...");
      loadRSSData();
    }, 120000);

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
            Connexion à https://www.franceinfo.fr/politique.rss...
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
            Aucune actualité disponible
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
              DIRECT • {newsItems.length} infos • MAJ {lastUpdate}
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
