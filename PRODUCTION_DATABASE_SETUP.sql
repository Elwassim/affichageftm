-- ====================================================================
-- CGT FTM DASHBOARD - CONFIGURATION BASE DE DONNÉES PRODUCTION
-- ====================================================================
-- Ce fichier contient toute la configuration nécessaire pour le dashboard
-- Exécuter dans l'ordre pour une installation complète

-- ====================================================================
-- 1. CRÉATION DES TABLES
-- ====================================================================

-- Table des réunions
CREATE TABLE IF NOT EXISTS meetings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  time VARCHAR(10) NOT NULL,
  room VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des permanences
CREATE TABLE IF NOT EXISTS permanences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('technique', 'politique')),
  month VARCHAR(20) NOT NULL,
  year INTEGER NOT NULL,
  days JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des hommages
CREATE TABLE IF NOT EXISTS tributes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  photo TEXT,
  text TEXT NOT NULL,
  date_added TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  email VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  is_admin BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table de configuration
CREATE TABLE IF NOT EXISTS dashboard_config (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 2. CONFIGURATION DES POLITIQUES RLS (ROW LEVEL SECURITY)
-- ====================================================================

-- Activer RLS sur toutes les tables
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE permanences ENABLE ROW LEVEL SECURITY;
ALTER TABLE tributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_config ENABLE ROW LEVEL SECURITY;

-- Politiques permissives pour l'application
CREATE POLICY "Allow all operations" ON meetings FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON permanences FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON tributes FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON dashboard_config FOR ALL USING (true);

-- ====================================================================
-- 3. FONCTIONS RPC POUR CONTOURNER RLS SI NÉCESSAIRE
-- ====================================================================

-- Fonction pour récupérer tous les utilisateurs
CREATE OR REPLACE FUNCTION get_all_users()
RETURNS SETOF users
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM users ORDER BY created_at DESC;
$$;

-- Fonction pour supprimer un utilisateur
CREATE OR REPLACE FUNCTION delete_user_by_id(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  DELETE FROM users WHERE id = user_id;
  SELECT TRUE;
$$;

-- Fonction pour récupérer toutes les permanences
CREATE OR REPLACE FUNCTION get_all_permanences()
RETURNS SETOF permanences
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM permanences ORDER BY year DESC, month ASC, name ASC;
$$;

-- ====================================================================
-- 4. DONNÉES D'EXEMPLE POUR DÉMARRAGE
-- ====================================================================

-- Configuration par défaut
INSERT INTO dashboard_config (key, value) VALUES 
('videoUrl', 'https://www.youtube.com/embed/dQw4w9WgXcQ'),
('alertText', '🚨 APPEL CGT FTM - Rejoignez-nous pour défendre vos droits ! 🚨'),
('weatherCity', 'Paris')
ON CONFLICT (key) DO NOTHING;

-- Utilisateur admin par défaut
INSERT INTO users (username, email, role, is_admin, is_active) VALUES 
('admin.cgt', 'admin@cgt-ftm.fr', 'admin', TRUE, TRUE)
ON CONFLICT (username) DO NOTHING;

-- Hommage par défaut
INSERT INTO tributes (name, photo, text) VALUES 
('Henri Krasucki', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', 
'Ancien secrétaire général de la CGT, figure emblématique du syndicalisme français.')
ON CONFLICT DO NOTHING;

-- Réunions d'exemple
INSERT INTO meetings (title, time, room, category, date) VALUES 
('Assemblée Générale Ordinaire', '14:00', 'Salle des Congrès', 'Assemblée Générale', CURRENT_DATE + INTERVAL '1 day'),
('Commission Exécutive', '09:00', 'Bureau Confédéral', 'Commission', CURRENT_DATE + INTERVAL '2 days'),
('Négociation Salariale Métallurgie', '09:30', 'Salle de Négociation', 'Négociation', CURRENT_DATE + INTERVAL '3 days')
ON CONFLICT DO NOTHING;

-- Permanences d'exemple
INSERT INTO permanences (name, type, month, year, days, description) VALUES 
('Marie Dubois', 'technique', 'janvier', EXTRACT(YEAR FROM CURRENT_DATE), '{"15": {}, "16": {}}', 'Droit du travail'),
('Jean-Claude Martin', 'politique', 'janvier', EXTRACT(YEAR FROM CURRENT_DATE), '{"10": {}, "24": {}}', 'Négociation collective')
ON CONFLICT DO NOTHING;

-- ====================================================================
-- 5. INDEX POUR OPTIMISATION
-- ====================================================================

CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(date);
CREATE INDEX IF NOT EXISTS idx_permanences_year_month ON permanences(year, month);
CREATE INDEX IF NOT EXISTS idx_permanences_type ON permanences(type);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_tributes_date_added ON tributes(date_added);

-- ====================================================================
-- CONFIGURATION TERMINÉE
-- ====================================================================
-- Le dashboard CGT FTM est maintenant prêt pour la production
-- Toutes les tables, politiques et données d'exemple sont configurées
