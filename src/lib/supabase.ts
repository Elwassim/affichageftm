import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Variables d'environnement Supabase manquantes - utilisation du localStorage",
  );
}

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Types TypeScript pour Supabase
export interface Meeting {
  id: string;
  title: string;
  time: string;
  room: string;
  category: string;
  date: string; // Format YYYY-MM-DD
  created_at?: string;
  updated_at?: string;
}

export interface Permanence {
  id: string;
  name: string;
  type: "technique" | "politique"; // Type principal
  category: string; // Sous-catégorie (P, PAR, MAL, RTT, etc.)
  month: string; // Mois (juin, juillet, août, etc.)
  year: number; // Année
  days: Record<string, string>; // Jours du mois avec statuts (1-31)
  description?: string; // Description optionnelle
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: string;
  username: string;
  password_hash?: string;
  email?: string;
  role: string;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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

export interface Tribute {
  id: string;
  name: string;
  photo: string;
  text: string;
  date_added: string;
  created_at?: string;
  updated_at?: string;
}

export interface DashboardConfig {
  id?: string;
  key: string;
  value: any;
  updated_at?: string;
  created_at?: string;
}

export interface DashboardData {
  videoUrl: string;
  alertText: string;
  weatherCity: string;
  meetings: Meeting[];
  permanences: Permanence[];
  socialPost: SocialPost;
  tributes: Tribute[];
  users: User[];
}
