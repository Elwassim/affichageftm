-- Script SQL CORRECT basé sur l'analyse détaillée du planning
-- Charge uniquement les cases marquées "P" dans le planning

-- 1. Supprimer les permanences existantes
DELETE FROM permanences 
WHERE (month = 'juin' AND year = 2025)
   OR (month = 'juillet' AND year = 2025)
   OR (month = 'août' AND year = 2025);

-- 2. Charger les permanences EXACTES selon le planning

-- JUIN 2025 (1 permanence)
INSERT INTO permanences (name, type, month, year, days, created_at) VALUES
('BINET, MAGALI', 'technique', 'juin', 2025, '{"2": true}', NOW());

-- JUILLET 2025 (6 permanences)
INSERT INTO permanences (name, type, month, year, days, created_at) VALUES
('DRABLA, MALEKA', 'technique', 'juillet', 2025, '{"5": true}', NOW()),
('GALLOIS, FATIMA', 'technique', 'juillet', 2025, '{"5": true}', NOW()),
('GUITTON, STEPHANIE', 'technique', 'juillet', 2025, '{"5": true}', NOW()),
('LETELLIER, VIRGINIE', 'technique', 'juillet', 2025, '{"5": true}', NOW()),
('MALSAN, Sigrid', 'technique', 'juillet', 2025, '{"3": true}', NOW()),
('OUTIAMA, PATRICIA', 'technique', 'juillet', 2025, '{"5": true}', NOW());

-- AOÛT 2025 (2 permanences)
INSERT INTO permanences (name, type, month, year, days, created_at) VALUES
('LETELLIER, VIRGINIE', 'technique', 'août', 2025, '{"3": true}', NOW()),
('MALSAN, Sigrid', 'technique', 'août', 2025, '{"3": true}', NOW());

-- 3. Vérification du chargement
SELECT 
  name, 
  month, 
  year, 
  days
FROM permanences 
WHERE (month = 'juin' AND year = 2025)
   OR (month = 'juillet' AND year = 2025)
   OR (month = 'août' AND year = 2025)
ORDER BY 
  CASE month 
    WHEN 'juin' THEN 1
    WHEN 'juillet' THEN 2 
    WHEN 'août' THEN 3
  END,
  name;

-- 4. Résumé final
SELECT 
  month,
  COUNT(*) as nb_permanences,
  STRING_AGG(name, ', ') as personnes
FROM permanences 
WHERE (month = 'juin' AND year = 2025)
   OR (month = 'juillet' AND year = 2025)
   OR (month = 'août' AND year = 2025)
GROUP BY month
ORDER BY 
  CASE month 
    WHEN 'juin' THEN 1
    WHEN 'juillet' THEN 2 
    WHEN 'août' THEN 3
  END;
