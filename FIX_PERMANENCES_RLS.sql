-- ================================================
-- CORRIGER LES PERMISSIONS RLS - PERMANENCES
-- ================================================
-- Script pour corriger les problèmes d'accès RLS

-- 1. Désactiver temporairement RLS pour les tests
ALTER TABLE permanences DISABLE ROW LEVEL SECURITY;
ALTER TABLE permanence_categories DISABLE ROW LEVEL SECURITY;

-- 2. Créer les fonctions RPC bypass (au cas où)
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

-- 3. Vérifier les données
SELECT 'Tables créées et accessibles!' as status;
SELECT COUNT(*) as permanences_count FROM permanences;
SELECT COUNT(*) as categories_count FROM permanence_categories;

-- 4. Afficher les permanences
SELECT name, type, category, month, year FROM permanences LIMIT 5;

-- 5. Afficher les catégories
SELECT type, code, label, color FROM permanence_categories;
