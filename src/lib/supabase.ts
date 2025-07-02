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
  time: string;
  theme: string;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: string;
  username: string;
  password_hash: string;
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
