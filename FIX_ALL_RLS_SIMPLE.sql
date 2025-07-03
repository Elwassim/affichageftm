-- ================================================
-- CORRIGER TOUS LES PROBLEMES RLS - CGT FTM (VERSION SIMPLE)
-- ================================================
-- Script sans problème de mot-clé réservé

-- 1. DÉSACTIVER RLS SUR TOUTES LES TABLES
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE permanences DISABLE ROW LEVEL SECURITY;
ALTER TABLE permanence_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE tributes DISABLE ROW LEVEL SECURITY;
ALTER TABLE meetings DISABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_config DISABLE ROW LEVEL SECURITY;

-- 2. CRÉER LES FONCTIONS RPC ESSENTIELLES

-- Utilisateurs
CREATE OR REPLACE FUNCTION get_all_users()
RETURNS TABLE (
  id UUID, 
  username VARCHAR, 
  email VARCHAR, 
  role VARCHAR,
  is_admin BOOLEAN, 
  is_active BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE, 
  updated_at TIMESTAMP WITH TIME ZONE
)
SECURITY DEFINER 
LANGUAGE SQL 
AS $$
  SELECT 
    id, username, email, role, is_admin, is_active, created_at, updated_at
  FROM users 
  ORDER BY created_at DESC;
$$;

-- Permanences
CREATE OR REPLACE FUNCTION get_all_permanences()
RETURNS TABLE (
  id UUID, 
  name VARCHAR, 
  type VARCHAR, 
  category VARCHAR,
  month VARCHAR, 
  year INTEGER, 
  days JSONB, 
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE, 
  updated_at TIMESTAMP WITH TIME ZONE
)
SECURITY DEFINER 
LANGUAGE SQL 
AS $$
  SELECT * FROM permanences ORDER BY year DESC, month, name;
$$;

-- Catégories permanences
CREATE OR REPLACE FUNCTION get_all_permanence_categories()
RETURNS TABLE (
  id UUID, 
  type VARCHAR, 
  code VARCHAR, 
  label VARCHAR, 
  color VARCHAR, 
  description TEXT
)
SECURITY DEFINER 
LANGUAGE SQL 
AS $$
  SELECT * FROM permanence_categories ORDER BY type, code;
$$;

-- Tributes/Hommages
CREATE OR REPLACE FUNCTION get_all_tributes()
RETURNS TABLE (
  id UUID, 
  name VARCHAR, 
  photo TEXT, 
  text TEXT,
  date_added TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE, 
  updated_at TIMESTAMP WITH TIME ZONE
)
SECURITY DEFINER 
LANGUAGE SQL 
AS $$
  SELECT * FROM tributes ORDER BY created_at ASC;
$$;

-- Réunions (éviter le mot-clé time)
CREATE OR REPLACE FUNCTION get_all_meetings()
RETURNS TABLE (
  id UUID, 
  title VARCHAR, 
  meeting_time VARCHAR, 
  room VARCHAR, 
  category VARCHAR,
  date DATE, 
  created_at TIMESTAMP WITH TIME ZONE, 
  updated_at TIMESTAMP WITH TIME ZONE
)
SECURITY DEFINER 
LANGUAGE SQL 
AS $$
  SELECT 
    id, title, time as meeting_time, room, category, date, created_at, updated_at
  FROM meetings 
  ORDER BY date DESC, time;
$$;

-- 3. INSÉRER DES DONNÉES DE TEST BASIQUES

-- Utilisateur admin par défaut
INSERT INTO users (username, password_hash, email, role, is_admin, is_active) 
VALUES ('admin', '$2b$10$defaulthash', 'admin@cgt-ftm.fr', 'admin', true, true)
ON CONFLICT (username) DO NOTHING;

-- Catégories permanences par défaut
INSERT INTO permanence_categories (type, code, label, color, description) VALUES
('technique', 'P', 'Permanences', '#3b82f6', 'Permanences normales'),
('technique', 'PAR', 'Congés Parental', '#ec4899', 'Congés parental'),
('technique', 'MAL', 'Maladie', '#ef4444', 'Arrêt maladie'),
('technique', 'RTT', 'RTT', '#10b981', 'Réduction du temps de travail'),
('technique', 'REC', 'Récupération', '#f59e0b', 'Récupération'),
('technique', 'CP', 'Congés Payés', '#8b5cf6', 'Congés payés'),
('technique', 'FER', 'Férié', '#6b7280', 'Jour férié')
ON CONFLICT (type, code) DO NOTHING;

-- Permanence d'exemple
INSERT INTO permanences (name, type, category, month, year, days, description) 
VALUES ('TEST, Admin', 'technique', 'P', 'janvier', 2025, '{"1":"P","15":"P"}', 'Permanence de test')
ON CONFLICT (id) DO NOTHING;

-- Hommage d'exemple
INSERT INTO tributes (name, photo, text, date_added) 
VALUES ('Hommage Test', '', 'Exemple d''hommage pour vérifier la synchronisation.', NOW())
ON CONFLICT (id) DO NOTHING;

-- 4. VÉRIFICATIONS FINALES
SELECT 'Toutes les tables sont maintenant accessibles!' as status;

-- Compter les données
SELECT 
  'UTILISATEURS' as table_name, 
  COUNT(*)::text as count 
FROM users

UNION ALL

SELECT 
  'PERMANENCES', 
  COUNT(*)::text 
FROM permanences

UNION ALL

SELECT 
  'CATEGORIES', 
  COUNT(*)::text 
FROM permanence_categories

UNION ALL

SELECT 
  'HOMMAGES', 
  COUNT(*)::text 
FROM tributes

UNION ALL

SELECT 
  'RÉUNIONS', 
  COUNT(*)::text 
FROM meetings;

-- 5. TEST DES FONCTIONS RPC
SELECT 'Test RPC Users: ' || COUNT(*)::text as test FROM get_all_users();
SELECT 'Test RPC Permanences: ' || COUNT(*)::text as test FROM get_all_permanences();
SELECT 'Test RPC Catégories: ' || COUNT(*)::text as test FROM get_all_permanence_categories();
SELECT 'Test RPC Hommages: ' || COUNT(*)::text as test FROM get_all_tributes();
SELECT 'Test RPC Réunions: ' || COUNT(*)::text as test FROM get_all_meetings();

SELECT '✅ SYNCHRONISATION COMPLÈTE TERMINÉE SANS ERREUR!' as final_status;
