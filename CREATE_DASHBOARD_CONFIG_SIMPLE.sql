-- Créer la table dashboard_config pour stocker les configurations (version simplifiée)

-- 1. Supprimer la table si elle existe (pour recommencer proprement)
DROP TABLE IF EXISTS dashboard_config;

-- 2. Créer la table avec TEXT simple
CREATE TABLE dashboard_config (
  key TEXT PRIMARY KEY,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Ajouter les configurations par défaut
INSERT INTO dashboard_config (key, value) VALUES
('videoUrl', 'https://www.youtube.com/embed/dQw4w9WgXcQ'),
('alertText', '🚨 APPEL CGT FTM - Rejoignez-nous pour défendre vos droits ! 🚨'),
('weatherCity', 'Paris');

-- 4. Créer des politiques RLS simples
ALTER TABLE dashboard_config ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre tous les accès (lecture et écriture)
CREATE POLICY "Allow all access" ON dashboard_config
FOR ALL
USING (true)
WITH CHECK (true);

-- 5. Vérifier que la table est créée correctement
SELECT * FROM dashboard_config;
