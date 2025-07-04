-- Charger uniquement les PERMANENCES (P) du planning CGT FTM
-- Exclut toutes les absences (PAR, MAL, RTT, FER, CP, REC)

-- 1. Vider d'abord les permanences existantes pour les mois concernés
DELETE FROM permanences
WHERE (month = 'juin' AND year = 2025)
   OR (month = 'juillet' AND year = 2025)
   OR (month = 'août' AND year = 2025);

-- 2. Insérer uniquement les permanences réelles (P) avec UUIDs générés

-- BINET, MAGALI - Permanences techniques
INSERT INTO permanences (name, type, month, year, days, created_at) VALUES
('BINET, MAGALI', 'technique', 'juillet', 2025,
 '{"13": {"time": "09:00"}}', NOW());

-- DRABLA, MALEKA - Permanences techniques
INSERT INTO permanences (name, type, month, year, days, created_at) VALUES
('DRABLA, MALEKA', 'technique', 'juillet', 2025,
 '{"5": {"time": "09:00"}, "13": {"time": "09:00"}}', NOW());

-- GALLOIS, FATIMA - Permanences techniques
INSERT INTO permanences (name, type, month, year, days, created_at) VALUES
('GALLOIS, FATIMA', 'technique', 'août', 2025,
 '{"11": {"time": "09:00"}}', NOW());

-- GUITTON, STEPHANIE - Permanences techniques
INSERT INTO permanences (name, type, month, year, days, created_at) VALUES
('GUITTON, STEPHANIE', 'technique', 'juin', 2025,
 '{"18": {"time": "09:00"}}', NOW()),
('GUITTON, STEPHANIE', 'technique', 'juillet', 2025,
 '{"5": {"time": "09:00"}, "13": {"time": "09:00"}}', NOW());

-- LETELLIER, VIRGINIE - Permanences techniques
INSERT INTO permanences (name, type, month, year, days, created_at) VALUES
('LETELLIER, VIRGINIE', 'technique', 'juillet', 2025,
 '{"9": {"time": "09:00"}}', NOW());

-- MALSAN, Sigrid - Permanences techniques
INSERT INTO permanences (name, type, month, year, days, created_at) VALUES
('MALSAN, Sigrid', 'technique', 'juillet', 2025,
 '{"3": {"time": "09:00"}}', NOW()),
('MALSAN, Sigrid', 'technique', 'août', 2025,
 '{"3": {"time": "09:00"}}', NOW());

-- OUTIAMA, PATRICIA - Permanences techniques
INSERT INTO permanences (name, type, month, year, days, created_at) VALUES
('OUTIAMA, PATRICIA', 'technique', 'juillet', 2025,
 '{"5": {"time": "09:00"}}', NOW()),
('OUTIAMA, PATRICIA', 'technique', 'août', 2025,
 '{"3": {"time": "09:00"}}', NOW());

-- 3. Vérifier les permanences chargées
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
ORDER BY month, name;

-- 4. Compter les permanences par mois
SELECT
  month,
  year,
  COUNT(*) as nb_permanences,
  STRING_AGG(name, ', ') as personnes
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
