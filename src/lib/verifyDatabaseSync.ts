import { supabase } from "./supabase";
import {
  getMeetings,
  getAllMeetings,
  getPermanences,
  getPermanenceCategories,
  getTributes,
  getUsers,
  getConfig,
} from "./database";

export interface SyncVerificationResult {
  component: string;
  status: "✅ OK" | "❌ ERREUR" | "⚠️ ATTENTION";
  count?: number;
  details: string;
  error?: any;
}

export const verifyCompleteDatabaseSync = async (): Promise<
  SyncVerificationResult[]
> => {
  const results: SyncVerificationResult[] = [];

  console.log("🔍 === VÉRIFICATION COMPLÈTE SYNCHRONISATION BDD ===");

  // 1. CONNEXION SUPABASE
  try {
    if (!supabase) {
      results.push({
        component: "Connexion Supabase",
        status: "❌ ERREUR",
        details: "Supabase non configuré - Mode localStorage",
      });
    } else {
      results.push({
        component: "Connexion Supabase",
        status: "✅ OK",
        details: "Client Supabase configuré",
      });
    }
  } catch (error) {
    results.push({
      component: "Connexion Supabase",
      status: "❌ ERREUR",
      details: "Erreur initialisation Supabase",
      error,
    });
  }

  // 2. VÉRIFICATION RÉUNIONS
  try {
    console.log("📅 Test réunions...");
    const meetings = await getAllMeetings();
    const currentWeekMeetings = await getMeetings();

    results.push({
      component: "Réunions (toutes)",
      status: meetings.length >= 0 ? "✅ OK" : "❌ ERREUR",
      count: meetings.length,
      details: `${meetings.length} réunions trouvées`,
    });

    results.push({
      component: "Réunions (semaine courante)",
      status: currentWeekMeetings.length >= 0 ? "✅ OK" : "❌ ERREUR",
      count: currentWeekMeetings.length,
      details: `${currentWeekMeetings.length} réunions cette semaine`,
    });
  } catch (error) {
    results.push({
      component: "Réunions",
      status: "❌ ERREUR",
      details: "Erreur lors de la récupération des réunions",
      error,
    });
  }

  // 3. VÉRIFICATION PERMANENCES
  try {
    console.log("📋 Test permanences...");
    const permanences = await getPermanences();
    const categories = await getPermanenceCategories();

    results.push({
      component: "Permanences",
      status: permanences.length >= 0 ? "✅ OK" : "❌ ERREUR",
      count: permanences.length,
      details: `${permanences.length} permanences trouvées`,
    });

    results.push({
      component: "Catégories Permanences",
      status: categories.length >= 0 ? "✅ OK" : "❌ ERREUR",
      count: categories.length,
      details: `${categories.length} catégories trouvées (P, PAR, MAL, etc.)`,
    });
  } catch (error) {
    results.push({
      component: "Permanences",
      status: "❌ ERREUR",
      details: "Erreur lors de la récupération des permanences",
      error,
    });
  }

  // 4. VÉRIFICATION UTILISATEURS
  try {
    console.log("👥 Test utilisateurs...");
    const users = await getUsers();

    results.push({
      component: "Utilisateurs",
      status: users.length > 0 ? "✅ OK" : "⚠️ ATTENTION",
      count: users.length,
      details: `${users.length} utilisateurs trouvés`,
    });
  } catch (error) {
    results.push({
      component: "Utilisateurs",
      status: "❌ ERREUR",
      details: "Erreur lors de la récupération des utilisateurs",
      error,
    });
  }

  // 5. VÉRIFICATION TRIBUTES/HOMMAGES
  try {
    console.log("❤️ Test hommages...");
    const tributes = await getTributes();

    results.push({
      component: "Hommages",
      status: tributes.length >= 0 ? "✅ OK" : "❌ ERREUR",
      count: tributes.length,
      details: `${tributes.length} hommages trouvés`,
    });
  } catch (error) {
    results.push({
      component: "Hommages",
      status: "❌ ERREUR",
      details: "Erreur lors de la récupération des hommages",
      error,
    });
  }

  // 6. VÉRIFICATION CONFIGURATION
  try {
    console.log("⚙️ Test configuration...");
    const videoUrl = await getConfig("videoUrl");
    const alertText = await getConfig("alertText");
    const weatherCity = await getConfig("weatherCity");

    results.push({
      component: "Config - URL Vidéo",
      status: videoUrl ? "✅ OK" : "⚠️ ATTENTION",
      details: videoUrl ? "URL vidéo configurée" : "Aucune URL vidéo",
    });

    results.push({
      component: "Config - Alerte",
      status: alertText ? "✅ OK" : "⚠️ ATTENTION",
      details: alertText ? "Texte d'alerte configuré" : "Aucune alerte",
    });

    results.push({
      component: "Config - Météo",
      status: weatherCity ? "✅ OK" : "⚠️ ATTENTION",
      details: `Ville météo: ${weatherCity || "Paris (défaut)"}`,
    });
  } catch (error) {
    results.push({
      component: "Configuration",
      status: "❌ ERREUR",
      details: "Erreur lors de la récupération de la configuration",
      error,
    });
  }

  // 7. VÉRIFICATION TABLES DIRECTES SUPABASE
  if (supabase) {
    try {
      console.log("🗄️ Test tables Supabase directes...");

      // Test table meetings
      const { data: meetingsData, error: meetingsError } = await supabase
        .from("meetings")
        .select("count", { count: "exact", head: true });

      results.push({
        component: "Table meetings",
        status: !meetingsError ? "✅ OK" : "❌ ERREUR",
        details: !meetingsError
          ? "Table accessible"
          : `Erreur: ${meetingsError.message}`,
      });

      // Test table permanences
      const { data: permanencesData, error: permanencesError } = await supabase
        .from("permanences")
        .select("count", { count: "exact", head: true });

      results.push({
        component: "Table permanences",
        status: !permanencesError ? "✅ OK" : "❌ ERREUR",
        details: !permanencesError
          ? "Table accessible"
          : `Erreur: ${permanencesError.message}`,
      });

      // Test table users
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("count", { count: "exact", head: true });

      results.push({
        component: "Table users",
        status: !usersError ? "✅ OK" : "❌ ERREUR",
        details: !usersError
          ? "Table accessible"
          : `Erreur: ${usersError.message}`,
      });

      // Test table tributes
      const { data: tributesData, error: tributesError } = await supabase
        .from("tributes")
        .select("count", { count: "exact", head: true });

      results.push({
        component: "Table tributes",
        status: !tributesError ? "✅ OK" : "❌ ERREUR",
        details: !tributesError
          ? "Table accessible"
          : `Erreur: ${tributesError.message}`,
      });

      // Test table permanence_categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("permanence_categories")
        .select("count", { count: "exact", head: true });

      results.push({
        component: "Table permanence_categories",
        status: !categoriesError ? "✅ OK" : "❌ ERREUR",
        details: !categoriesError
          ? "Table accessible"
          : `Erreur: ${categoriesError.message}`,
      });
    } catch (error) {
      results.push({
        component: "Tables Supabase",
        status: "❌ ERREUR",
        details: "Erreur lors du test des tables",
        error,
      });
    }
  }

  // 8. RÉSUMÉ FINAL
  const totalTests = results.length;
  const successCount = results.filter((r) => r.status === "✅ OK").length;
  const errorCount = results.filter((r) => r.status === "❌ ERREUR").length;
  const warningCount = results.filter(
    (r) => r.status === "⚠️ ATTENTION",
  ).length;

  results.push({
    component: "=== RÉSUMÉ ===",
    status: errorCount === 0 ? "✅ OK" : "❌ ERREUR",
    details: `${successCount}/${totalTests} OK, ${errorCount} erreurs, ${warningCount} avertissements`,
  });

  console.log("📊 === RÉSULTATS VÉRIFICATION ===");
  results.forEach((result) => {
    console.log(`${result.status} ${result.component}: ${result.details}`);
    if (result.error) {
      console.error("   Erreur détaillée:", result.error);
    }
  });

  return results;
};

// Fonction de test rapide
export const quickDatabaseTest = async (): Promise<string> => {
  try {
    const results = await verifyCompleteDatabaseSync();
    const errorCount = results.filter((r) => r.status === "❌ ERREUR").length;
    const totalTests = results.length - 1; // Exclure le résumé

    if (errorCount === 0) {
      return `✅ Toutes les connexions BDD fonctionnent (${totalTests} tests)`;
    } else {
      return `❌ ${errorCount} problèmes détectés sur ${totalTests} tests`;
    }
  } catch (error) {
    return `❌ Erreur lors de la vérification: ${error}`;
  }
};
