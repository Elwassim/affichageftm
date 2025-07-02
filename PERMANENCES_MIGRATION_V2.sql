-- ================================================
-- MIGRATION PERMANENCES V2 - CGT FTM
-- ================================================
-- Nouvelle structure pour permanences techniques/politiques

-- 1. Sauvegarder les anciennes données
CREATE TABLE IF NOT EXISTS permanences_backup AS 
SELECT * FROM permanences;

-- 2. Supprimer l'ancienne table
DROP TABLE IF EXISTS permanences;

-- 3. Créer la nouvelle structure
CREATE TABLE permanences (
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

-- 4. Créer les index pour performance
CREATE INDEX idx_permanences_type ON permanences(type);
CREATE INDEX idx_permanences_month_year ON permanences(month, year);
CREATE INDEX idx_permanences_name ON permanences(name);

-- 5. Ajouter les données de test permanences techniques (basé sur le document)
INSERT INTO permanences (name, type, category, month, year, days, description) VALUES
-- AYAZ, SERAP
('AYAZ, SERAP', 'technique', 'PAR', 'juillet', 2025, '{"3":"PAR","5":"PAR","6":"PAR","7":"PAR","8":"PAR","13":"FER","14":"PAR","15":"PAR","16":"PAR","17":"PAR"}', 'Congés parental juillet 2025'),

-- BINET, MAGALI  
('BINET, MAGALI', 'technique', 'P', 'juillet', 2025, '{"2":"P","14":"FER"}', 'Permanences standard'),

-- CAMARA, HAWA
('CAMARA, HAWA', 'technique', 'MAL', 'juin', 2025, '{"30":"MAL"}', 'Arrêt maladie'),
('CAMARA, HAWA', 'technique', 'MAL', 'juillet', 2025, '{"1":"MAL","14":"FER"}', 'Arrêt maladie suite'),

-- DRABLA, MALEKA
('DRABLA, MALEKA', 'technique', 'P', 'juillet', 2025, '{"2":"P","11":"P","14":"FER"}', 'Permanences standard'),

-- GALLOIS, FATIMA
('GALLOIS, FATIMA', 'technique', 'RTT', 'juillet', 2025, '{"14":"FER","18":"RTT"}', 'RTT juillet'),
('GALLOIS, FATIMA', 'technique', 'RTT', 'août', 2025, '{"1":"RTT"}', 'RTT août'),

-- GUITTON, STEPHANIE
('GUITTON, STEPHANIE', 'technique', 'P', 'juin', 2025, '{"3":"RTT"}', 'RTT juin'),
('GUITTON, STEPHANIE', 'technique', 'P', 'juillet', 2025, '{"2":"P","14":"FER","15":"RTT","16":"RTT"}', 'Permanences et RTT juillet'),

-- LETELLIER, VIRGINIE
('LETELLIER, VIRGINIE', 'technique', 'CP', 'juillet', 2025, '{"2":"P","14":"FER","22":"CP","23":"CP","24":"CP","25":"CP","26":"CP","27":"CP","29":"CP","30":"CP","31":"CP"}', 'Congés payés été'),
('LETELLIER, VIRGINIE', 'technique', 'CP', 'août', 2025, '{"1":"CP"}', 'Congés payés suite'),

-- MALSAN, Sigrid
('MALSAN, Sigrid', 'technique', 'P', 'juillet', 2025, '{"2":"P","14":"FER"}', 'Permanences standard'),
('MALSAN, Sigrid', 'technique', 'P', 'août', 2025, '{"1":"P"}', 'Permanences août'),

-- OUTIAMA, PATRICIA
('OUTIAMA, PATRICIA', 'technique', 'P', 'juillet', 2025, '{"2":"P","14":"FER"}', 'Permanences standard'),

-- ROBERGE, NATHALIE
('ROBERGE, NATHALIE', 'technique', 'RTT', 'juillet', 2025, '{"14":"FER","18":"RTT"}', 'RTT juillet');

-- 6. Créer les catégories de référence
CREATE TABLE IF NOT EXISTS permanence_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(20) NOT NULL,
  code VARCHAR(10) NOT NULL,
  label VARCHAR(100) NOT NULL,
  color VARCHAR(7) DEFAULT '#3b82f6', -- Couleur hex pour l'affichage
  description TEXT,
  UNIQUE(type, code)
);

-- 7. Insérer les catégories techniques
INSERT INTO permanence_categories (type, code, label, color, description) VALUES
('technique', 'P', 'Permanences', '#3b82f6', 'Permanences normales'),
('technique', 'PAR', 'Congés Parental', '#ec4899', 'Congés parental'),
('technique', 'MAL', 'Maladie', '#ef4444', 'Arrêt maladie'),
('technique', 'RTT', 'RTT', '#10b981', 'Réduction du temps de travail'),
('technique', 'REC', 'Récupération', '#f59e0b', 'Récupération'),
('technique', 'CP', 'Congés Payés', '#8b5cf6', 'Congés payés'),
('technique', 'FER', 'Férié', '#6b7280', 'Jour férié');

-- 8. Permissions RLS
ALTER TABLE permanences ENABLE ROW LEVEL SECURITY;
ALTER TABLE permanence_categories ENABLE ROW LEVEL SECURITY;

-- Permettre lecture publique
CREATE POLICY "Allow public read permanences" ON permanences FOR SELECT USING (true);
CREATE POLICY "Allow public read categories" ON permanence_categories FOR SELECT USING (true);

-- Permettre modifications pour admin
CREATE POLICY "Allow admin write permanences" ON permanences FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow admin write categories" ON permanence_categories FOR ALL USING (true) WITH CHECK (true);

-- 9. Triggers pour updated_at
CREATE TRIGGER update_permanences_updated_at 
  BEFORE UPDATE ON permanences 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. Vue pour faciliter les requêtes
CREATE OR REPLACE VIEW permanences_with_categories AS
SELECT 
  p.*,
  pc.label as category_label,
  pc.color as category_color,
  pc.description as category_description
FROM permanences p
LEFT JOIN permanence_categories pc ON (p.type = pc.type AND p.category = pc.code)
ORDER BY p.year DESC, p.month, p.name;

-- 11. Fonction pour récupérer les permanences du mois
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

-- 12. Vérification finale
SELECT 
  'Migration terminée!' as status,
  COUNT(*) as permanences_count,
  COUNT(DISTINCT name) as personnes_count,
  COUNT(DISTINCT type) as types_count
FROM permanences;

-- Afficher un échantillon
SELECT 
  name,
  type,
  category,
  month,
  year,
  jsonb_object_keys(days) as jour_exemple
FROM permanences 
LIMIT 10;
