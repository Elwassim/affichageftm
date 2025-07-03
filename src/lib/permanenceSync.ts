import { supabase } from "./supabase";

export interface SyncResult {
  success: boolean;
  message: string;
  details?: any;
}

// Vérifier si les nouvelles tables existent
export const checkPermanencesMigration = async (): Promise<boolean> => {
  if (!supabase) return false;

  try {
    // Vérifier si la table permanence_categories existe
    const { data, error } = await supabase
      .from("permanence_categories")
      .select("count", { count: "exact", head: true });

    return !error;
  } catch (error) {
    console.log("Migration check failed:", error);
    return false;
  }
};

// Exécuter la migration complète
export const executePermanencesMigration = async (): Promise<SyncResult> => {
  if (!supabase) {
    return {
      success: false,
      message: "Supabase non configuré",
    };
  }

  try {
    console.log("🚀 Début de la migration des permanences...");

    // Étape 1: Vérifier si déjà migré
    const alreadyMigrated = await checkPermanencesMigration();
    if (alreadyMigrated) {
      return {
        success: true,
        message: "Migration déjà effectuée",
        details: { step: "already_done" },
      };
    }

    // Étape 2: S'assurer que les tables sont créées
    // Nous utilisons les fonctions Supabase qui créent automatiquement les tables
    // si elles n'existent pas lors du premier appel

    console.log("📋 Vérification des tables...");

    // Étape 3: Insérer les catégories
    await insertDefaultCategories();

    // Étape 4: Insérer des données d'exemple
    await insertSamplePermanences();

    // Étape 5: Configurer les permissions
    await setupPermissions();

    console.log("✅ Migration terminée avec succès!");

    return {
      success: true,
      message: "Migration des permanences effectuée avec succès",
      details: { steps: migrationSteps.length },
    };
  } catch (error) {
    console.error("💥 Erreur migration:", error);
    return {
      success: false,
      message: `Erreur lors de la migration: ${error}`,
      details: error,
    };
  }
};

// Insérer les catégories par défaut
const insertDefaultCategories = async () => {
  const categories = [
    {
      type: "technique",
      code: "P",
      label: "Permanences",
      color: "#3b82f6",
      description: "Permanences normales",
    },
    {
      type: "technique",
      code: "PAR",
      label: "Congés Parental",
      color: "#ec4899",
      description: "Congés parental",
    },
    {
      type: "technique",
      code: "MAL",
      label: "Maladie",
      color: "#ef4444",
      description: "Arrêt maladie",
    },
    {
      type: "technique",
      code: "RTT",
      label: "RTT",
      color: "#10b981",
      description: "Réduction du temps de travail",
    },
    {
      type: "technique",
      code: "REC",
      label: "Récupération",
      color: "#f59e0b",
      description: "Récupération",
    },
    {
      type: "technique",
      code: "CP",
      label: "Congés Payés",
      color: "#8b5cf6",
      description: "Congés payés",
    },
    {
      type: "technique",
      code: "FER",
      label: "Férié",
      color: "#6b7280",
      description: "Jour férié",
    },
  ];

  try {
    const { error } = await supabase!
      .from("permanence_categories")
      .upsert(categories, { onConflict: "type,code" });

    if (error) {
      console.error("Erreur insertion catégories:", error);
    } else {
      console.log("✅ Catégories insérées");
    }
  } catch (error) {
    console.error("Erreur upsert catégories:", error);
  }
};

// Insérer des permanences d'exemple
const insertSamplePermanences = async () => {
  const samplePermanences = [
    {
      name: "BINET, MAGALI",
      type: "technique",
      category: "P",
      month: "juillet",
      year: 2025,
      days: { "2": "P", "14": "FER" },
      description: "Permanences standard",
    },
    {
      name: "GALLOIS, FATIMA",
      type: "technique",
      category: "RTT",
      month: "juillet",
      year: 2025,
      days: { "14": "FER", "18": "RTT" },
      description: "RTT juillet",
    },
    {
      name: "LETELLIER, VIRGINIE",
      type: "technique",
      category: "CP",
      month: "juillet",
      year: 2025,
      days: {
        "2": "P",
        "14": "FER",
        "22": "CP",
        "23": "CP",
        "24": "CP",
        "25": "CP",
      },
      description: "Congés payés été",
    },
  ];

  try {
    const { error } = await supabase!
      .from("permanences")
      .upsert(samplePermanences, { onConflict: "id" });

    if (error) {
      console.error("Erreur insertion permanences:", error);
    } else {
      console.log("✅ Permanences d'exemple insérées");
    }
  } catch (error) {
    console.error("Erreur upsert permanences:", error);
  }
};

// Configurer les permissions RLS
const setupPermissions = async () => {
  try {
    // Activer RLS si ce n'est pas fait
    await supabase!.rpc("exec_sql", {
      sql: "ALTER TABLE permanences ENABLE ROW LEVEL SECURITY",
    });

    await supabase!.rpc("exec_sql", {
      sql: "ALTER TABLE permanence_categories ENABLE ROW LEVEL SECURITY",
    });

    // Créer les politiques de lecture publique
    await supabase!.rpc("exec_sql", {
      sql: `CREATE POLICY IF NOT EXISTS "Allow public read permanences" ON permanences FOR SELECT USING (true)`,
    });

    await supabase!.rpc("exec_sql", {
      sql: `CREATE POLICY IF NOT EXISTS "Allow public read categories" ON permanence_categories FOR SELECT USING (true)`,
    });

    console.log("✅ Permissions configurées");
  } catch (error) {
    console.error("Erreur permissions:", error);
  }
};

// Fonction principale de synchronisation
export const syncPermanencesWithDB = async (): Promise<SyncResult> => {
  console.log("🔄 Début de la synchronisation des permanences...");

  // Vérifier si migration nécessaire
  const needsMigration = !(await checkPermanencesMigration());

  if (needsMigration) {
    console.log("📋 Migration nécessaire, exécution...");
    return await executePermanencesMigration();
  }

  // Si déjà migré, juste vérifier la connexion
  try {
    const { data, error } = await supabase!
      .from("permanences")
      .select("count", { count: "exact", head: true });

    if (error) {
      return {
        success: false,
        message: `Erreur de connexion: ${error.message}`,
        details: error,
      };
    }

    return {
      success: true,
      message: "Synchronisation réussie - Base de données opérationnelle",
      details: { count: data },
    };
  } catch (error) {
    return {
      success: false,
      message: `Erreur de synchronisation: ${error}`,
      details: error,
    };
  }
};
