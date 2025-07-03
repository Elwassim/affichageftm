-- ================================================
-- CORRIGER LES PERMISSIONS RLS - TRIBUTES/HOMMAGES
-- ================================================
-- Script pour corriger les problèmes d'accès RLS pour les hommages

-- 1. Désactiver RLS sur la table tributes
ALTER TABLE tributes DISABLE ROW LEVEL SECURITY;

-- 2. Créer la fonction RPC bypass (au cas où)
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

-- 3. Vérifier les données
SELECT 'Table tributes accessible!' as status;
SELECT COUNT(*) as tributes_count FROM tributes;

-- 4. Afficher les hommages existants
SELECT name, LEFT(text, 50) as text_preview, date_added FROM tributes LIMIT 5;

-- 5. Si pas de données, insérer un exemple
INSERT INTO tributes (name, photo, text, date_added) VALUES
('Exemple Hommage', '', 'Texte d''hommage d''exemple pour tester la synchronisation.', NOW())
ON CONFLICT (id) DO NOTHING;

-- 6. Vérification finale
SELECT COUNT(*) as final_count FROM tributes;
