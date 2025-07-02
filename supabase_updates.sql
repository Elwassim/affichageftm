-- ================================================
-- MISE À JOUR SUPABASE - Ajout champ date aux réunions
-- ================================================
-- Exécutez ce script pour ajouter le champ date aux réunions existantes

-- ================================================
-- 1. AJOUTER COLONNE DATE À LA TABLE MEETINGS
-- ================================================
ALTER TABLE meetings 
ADD COLUMN IF NOT EXISTS date DATE NOT NULL DEFAULT CURRENT_DATE;

-- ================================================
-- 2. SUPPRIMER LES ANCIENNES DONNÉES DE TEST
-- ================================================
DELETE FROM meetings;

-- ================================================
-- 3. INSÉRER LES NOUVELLES RÉUNIONS AVEC DATES
-- ================================================
-- Calculer les dates de la semaine courante (Lundi à Dimanche)
WITH current_week AS (
  SELECT 
    DATE_TRUNC('week', CURRENT_DATE)::DATE + INTERVAL '0 days' AS monday,
    DATE_TRUNC('week', CURRENT_DATE)::DATE + INTERVAL '1 day' AS tuesday,
    DATE_TRUNC('week', CURRENT_DATE)::DATE + INTERVAL '2 days' AS wednesday,
    DATE_TRUNC('week', CURRENT_DATE)::DATE + INTERVAL '3 days' AS thursday,
    DATE_TRUNC('week', CURRENT_DATE)::DATE + INTERVAL '4 days' AS friday,
    DATE_TRUNC('week', CURRENT_DATE)::DATE + INTERVAL '5 days' AS saturday,
    DATE_TRUNC('week', CURRENT_DATE)::DATE + INTERVAL '6 days' AS sunday
)
INSERT INTO meetings (title, time, room, category, date) 
SELECT title, time, room, category, date FROM (
  SELECT * FROM current_week,
  (VALUES
    -- LUNDI
    ('Assemblée Générale Ordinaire', '14:00', 'Salle des Congrès', 'Assemblée Générale', (SELECT monday FROM current_week)),
    ('Commission Exécutive', '09:00', 'Bureau Confédéral', 'Commission', (SELECT monday FROM current_week)),
    
    -- MARDI
    ('Négociation Salariale Métallurgie', '09:30', 'Salle de Négociation', 'Négociation', (SELECT tuesday FROM current_week)),
    ('Formation délégués nouveaux adhérents', '14:00', 'Salle de Formation A', 'Formation', (SELECT tuesday FROM current_week)),
    
    -- MERCREDI
    ('Comité d''Entreprise Renault', '14:00', 'Siège Renault', 'Comité', (SELECT wednesday FROM current_week)),
    ('Commission Santé-Sécurité', '10:00', 'Salle Médicale', 'Commission', (SELECT wednesday FROM current_week)),
    
    -- JEUDI
    ('Formation Droit Syndical', '14:00', 'Salle de Formation B', 'Formation', (SELECT thursday FROM current_week)),
    ('Délégués du Personnel PSA', '16:00', 'Usine PSA', 'Délégués', (SELECT thursday FROM current_week)),
    ('Commission Retraites', '08:30', 'Bureau Syndical', 'Commission', (SELECT thursday FROM current_week)),
    
    -- VENDREDI
    ('Assemblée Générale Extraordinaire', '09:00', 'Salle des Congrès', 'Assemblée Générale', (SELECT friday FROM current_week)),
    ('Formation Sécurité au Travail', '14:30', 'Atelier Formation', 'Formation', (SELECT friday FROM current_week)),
    ('Négociation Temps de Travail', '16:00', 'Salle de Négociation', 'Négociation', (SELECT friday FROM current_week))
  ) AS meetings_data(title, time, room, category, date)
) subquery;

-- ================================================
-- 4. AJOUTER INDEX SUR LE CHAMP DATE
-- ================================================
CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(date);
CREATE INDEX IF NOT EXISTS idx_meetings_date_category ON meetings(date, category);

-- ================================================
-- 5. VÉRIFICATION
-- ================================================
-- Afficher les réunions de la semaine courante
SELECT 
  date,
  title,
  time,
  room,
  category,
  EXTRACT(DOW FROM date) as day_of_week
FROM meetings 
WHERE date >= DATE_TRUNC('week', CURRENT_DATE)::DATE
  AND date <= DATE_TRUNC('week', CURRENT_DATE)::DATE + INTERVAL '6 days'
ORDER BY date, time;

-- Compter les réunions par jour
SELECT 
  date,
  TO_CHAR(date, 'Day') as jour_semaine,
  COUNT(*) as nombre_reunions
FROM meetings 
WHERE date >= DATE_TRUNC('week', CURRENT_DATE)::DATE
  AND date <= DATE_TRUNC('week', CURRENT_DATE)::DATE + INTERVAL '6 days'
GROUP BY date, TO_CHAR(date, 'Day')
ORDER BY date;

-- ================================================
-- FINALISATION
-- ================================================
SELECT 'Mise à jour terminée! Champ date ajouté aux réunions.' as status;
