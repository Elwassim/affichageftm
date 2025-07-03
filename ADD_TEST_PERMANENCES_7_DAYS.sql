-- ================================================
-- AJOUTER DES PERMANENCES DE TEST - 7 PROCHAINS JOURS
-- ================================================
-- Script pour ajouter des permanences pour tester l'affichage

-- Calculer le mois et l'année actuels
DO $$
DECLARE
    current_month VARCHAR;
    current_year INTEGER;
    next_month VARCHAR;
    next_year INTEGER;
    current_day INTEGER;
    months VARCHAR[] := ARRAY['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 
                              'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
BEGIN
    -- Obtenir le mois et l'année actuels
    current_month := months[EXTRACT(MONTH FROM CURRENT_DATE)];
    current_year := EXTRACT(YEAR FROM CURRENT_DATE);
    current_day := EXTRACT(DAY FROM CURRENT_DATE);
    
    -- Calculer le mois suivant
    IF EXTRACT(MONTH FROM CURRENT_DATE) = 12 THEN
        next_month := 'janvier';
        next_year := current_year + 1;
    ELSE
        next_month := months[EXTRACT(MONTH FROM CURRENT_DATE) + 1];
        next_year := current_year;
    END IF;

    -- Supprimer les anciennes permanences de test
    DELETE FROM permanences WHERE name LIKE 'TEST%' OR description LIKE '%test%';

    -- Insérer des permanences pour les 7 prochains jours du mois actuel
    INSERT INTO permanences (name, type, category, month, year, days, description) VALUES
    ('MARTIN, Jean', 'technique', 'P', current_month, current_year, 
     jsonb_build_object(
        (current_day)::text, 'P',
        (current_day + 1)::text, 'P',
        (current_day + 2)::text, 'RTT'
     ), 
     'Permanences test - semaine courante'),
     
    ('DUBOIS, Marie', 'technique', 'CP', current_month, current_year,
     jsonb_build_object(
        (current_day + 1)::text, 'CP',
        (current_day + 3)::text, 'CP',
        (current_day + 4)::text, 'CP'
     ),
     'Congés payés test'),
     
    ('GARCIA, Pedro', 'technique', 'MAL', current_month, current_year,
     jsonb_build_object(
        (current_day + 2)::text, 'MAL',
        (current_day + 5)::text, 'MAL'
     ),
     'Arrêt maladie test'),
     
    ('SMITH, Anna', 'technique', 'RTT', current_month, current_year,
     jsonb_build_object(
        (current_day + 4)::text, 'RTT',
        (current_day + 6)::text, 'RTT'
     ),
     'RTT test'),
     
    ('LAURENT, Paul', 'technique', 'FER', current_month, current_year,
     jsonb_build_object(
        (current_day + 6)::text, 'FER'
     ),
     'Jour férié test');

    -- Si on est en fin de mois, ajouter quelques permanences pour le mois suivant
    IF current_day > 25 THEN
        INSERT INTO permanences (name, type, category, month, year, days, description) VALUES
        ('BERNARD, Sophie', 'technique', 'P', next_month, next_year,
         jsonb_build_object(
            '1', 'P',
            '2', 'P',
            '3', 'RTT'
         ),
         'Permanences test - mois suivant');
    END IF;

    RAISE NOTICE 'Permanences de test ajoutées pour le mois de % %', current_month, current_year;
    
END $$;

-- Vérifier les permanences ajoutées
SELECT 
    name,
    category,
    month,
    year,
    days,
    description
FROM permanences 
WHERE description LIKE '%test%'
ORDER BY year, month, name;

-- Compter le total
SELECT COUNT(*) as total_permanences_test FROM permanences WHERE description LIKE '%test%';
