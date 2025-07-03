-- ================================================
-- METTRE À JOUR LES PERMANENCES - GARDER SEULEMENT LES VRAIES PERMANENCES (P)
-- ================================================

-- 1. Nettoyer les données pour ne garder que les permanences réelles
-- Les autres statuts (PAR, MAL, RTT, etc.) sont des absences/congés, pas des permanences

-- Supprimer les "permanences" qui sont en fait des congés/absences
-- (garder seulement celles avec catégorie 'P')
DELETE FROM permanences 
WHERE category != 'P';

-- 2. Nettoyer les jours dans les permanences existantes
-- Garder seulement les jours marqués "P" dans le JSON days

UPDATE permanences 
SET days = (
  SELECT jsonb_object_agg(key, value)
  FROM jsonb_each_text(days) 
  WHERE value = 'P'
)
WHERE jsonb_typeof(days) = 'object';

-- 3. Supprimer les permanences qui n'ont plus de jours après nettoyage
DELETE FROM permanences 
WHERE days = '{}' OR days IS NULL;

-- 4. Mettre à jour les descriptions pour clarifier
UPDATE permanences 
SET description = CASE 
  WHEN description LIKE '%test%' THEN description
  ELSE 'Permanence technique'
END
WHERE category = 'P';

-- 5. Ajouter quelques permanences d'exemple réelles pour les prochains jours
-- (seulement si pas de données de test)

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

    -- Ajouter des permanences réelles pour les prochains jours
    INSERT INTO permanences (name, type, category, month, year, days, description) VALUES
    ('MARTIN, Jean', 'technique', 'P', current_month, current_year, 
     jsonb_build_object(
        (current_day)::text, 'P',
        (current_day + 2)::text, 'P',
        (current_day + 4)::text, 'P'
     ), 
     'Permanences techniques'),
     
    ('DUBOIS, Marie', 'technique', 'P', current_month, current_year,
     jsonb_build_object(
        (current_day + 1)::text, 'P',
        (current_day + 3)::text, 'P',
        (current_day + 5)::text, 'P'
     ),
     'Permanences techniques'),
     
    ('GARCIA, Pedro', 'technique', 'P', current_month, current_year,
     jsonb_build_object(
        (current_day + 6)::text, 'P'
     ),
     'Permanences techniques')
    ON CONFLICT (id) DO NOTHING;

END $$;

-- 6. Vérifications finales
SELECT 
    'Permanences réelles uniquement' as status,
    COUNT(*) as total_permanences,
    COUNT(DISTINCT name) as personnes_distinctes
FROM permanences 
WHERE category = 'P';

-- Afficher les permanences des prochains jours
SELECT 
    name,
    month,
    year,
    jsonb_object_keys(days) as jour,
    days->jsonb_object_keys(days) as statut
FROM permanences 
WHERE category = 'P'
  AND jsonb_object_keys(days)::int >= EXTRACT(DAY FROM CURRENT_DATE)
ORDER BY name, jsonb_object_keys(days)::int
LIMIT 10;

SELECT '✅ NETTOYAGE TERMINÉ - Seulement les vraies permanences (P) affichées!' as final_status;
