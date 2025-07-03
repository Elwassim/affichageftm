-- ================================================
-- SIMPLIFIER LA STRUCTURE DES PERMANENCES
-- ================================================
-- Enlever les sous-catégories et garder seulement technique/politique

-- 1. Nettoyer la table en supprimant les colonnes inutiles et en simplifiant
-- D'abord, sauvegarder les données actuelles
CREATE TABLE IF NOT EXISTS permanences_backup AS 
SELECT * FROM permanences;

-- 2. Supprimer l'ancienne table et recréer avec la structure simplifiée
DROP TABLE IF EXISTS permanences CASCADE;

CREATE TABLE permanences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('technique', 'politique')),
  month VARCHAR(20) NOT NULL,
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  days JSONB NOT NULL DEFAULT '{}', -- {1: true, 5: true, 14: true, ...}
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Créer les index
CREATE INDEX idx_permanences_type ON permanences(type);
CREATE INDEX idx_permanences_month_year ON permanences(month, year);
CREATE INDEX idx_permanences_name ON permanences(name);

-- 4. Supprimer la table des catégories qui n'est plus nécessaire
DROP TABLE IF EXISTS permanence_categories CASCADE;

-- 5. Insérer des permanences d'exemple avec la nouvelle structure
DO $$
DECLARE
    current_month VARCHAR;
    current_year INTEGER;
    current_day INTEGER;
    months VARCHAR[] := ARRAY['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 
                              'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
BEGIN
    current_month := months[EXTRACT(MONTH FROM CURRENT_DATE)];
    current_year := EXTRACT(YEAR FROM CURRENT_DATE);
    current_day := EXTRACT(DAY FROM CURRENT_DATE);

    -- Permanences techniques (basées sur le fichier fourni)
    INSERT INTO permanences (name, type, month, year, days, description) VALUES
    ('BINET, MAGALI', 'technique', current_month, current_year, 
     jsonb_build_object(
        (current_day)::text, true,
        (current_day + 2)::text, true,
        (current_day + 4)::text, true
     ), 
     'Permanences techniques'),
     
    ('DRABLA, MALEKA', 'technique', current_month, current_year,
     jsonb_build_object(
        (current_day + 1)::text, true,
        (current_day + 3)::text, true,
        (current_day + 5)::text, true
     ),
     'Permanences techniques'),
     
    ('MALSAN, Sigrid', 'technique', current_month, current_year,
     jsonb_build_object(
        (current_day + 2)::text, true,
        (current_day + 6)::text, true
     ),
     'Permanences techniques'),
     
    ('OUTIAMA, PATRICIA', 'technique', current_month, current_year,
     jsonb_build_object(
        (current_day + 1)::text, true,
        (current_day + 4)::text, true
     ),
     'Permanences techniques'),

    -- Permanences politiques (exemples)
    ('MARTIN, Jean', 'politique', current_month, current_year,
     jsonb_build_object(
        (current_day + 3)::text, true,
        (current_day + 5)::text, true
     ),
     'Permanences politiques'),
     
    ('DUBOIS, Sophie', 'politique', current_month, current_year,
     jsonb_build_object(
        (current_day + 1)::text, true,
        (current_day + 6)::text, true
     ),
     'Permanences politiques');

    RAISE NOTICE 'Permanences simplifiées ajoutées pour % %', current_month, current_year;
END $$;

-- 6. Permissions RLS simplifiées
ALTER TABLE permanences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read permanences" ON permanences;
CREATE POLICY "Allow public read permanences" ON permanences FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all write permanences" ON permanences;
CREATE POLICY "Allow all write permanences" ON permanences FOR ALL USING (true) WITH CHECK (true);

-- 7. Créer une fonction RPC simplifiée
CREATE OR REPLACE FUNCTION get_all_permanences()
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  type VARCHAR,
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

-- 8. Vérifications finales
SELECT 
    'Structure simplifiée!' as status,
    COUNT(*) as total_permanences,
    COUNT(CASE WHEN type = 'technique' THEN 1 END) as techniques,
    COUNT(CASE WHEN type = 'politique' THEN 1 END) as politiques
FROM permanences;

-- Afficher les permanences
SELECT 
    name,
    type,
    month,
    year,
    jsonb_object_keys(days) as jours_permanence
FROM permanences 
ORDER BY type, name
LIMIT 10;

SELECT '✅ STRUCTURE SIMPLIFIÉE TERMINÉE!' as final_status;
