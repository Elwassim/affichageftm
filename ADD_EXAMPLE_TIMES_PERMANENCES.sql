-- Script pour ajouter des heures d'exemple aux permanences existantes
-- Ce script met à jour les permanences qui ont des jours sélectionnés mais pas d'heures

-- Exemple: ajouter 09:00 pour les permanences techniques et 14:00 pour les politiques
UPDATE permanences 
SET days = (
  SELECT jsonb_object_agg(
    key,
    CASE 
      WHEN value::text = 'true' THEN 
        CASE 
          WHEN type = 'technique' THEN '{"time": "09:00"}'::jsonb
          WHEN type = 'politique' THEN '{"time": "14:00"}'::jsonb
          ELSE '{"time": "10:00"}'::jsonb
        END
      ELSE value
    END
  )
  FROM jsonb_each(days)
)
WHERE days IS NOT NULL;

-- Vérifier le résultat
SELECT 
  id, 
  name, 
  type,
  days,
  created_at 
FROM permanences 
WHERE days IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;
