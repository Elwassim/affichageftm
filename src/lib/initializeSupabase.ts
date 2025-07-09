import { supabase } from "./supabase";

// Script pour initialiser les tables Supabase automatiquement
export const initializeSupabaseTables = async (): Promise<boolean> => {
  if (!supabase) {
    console.log("❌ Supabase non configuré");
    return false;
  }

  try {
    console.log("🚀 Initialisation des tables Supabase...");

    // Vérifier si les tables existent en essayant de les lire
    const checks = await Promise.all([
      supabase.from("meetings").select("id").limit(1),
      supabase.from("permanences").select("id").limit(1),
      supabase.from("users").select("id").limit(1),
      supabase.from("tributes").select("id").limit(1),
      supabase.from("dashboard_config").select("key").limit(1),
    ]);

    // Si toutes les tables existent, pas besoin de les créer
    const allTablesExist = checks.every((check) => !check.error);

    if (allTablesExist) {
      console.log("✅ Toutes les tables Supabase existent déjà");
      return true;
    }

    console.log("📋 Certaines tables manquent, tentative de création...");

    // Créer les tables via l'API SQL de Supabase
    const sqlCommands = [
      // Table meetings
      `
      CREATE TABLE IF NOT EXISTS meetings (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title TEXT NOT NULL,
        time TEXT NOT NULL,
        room TEXT NOT NULL,
        category TEXT NOT NULL,
        date DATE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      `,

      // Table permanences
      `
      CREATE TABLE IF NOT EXISTS permanences (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('technique', 'politique')),
        month TEXT NOT NULL,
        year INTEGER NOT NULL,
        days JSONB NOT NULL DEFAULT '{}',
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      `,

      // Table users
      `
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT,
        email TEXT,
        role TEXT NOT NULL DEFAULT 'user',
        is_admin BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      `,

      // Table tributes
      `
      CREATE TABLE IF NOT EXISTS tributes (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        photo TEXT,
        text TEXT NOT NULL,
        dateAdded TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      `,

      // Table dashboard_config
      `
      CREATE TABLE IF NOT EXISTS dashboard_config (
        key TEXT PRIMARY KEY,
        value TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      `,
    ];

    // Exécuter les commandes SQL
    for (const sql of sqlCommands) {
      const { error } = await supabase.rpc("execute_sql", { sql_query: sql });
      if (error) {
        console.warn(
          "⚠️ Erreur création table (peut-être déjà existante):",
          error.message,
        );
      }
    }

    console.log("✅ Initialisation Supabase terminée");
    return true;
  } catch (error) {
    console.error("❌ Erreur initialisation Supabase:", error);
    return false;
  }
};

// Fonction pour insérer des données par défaut
export const insertDefaultData = async (): Promise<void> => {
  if (!supabase) return;

  try {
    // Vérifier si des données existent déjà
    const { data: existingMeetings } = await supabase
      .from("meetings")
      .select("id")
      .limit(1);

    if (existingMeetings && existingMeetings.length > 0) {
      console.log("📊 Données par défaut déjà présentes");
      return;
    }

    console.log("📊 Insertion des données par défaut...");

    // Insérer quelques réunions d'exemple
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    await supabase.from("meetings").insert([
      {
        title: "Assemblée Générale",
        time: "14:00",
        room: "Salle des Congrès",
        category: "Assemblée Générale",
        date: tomorrow.toISOString().split("T")[0],
      },
      {
        title: "Commission Exécutive",
        time: "09:00",
        room: "Bureau Confédéral",
        category: "Commission",
        date: tomorrow.toISOString().split("T")[0],
      },
    ]);

    // Insérer la configuration par défaut
    await supabase.from("dashboard_config").insert([
      { key: "videoUrl", value: "https://www.youtube.com/embed/YQHsXMglC9A" },
      {
        key: "alertText",
        value:
          "🚨 APPEL CGT FTM - Rejoignez-nous pour défendre vos droits ! 🚨",
      },
      {
        key: "diversContent",
        value: JSON.stringify({
          title: "Informations diverses",
          subtitle: "CGT FTM",
          content: "Informations importantes pour tous les adhérents",
          isActive: true,
        }),
      },
    ]);

    console.log("✅ Données par défaut insérées");
  } catch (error) {
    console.error("❌ Erreur insertion données par défaut:", error);
  }
};
