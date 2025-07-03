-- ================================================
-- CORRIGER L'ERREUR NULL DANS LA COLONNE DAYS
-- ================================================

-- 1. D'abord, supprimer les permanences avec days = null ou vides
DELETE FROM permanences 
WHERE days IS NULL OR days = '{}' OR jsonb_typeof(days) != 'object';

-- 2. Corriger les permanences qui ont des jours mais pas de "P"
-- Les supprimer car elles ne sont pas de vraies permanences
DELETE FROM permanences 
WHERE category != 'P' 
   OR NOT EXISTS (
       SELECT 1 
       FROM jsonb_each_text(days) 
       WHERE value = 'P'
   );

-- 3. Pour les permanences restantes, nettoyer les jours (garder seulement "P")
UPDATE permanences 
SET days = COALESCE(
    (
        SELECT jsonb_object_agg(key, value)
        FROM jsonb_each_text(days) 
        WHERE value = 'P'
    ),
    '{}'::jsonb
)
WHERE category = 'P' AND days IS NOT NULL;

-- 4. Supprimer les permanences qui n'ont plus de jours après nettoyage
DELETE FROM permanences 
WHERE days = '{}' OR days IS NULL OR jsonb_typeof(days) != 'object';

-- 5. Ajouter des permanences d'exemple valides pour tester
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

    -- Supprimer les anciennes données de test
    DELETE FROM permanences WHERE description LIKE '%test%' OR name LIKE 'TEST%';

    -- Ajouter des permanences valides avec seulement des "P"
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
     'Permanences techniques'),
     
    ('LAURENT, Sophie', 'politique', 'P', current_month, current_year,
     jsonb_build_object(
        (current_day + 1)::text, 'P',
        (current_day + 4)::text, 'P'
     ),
     'Permanences politiques')
    ON CONFLICT (id) DO NOTHING;

    RAISE NOTICE 'Permanences d''exemple ajoutées pour % %', current_month, current_year;
END $$;

-- 6. Vérifier que toutes les permanences ont des days valides
SELECT 
    'Vérification' as status,
    COUNT(*) as total_permanences,
    COUNT(CASE WHEN days IS NULL THEN 1 END) as null_days,
    COUNT(CASE WHEN days = '{}' THEN 1 END) as empty_days,
    COUNT(CASE WHEN jsonb_typeof(days) = 'object' AND days != '{}' THEN 1 END) as valid_days
FROM permanences;

-- 7. Afficher les permanences valides
SELECT 
    name,
    type,
    category,
    month,
    year,
    days,
    description
FROM permanences 
WHERE category = 'P' 
  AND days IS NOT NULL 
  AND days != '{}'
ORDER BY name, month;

SELECT '✅ ERREUR CORRIGÉE - Permanences nettoyées avec days valides!' as final_status;
