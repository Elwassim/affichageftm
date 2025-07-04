-- Créer la table dashboard_config pour stocker les configurations

-- 1. Créer la table
CREATE TABLE IF NOT EXISTS dashboard_config (
  key VARCHAR(255) PRIMARY KEY,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Ajouter les configurations par défaut
INSERT INTO dashboard_config (key, value) VALUES
('videoUrl', '"https://www.youtube.com/embed/dQw4w9WgXcQ"'),
('alertText', '"🚨 APPEL CGT FTM - Rejoignez-nous pour défendre vos droits ! 🚨"'),
('weatherCity', '"Paris"')
ON CONFLICT (key) DO NOTHING;

-- 3. Créer des politiques RLS simples
ALTER TABLE dashboard_config ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture à tous
CREATE POLICY "Allow read access for all users" ON dashboard_config
FOR SELECT
USING (true);

-- Politique pour permettre l'écriture à tous (pour simplifier)
CREATE POLICY "Allow write access for all users" ON dashboard_config
FOR ALL
USING (true)
WITH CHECK (true);

-- 4. Vérifier que la table est créée correctement
SELECT * FROM dashboard_config;
