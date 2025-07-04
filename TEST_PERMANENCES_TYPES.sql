-- Script de test pour vérifier la séparation permanences techniques/politiques

-- 1. Supprimer les permanences de test existantes
DELETE FROM permanences WHERE name LIKE '%TEST%';

-- 2. Ajouter des permanences techniques de test
INSERT INTO permanences (name, type, month, year, days, created_at) VALUES
('TEST Technique 1', 'technique', 'janvier', 2025, '{"15": true, "16": true, "17": true}', NOW()),
('TEST Technique 2', 'technique', 'janvier', 2025, '{"22": true, "23": true}', NOW());

-- 3. Ajouter des permanences politiques de test  
INSERT INTO permanences (name, type, month, year, days, created_at) VALUES
('TEST Politique 1', 'politique', 'janvier', 2025, '{"10": true, "11": true, "12": true}', NOW()),
('TEST Politique 2', 'politique', 'janvier', 2025, '{"25": true, "26": true}', NOW());

-- 4. Vérifier la répartition par type
SELECT 
  type,
  COUNT(*) as nombre,
  STRING_AGG(name, ', ') as noms
FROM permanences 
WHERE name LIKE '%TEST%'
GROUP BY type
ORDER BY type;

-- 5. Vérifier les détails de chaque permanence de test
SELECT 
  name,
  type,
  month,
  year,
  days,
  created_at
FROM permanences 
WHERE name LIKE '%TEST%'
ORDER BY type, name;
