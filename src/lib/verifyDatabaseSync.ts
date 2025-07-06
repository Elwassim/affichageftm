// Simple database sync verification utility

export interface SyncResult {
  component: string;
  status: string;
  details: string;
  count?: number;
}

export async function verifyCompleteDatabaseSync(): Promise<SyncResult[]> {
  const results: SyncResult[] = [];

  try {
    // Import database functions
    const { getAllMeetings, getPermanences, getTributes, getUsers } =
      await import("./database");

    // Test meetings
    try {
      const meetings = await getAllMeetings();
      results.push({
        component: "Meetings",
        status: meetings.length > 0 ? "✅ OK" : "⚠️ ATTENTION",
        details: `${meetings.length} réunions trouvées`,
        count: meetings.length,
      });
    } catch (error) {
      results.push({
        component: "Meetings",
        status: "❌ ERREUR",
        details: "Impossible de charger les réunions",
        count: 0,
      });
    }

    // Test permanences
    try {
      const permanences = await getPermanences();
      results.push({
        component: "Permanences",
        status: permanences.length > 0 ? "✅ OK" : "⚠️ ATTENTION",
        details: `${permanences.length} permanences trouvées`,
        count: permanences.length,
      });
    } catch (error) {
      results.push({
        component: "Permanences",
        status: "❌ ERREUR",
        details: "Impossible de charger les permanences",
        count: 0,
      });
    }

    // Test tributes
    try {
      const tributes = await getTributes();
      results.push({
        component: "Tributes",
        status: tributes.length > 0 ? "✅ OK" : "⚠️ ATTENTION",
        details: `${tributes.length} hommages trouvés`,
        count: tributes.length,
      });
    } catch (error) {
      results.push({
        component: "Tributes",
        status: "❌ ERREUR",
        details: "Impossible de charger les hommages",
        count: 0,
      });
    }

    // Test users
    try {
      const users = await getUsers();
      results.push({
        component: "Users",
        status: users.length > 0 ? "✅ OK" : "⚠️ ATTENTION",
        details: `${users.length} utilisateurs trouvés`,
        count: users.length,
      });
    } catch (error) {
      results.push({
        component: "Users",
        status: "❌ ERREUR",
        details: "Impossible de charger les utilisateurs",
        count: 0,
      });
    }

    // Add summary
    const errorCount = results.filter((r) => r.status === "❌ ERREUR").length;
    const successCount = results.filter((r) => r.status === "✅ OK").length;

    results.push({
      component: "RÉSUMÉ",
      status: errorCount === 0 ? "✅ OK" : "⚠️ ATTENTION",
      details: `${successCount}/${results.length - 1} composants OK`,
      count: successCount,
    });
  } catch (error) {
    results.push({
      component: "SYSTÈME",
      status: "❌ ERREUR",
      details: "Erreur système de vérification",
      count: 0,
    });
  }

  return results;
}
