-- Migration pour ajouter le support des heures dans les permanences
-- Transforme la structure days de Record<string, boolean> vers Record<string, {time?: string}>

-- 1. Créer une nouvelle colonne temporaire pour la nouvelle structure
ALTER TABLE permanences ADD COLUMN days_new JSONB;

-- 2. Migrer les données existantes vers le nouveau format
UPDATE permanences 
SET days_new = (
  SELECT jsonb_object_agg(
    key, 
    CASE 
      WHEN value::boolean = true THEN '{"time": null}'::jsonb
      ELSE 'false'::jsonb
    END
  )
  FROM jsonb_each(days)
)
WHERE days IS NOT NULL;

-- 3. Gérer les cas où days est null
UPDATE permanences 
SET days_new = '{}'::jsonb 
WHERE days IS NULL;

-- 4. Supprimer l'ancienne colonne et renommer la nouvelle
ALTER TABLE permanences DROP COLUMN days;
ALTER TABLE permanences RENAME COLUMN days_new TO days;

-- 5. Vérifier la migration
SELECT 
  id, 
  elus_name, 
  type,
  days,
  created_at 
FROM permanences 
LIMIT 5;

-- Commentaire explicatif de la nouvelle structure:
-- days: {
--   "L": {"time": "09:00"} ou false,
--   "Ma": {"time": "14:30"} ou false,
--   "Me": false,
--   "J": {"time": "10:15"} ou false,
--   "V": false,
--   "S": {"time": "11:00"} ou false,
--   "D": false
-- }
