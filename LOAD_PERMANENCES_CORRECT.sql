-- Charger les PERMANENCES correctement selon le planning CGT FTM
-- Seules les cases marquées "P" sont des permanences réelles

-- 1. Supprimer les permanences existantes pour ces mois
DELETE FROM permanences 
WHERE (month = 'juin' AND year = 2025)
   OR (month = 'juillet' AND year = 2025)
   OR (month = 'août' AND year = 2025);

-- 2. Charger les permanences EXACTEMENT selon le planning

-- JUIN 2025
-- GUITTON, STEPHANIE : P le 18 juin
INSERT INTO permanences (name, type, month, year, days, created_at) VALUES
('GUITTON, STEPHANIE', 'technique', 'juin', 2025, '{"18": true}', NOW());

-- JUILLET 2025
-- BINET, MAGALI : P le 13 juillet
INSERT INTO permanences (name, type, month, year, days, created_at) VALUES
('BINET, MAGALI', 'technique', 'juillet', 2025, '{"13": true}', NOW());

-- DRABLA, MALEKA : P le 5 et 13 juillet
INSERT INTO permanences (name, type, month, year, days, created_at) VALUES
('DRABLA, MALEKA', 'technique', 'juillet', 2025, '{"5": true, "13": true}', NOW());

-- GUITTON, STEPHANIE : P le 5 et 13 juillet
INSERT INTO permanences (name, type, month, year, days, created_at) VALUES
('GUITTON, STEPHANIE', 'technique', 'juillet', 2025, '{"5": true, "13": true}', NOW());

-- LETELLIER, VIRGINIE : P le 9 juillet
INSERT INTO permanences (name, type, month, year, days, created_at) VALUES
('LETELLIER, VIRGINIE', 'technique', 'juillet', 2025, '{"9": true}', NOW());

-- MALSAN, Sigrid : P le 3 juillet
INSERT INTO permanences (name, type, month, year, days, created_at) VALUES
('MALSAN, Sigrid', 'technique', 'juillet', 2025, '{"3": true}', NOW());

-- OUTIAMA, PATRICIA : P le 5 juillet
INSERT INTO permanences (name, type, month, year, days, created_at) VALUES
('OUTIAMA, PATRICIA', 'technique', 'juillet', 2025, '{"5": true}', NOW());

-- AOÛT 2025
-- GALLOIS, FATIMA : P le 11 août
INSERT INTO permanences (name, type, month, year, days, created_at) VALUES
('GALLOIS, FATIMA', 'technique', 'août', 2025, '{"11": true}', NOW());

-- MALSAN, Sigrid : P le 3 août
INSERT INTO permanences (name, type, month, year, days, created_at) VALUES
('MALSAN, Sigrid', 'technique', 'août', 2025, '{"3": true}', NOW());

-- OUTIAMA, PATRICIA : P le 3 août
INSERT INTO permanences (name, type, month, year, days, created_at) VALUES
('OUTIAMA, PATRICIA', 'technique', 'août', 2025, '{"3": true}', NOW());

-- 3. Vérification des permanences chargées
SELECT 
  name, 
  type, 
  month, 
  year, 
  days,
  created_at
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

-- 4. Résumé par mois
SELECT 
  month,
  year,
  COUNT(*) as nb_permanences_personnes,
  STRING_AGG(DISTINCT name, ', ') as personnes
FROM permanences 
WHERE (month = 'juin' AND year = 2025)
   OR (month = 'juillet' AND year = 2025)
   OR (month = 'août' AND year = 2025)
GROUP BY month, year
ORDER BY 
  CASE month 
    WHEN 'juin' THEN 1
    WHEN 'juillet' THEN 2 
    WHEN 'août' THEN 3
  END;
