-- ================================================
-- FONCTIONS RPC POUR CONTOURNER RLS - PERMANENCES
-- ================================================
-- À exécuter dans Supabase SQL Editor pour bypasser RLS

-- Fonction pour récupérer toutes les permanences (bypass RLS)
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
  SELECT 
    p.id,
    p.name,
    p.type,
    p.category,
    p.month,
    p.year,
    p.days,
    p.description,
    p.created_at,
    p.updated_at
  FROM permanences p
  ORDER BY p.year DESC, p.month, p.name;
$$;

-- Fonction pour récupérer toutes les catégories (bypass RLS)
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
  SELECT 
    pc.id,
    pc.type,
    pc.code,
    pc.label,
    pc.color,
    pc.description
  FROM permanence_categories pc
  ORDER BY pc.type, pc.code;
$$;

-- Fonction pour récupérer permanences avec catégories (bypass RLS)
CREATE OR REPLACE FUNCTION get_permanences_with_categories()
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
  updated_at TIMESTAMP WITH TIME ZONE,
  category_label VARCHAR,
  category_color VARCHAR,
  category_description TEXT
)
SECURITY DEFINER
LANGUAGE SQL
AS $$
  SELECT 
    p.id,
    p.name,
    p.type,
    p.category,
    p.month,
    p.year,
    p.days,
    p.description,
    p.created_at,
    p.updated_at,
    pc.label as category_label,
    pc.color as category_color,
    pc.description as category_description
  FROM permanences p
  LEFT JOIN permanence_categories pc ON (p.type = pc.type AND p.category = pc.code)
  ORDER BY p.year DESC, p.month, p.name;
$$;

-- Fonction pour insérer une permanence (bypass RLS)
CREATE OR REPLACE FUNCTION insert_permanence(
  p_name VARCHAR,
  p_type VARCHAR,
  p_category VARCHAR,
  p_month VARCHAR,
  p_year INTEGER,
  p_days JSONB,
  p_description TEXT DEFAULT NULL
)
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
  INSERT INTO permanences (name, type, category, month, year, days, description)
  VALUES (p_name, p_type, p_category, p_month, p_year, p_days, p_description)
  RETURNING *;
$$;

-- Vérification des fonctions
SELECT 'Fonctions RPC créées avec succès!' as status;

-- Test des fonctions
SELECT COUNT(*) as permanences_count FROM get_all_permanences();
SELECT COUNT(*) as categories_count FROM get_all_permanence_categories();
