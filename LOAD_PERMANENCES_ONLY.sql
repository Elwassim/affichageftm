-- Charger uniquement les PERMANENCES (P) du planning CGT FTM
-- Exclut toutes les absences (PAR, MAL, RTT, FER, CP, REC)

-- 1. Vider d'abord les permanences existantes pour les mois concernés
DELETE FROM permanences 
WHERE (month = 'juin' AND year = 2025)
   OR (month = 'juillet' AND year = 2025)
   OR (month = 'août' AND year = 2025);

-- 2. Insérer uniquement les permanences réelles (P)

-- BINET, MAGALI - Permanences techniques
INSERT INTO permanences (id, name, type, month, year, days, created_at) VALUES
('perm-binet-juil-2025', 'BINET, MAGALI', 'technique', 'juillet', 2025, 
 '{"13": {"time": "09:00"}}', NOW());

-- DRABLA, MALEKA - Permanences techniques  
INSERT INTO permanences (id, name, type, month, year, days, created_at) VALUES
('perm-drabla-juil-2025', 'DRABLA, MALEKA', 'technique', 'juillet', 2025, 
 '{"5": {"time": "09:00"}, "13": {"time": "09:00"}}', NOW());

-- GALLOIS, FATIMA - Permanences techniques
INSERT INTO permanences (id, name, type, month, year, days, created_at) VALUES
('perm-gallois-aout-2025', 'GALLOIS, FATIMA', 'technique', 'août', 2025, 
 '{"11": {"time": "09:00"}}', NOW());

-- GUITTON, STEPHANIE - Permanences techniques
INSERT INTO permanences (id, name, type, month, year, days, created_at) VALUES
('perm-guitton-juin-2025', 'GUITTON, STEPHANIE', 'technique', 'juin', 2025, 
 '{"18": {"time": "09:00"}}', NOW()),
('perm-guitton-juil-2025', 'GUITTON, STEPHANIE', 'technique', 'juillet', 2025, 
 '{"5": {"time": "09:00"}, "13": {"time": "09:00"}}', NOW());

-- LETELLIER, VIRGINIE - Permanences techniques
INSERT INTO permanences (id, name, type, month, year, days, created_at) VALUES
('perm-letellier-juil-2025', 'LETELLIER, VIRGINIE', 'technique', 'juillet', 2025, 
 '{"9": {"time": "09:00"}}', NOW());

-- MALSAN, Sigrid - Permanences techniques
INSERT INTO permanences (id, name, type, month, year, days, created_at) VALUES
('perm-malsan-juil-2025', 'MALSAN, Sigrid', 'technique', 'juillet', 2025, 
 '{"3": {"time": "09:00"}}', NOW()),
('perm-malsan-aout-2025', 'MALSAN, Sigrid', 'technique', 'août', 2025, 
 '{"3": {"time": "09:00"}}', NOW());

-- OUTIAMA, PATRICIA - Permanences techniques
INSERT INTO permanences (id, name, type, month, year, days, created_at) VALUES
('perm-outiama-juil-2025', 'OUTIAMA, PATRICIA', 'technique', 'juillet', 2025, 
 '{"5": {"time": "09:00"}}', NOW()),
('perm-outiama-aout-2025', 'OUTIAMA, PATRICIA', 'technique', 'août', 2025, 
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
