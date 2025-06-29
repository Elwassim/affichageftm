# Guide d'intégration Base de Données - CGT FTM Dashboard

## 📋 Vue d'ensemble

Ce guide explique comment connecter l'application CGT FTM Dashboard à une base de données (Supabase recommandé) pour remplacer le stockage local actuel.

## 🗄️ Structure de base de données requise

### Tables nécessaires

#### 1. `dashboard_config`

```sql
CREATE TABLE dashboard_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2. `meetings`

```sql
CREATE TABLE meetings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  time VARCHAR(100) NOT NULL,
  room VARCHAR(255) NOT NULL,
  date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 3. `permanences`

```sql
CREATE TABLE permanences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  time VARCHAR(100) NOT NULL,
  theme VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 4. `users`

```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  group_name VARCHAR(50) NOT NULL DEFAULT 'viewer',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 5. `social_posts`

```sql
CREATE TABLE social_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  text TEXT NOT NULL,
  hashtag VARCHAR(100),
  photo VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🚀 Installation et Configuration Supabase

### 1. Installer les dépendances

```bash
npm install @supabase/supabase-js
npm install bcryptjs
npm install @types/bcryptjs --save-dev
```

### 2. Configuration d'environnement

Créer/modifier `.env.local` :

```env
VITE_SUPABASE_URL=votre_supabase_url
VITE_SUPABASE_ANON_KEY=votre_supabase_anon_key
```

### 3. Initialisation des données par défaut

```sql
-- Configuration par défaut
INSERT INTO dashboard_config (key, value) VALUES
('videoUrl', '"https://www.youtube.com/watch?v=dQw4w9WgXcQ"'),
('alertText', '"🚨 APPEL CGT FTM - Négociation collective métallurgie - Jeudi 21 mars à 14h - Siège fédéral - Mobilisation pour nos salaires !"');

-- Utilisateurs par défaut (mots de passe: cgtftm2024)
INSERT INTO users (username, password_hash, name, group_name) VALUES
('marie.dubois', '$2b$10$hashedpassword', 'Marie Dubois', 'admin'),
('jc.martin', '$2b$10$hashedpassword', 'Jean-Claude Martin', 'editor'),
('admin.cgt', '$2b$10$hashedpassword', 'Administrateur CGT', 'admin');

-- Données exemple
INSERT INTO meetings (title, time, room) VALUES
('Assemblée Générale', '14h00', 'Salle Rouge'),
('Commission Salaires', '16h30', 'Bureau Syndical'),
('Formation Délégués', '09h00', 'Salle de Formation');

INSERT INTO permanences (name, time, theme) VALUES
('Marie Dubois', 'Lun-Mer 9h-17h', 'Droit du travail'),
('Jean-Claude Martin', 'Mar-Jeu 14h-18h', 'Négociation collective'),
('Sophie Laurent', 'Ven 9h-12h', 'Accident du travail');

INSERT INTO social_posts (name, text, hashtag, photo) VALUES
('Délégué CGT', 'Nouvelle victoire pour nos salaires ! Augmentation de 3.2% obtenue après négociation. La mobilisation paie toujours. Continuons le combat pour la justice sociale.', '#VictoireCGT', '/api/placeholder/100/100');
```

## 📁 Fichiers à créer/modifier

### 1. `src/lib/supabase.ts` (nouveau)

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Variables d'environnement Supabase manquantes");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types TypeScript
export interface Meeting {
  id: string;
  title: string;
  time: string;
  room: string;
  date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Permanence {
  id: string;
  name: string;
  time: string;
  theme: string;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  email?: string;
  group_name: "admin" | "editor" | "viewer";
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SocialPost {
  id: string;
  name: string;
  text: string;
  hashtag?: string;
  photo?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DashboardData {
  videoUrl: string;
  alertText: string;
  meetings: Meeting[];
  permanences: Permanence[];
  socialPost: SocialPost;
  users: User[];
}
```

### 2. `src/lib/database.ts` (nouveau)

```typescript
import {
  supabase,
  type Meeting,
  type Permanence,
  type User,
  type SocialPost,
  type DashboardData,
} from "./supabase";
import bcrypt from "bcryptjs";

// Gestion de la configuration
export const getConfig = async (key: string): Promise<any> => {
  const { data, error } = await supabase
    .from("dashboard_config")
    .select("value")
    .eq("key", key)
    .single();

  if (error) {
    console.error(`Erreur récupération config ${key}:`, error);
    return null;
  }

  return data?.value;
};

export const setConfig = async (key: string, value: any): Promise<boolean> => {
  const { error } = await supabase
    .from("dashboard_config")
    .upsert({ key, value }, { onConflict: "key" });

  if (error) {
    console.error(`Erreur sauvegarde config ${key}:`, error);
    return false;
  }

  return true;
};

// Gestion des réunions
export const getMeetings = async (): Promise<Meeting[]> => {
  const { data, error } = await supabase
    .from("meetings")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Erreur récupération meetings:", error);
    return [];
  }

  return data || [];
};

export const createMeeting = async (
  meeting: Omit<Meeting, "id" | "created_at" | "updated_at">,
): Promise<Meeting | null> => {
  const { data, error } = await supabase
    .from("meetings")
    .insert([meeting])
    .select()
    .single();

  if (error) {
    console.error("Erreur création meeting:", error);
    return null;
  }

  return data;
};

export const updateMeeting = async (
  id: string,
  updates: Partial<Meeting>,
): Promise<boolean> => {
  const { error } = await supabase
    .from("meetings")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("Erreur mise à jour meeting:", error);
    return false;
  }

  return true;
};

export const deleteMeeting = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from("meetings").delete().eq("id", id);

  if (error) {
    console.error("Erreur suppression meeting:", error);
    return false;
  }

  return true;
};

// Gestion des permanences (fonctions similaires)
export const getPermanences = async (): Promise<Permanence[]> => {
  const { data, error } = await supabase
    .from("permanences")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Erreur récupération permanences:", error);
    return [];
  }

  return data || [];
};

// ... autres fonctions CRUD pour permanences

// Gestion des utilisateurs
export const authenticateUser = async (
  username: string,
  password: string,
): Promise<User | null> => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    return null;
  }

  const isValid = await bcrypt.compare(password, data.password_hash);
  if (!isValid) {
    return null;
  }

  const { password_hash, ...userWithoutPassword } = data;
  return userWithoutPassword as User;
};

export const getUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from("users")
    .select(
      "id, username, name, email, group_name, is_active, created_at, updated_at",
    )
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Erreur récupération users:", error);
    return [];
  }

  return data || [];
};

// Gestion des posts sociaux
export const getActiveSocialPost = async (): Promise<SocialPost | null> => {
  const { data, error } = await supabase
    .from("social_posts")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error("Erreur récupération social post:", error);
    return null;
  }

  return data;
};

// Fonction principale pour récupérer toutes les données
export const getDashboardData = async (): Promise<DashboardData> => {
  const [videoUrl, alertText, meetings, permanences, socialPost, users] =
    await Promise.all([
      getConfig("videoUrl"),
      getConfig("alertText"),
      getMeetings(),
      getPermanences(),
      getActiveSocialPost(),
      getUsers(),
    ]);

  return {
    videoUrl: videoUrl || "",
    alertText: alertText || "",
    meetings,
    permanences,
    socialPost: socialPost || {
      id: "",
      name: "CGT FTM",
      text: "Aucun message actuel",
      hashtag: "#CGT",
      photo: "",
      is_active: true,
    },
    users,
  };
};
```

### 3. `src/hooks/useDatabase.ts` (nouveau)

```typescript
import { useState, useEffect } from "react";
import { getDashboardData, type DashboardData } from "@/lib/database";

export const useDatabase = (
  autoRefresh: boolean = true,
  interval: number = 30000,
) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setError(null);
      const result = await getDashboardData();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    if (autoRefresh && interval > 0) {
      const timer = setInterval(fetchData, interval);
      return () => clearInterval(timer);
    }
  }, [autoRefresh, interval]);

  return {
    data,
    loading,
    error,
    refresh: fetchData,
  };
};
```

## 🔄 Migration des fichiers existants

### Fichiers à modifier :

1. **`src/lib/storage.ts`** - Remplacer par les appels à la base de données
2. **`src/lib/auth.ts`** - Adapter pour utiliser la base de données
3. **`src/hooks/useRealTimeUpdates.ts`** - Utiliser le nouveau hook useDatabase
4. **`src/pages/Admin.tsx`** - Utiliser les nouvelles fonctions CRUD
5. **Tous les widgets** - Utiliser le nouveau hook useDatabase

### Exemple de migration pour un widget :

**Avant :**

```typescript
import { getDashboardData } from "@/lib/storage";

export const MeetingsWidget = () => {
  const { meetings } = getDashboardData();
  // ...
};
```

**Après :**

```typescript
import { useDatabase } from "@/hooks/useDatabase";

export const MeetingsWidget = () => {
  const { data, loading, error } = useDatabase();

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;

  const meetings = data?.meetings || [];
  // ...
}
```

## 🛠️ Étapes de déploiement

### 1. Configuration Supabase

1. Créer un projet sur supabase.com
2. Exécuter les scripts SQL de création des tables
3. Configurer les variables d'environnement
4. Insérer les données par défaut

### 2. Installation des dépendances

```bash
npm install @supabase/supabase-js bcryptjs
npm install @types/bcryptjs --save-dev
```

### 3. Migration du code

1. Créer les nouveaux fichiers (supabase.ts, database.ts, useDatabase.ts)
2. Modifier les fichiers existants pour utiliser la base de données
3. Tester toutes les fonctionnalités
4. Supprimer l'ancien système de stockage local

### 4. Variables d'environnement production

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_clé_publique
```

## 🔒 Sécurité et bonnes pratiques

### Row Level Security (RLS) sur Supabase

```sql
-- Activer RLS
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE permanences ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_config ENABLE ROW LEVEL SECURITY;

-- Politiques de lecture publique pour l'affichage TV
CREATE POLICY "Allow public read" ON meetings FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON permanences FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON social_posts FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read" ON dashboard_config FOR SELECT USING (true);
```

### Hash des mots de passe

Utiliser bcryptjs pour hasher les mots de passe avant insertion en base.

## 📈 Optimisations futures

1. **Cache Redis** pour les données fréquemment consultées
2. **WebSockets** pour les mises à jour temps réel
3. **CDN** pour les images et médias
4. **Monitoring** avec des logs détaillés
5. **Backup automatique** des données critiques

## 🆘 Dépannage

### Erreurs courantes :

1. **Variables d'environnement manquantes** - Vérifier .env.local
2. **Erreurs de connexion** - Vérifier l'URL et les clés Supabase
3. **Erreurs de permissions** - Vérifier les politiques RLS
4. **Données manquantes** - Vérifier l'initialisation des données par défaut

Ce guide vous permet d'avoir une application CGT FTM complètement connectée à une base de données robuste et scalable.
