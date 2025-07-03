-- ================================================
-- SCRIPT DE SYNCHRONISATION PERMANENCES - CGT FTM
-- ================================================
-- À exécuter directement dans Supabase SQL Editor

-- 1. Créer la nouvelle structure permanences
CREATE TABLE IF NOT EXISTS permanences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('technique', 'politique')),
  category VARCHAR(50) NOT NULL, -- P, PAR, MAL, RTT, REC, CP, FER, etc.
  month VARCHAR(20) NOT NULL, -- juin, juillet, août, etc.
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  days JSONB NOT NULL DEFAULT '{}', -- {1: "P", 5: "PAR", 14: "FER", ...}
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Créer les index pour performance
CREATE INDEX IF NOT EXISTS idx_permanences_type ON permanences(type);
CREATE INDEX IF NOT EXISTS idx_permanences_month_year ON permanences(month, year);
CREATE INDEX IF NOT EXISTS idx_permanences_name ON permanences(name);

-- 3. Créer les catégories de référence
CREATE TABLE IF NOT EXISTS permanence_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(20) NOT NULL,
  code VARCHAR(10) NOT NULL,
  label VARCHAR(100) NOT NULL,
  color VARCHAR(7) DEFAULT '#3b82f6', -- Couleur hex pour l'affichage
  description TEXT,
  UNIQUE(type, code)
);

-- 4. Insérer les catégories techniques
INSERT INTO permanence_categories (type, code, label, color, description) VALUES
('technique', 'P', 'Permanences', '#3b82f6', 'Permanences normales'),
('technique', 'PAR', 'Congés Parental', '#ec4899', 'Congés parental'),
('technique', 'MAL', 'Maladie', '#ef4444', 'Arrêt maladie'),
('technique', 'RTT', 'RTT', '#10b981', 'Réduction du temps de travail'),
('technique', 'REC', 'Récupération', '#f59e0b', 'Récupération'),
('technique', 'CP', 'Congés Payés', '#8b5cf6', 'Congés payés'),
('technique', 'FER', 'Férié', '#6b7280', 'Jour férié')
ON CONFLICT (type, code) DO NOTHING;

-- 5. Insérer quelques permanences d'exemple basées sur le document
INSERT INTO permanences (name, type, category, month, year, days, description) VALUES
-- BINET, MAGALI  
('BINET, MAGALI', 'technique', 'P', 'juillet', 2025, '{"2":"P","14":"FER"}', 'Permanences standard'),

-- GALLOIS, FATIMA
('GALLOIS, FATIMA', 'technique', 'RTT', 'juillet', 2025, '{"14":"FER","18":"RTT"}', 'RTT juillet'),
('GALLOIS, FATIMA', 'technique', 'RTT', 'août', 2025, '{"1":"RTT"}', 'RTT août'),

-- LETELLIER, VIRGINIE
('LETELLIER, VIRGINIE', 'technique', 'CP', 'juillet', 2025, '{"2":"P","14":"FER","22":"CP","23":"CP","24":"CP","25":"CP","26":"CP","27":"CP","29":"CP","30":"CP","31":"CP"}', 'Congés payés été'),
('LETELLIER, VIRGINIE', 'technique', 'CP', 'août', 2025, '{"1":"CP"}', 'Congés payés suite'),

-- MALSAN, Sigrid
('MALSAN, Sigrid', 'technique', 'P', 'juillet', 2025, '{"2":"P","14":"FER"}', 'Permanences standard'),
('MALSAN, Sigrid', 'technique', 'P', 'août', 2025, '{"1":"P"}', 'Permanences août'),

-- ROBERGE, NATHALIE
('ROBERGE, NATHALIE', 'technique', 'RTT', 'juillet', 2025, '{"14":"FER","18":"RTT"}', 'RTT juillet')
ON CONFLICT (id) DO NOTHING;

-- 6. Permissions RLS (lecture publique)
ALTER TABLE permanences ENABLE ROW LEVEL SECURITY;
ALTER TABLE permanence_categories ENABLE ROW LEVEL SECURITY;

-- Permettre lecture publique
DROP POLICY IF EXISTS "Allow public read permanences" ON permanences;
CREATE POLICY "Allow public read permanences" ON permanences FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read categories" ON permanence_categories;
CREATE POLICY "Allow public read categories" ON permanence_categories FOR SELECT USING (true);

-- Permettre modifications pour tous (à ajuster selon vos besoins de sécurité)
DROP POLICY IF EXISTS "Allow all write permanences" ON permanences;
CREATE POLICY "Allow all write permanences" ON permanences FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all write categories" ON permanence_categories;
CREATE POLICY "Allow all write categories" ON permanence_categories FOR ALL USING (true) WITH CHECK (true);

-- 7. Vue pour faciliter les requêtes avec catégories
CREATE OR REPLACE VIEW permanences_with_categories AS
SELECT 
  p.*,
  pc.label as category_label,
  pc.color as category_color,
  pc.description as category_description
FROM permanences p
LEFT JOIN permanence_categories pc ON (p.type = pc.type AND p.category = pc.code)
ORDER BY p.year DESC, p.month, p.name;

-- 8. Fonction pour récupérer les permanences du mois
CREATE OR REPLACE FUNCTION get_permanences_for_month(
  target_month VARCHAR,
  target_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)
)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  type VARCHAR,
  category VARCHAR,
  category_label VARCHAR,
  category_color VARCHAR,
  days JSONB,
  description TEXT
)
LANGUAGE SQL
AS $$
  SELECT 
    p.id,
    p.name,
    p.type,
    p.category,
    pc.label,
    pc.color,
    p.days,
    p.description
  FROM permanences p
  LEFT JOIN permanence_categories pc ON (p.type = pc.type AND p.category = pc.code)
  WHERE p.month = target_month AND p.year = target_year
  ORDER BY p.name, p.category;
$$;

-- 9. Vérification finale
SELECT 
  'Synchronisation terminée!' as status,
  COUNT(*) as permanences_count,
  COUNT(DISTINCT name) as personnes_count,
  COUNT(DISTINCT type) as types_count
FROM permanences;

-- Afficher les catégories disponibles
SELECT 
  type,
  code,
  label,
  color,
  description
FROM permanence_categories
ORDER BY type, code;

-- Afficher un échantillon des permanences
SELECT 
  name,
  type,
  category,
  month,
  year,
  jsonb_object_keys(days) as jours_definis
FROM permanences 
LIMIT 10;
