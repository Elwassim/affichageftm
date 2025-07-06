-- Script pour recréer complètement la table meetings dans Supabase
-- Exécuter ce script dans l'éditeur SQL de Supabase

-- 1. Supprimer la table existante si elle existe
DROP TABLE IF EXISTS meetings CASCADE;

-- 2. Créer la nouvelle table meetings avec la structure correcte
CREATE TABLE meetings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    time TEXT NOT NULL,
    room TEXT NOT NULL,
    category TEXT NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Créer un index pour améliorer les performances des requêtes
CREATE INDEX idx_meetings_date ON meetings(date);
CREATE INDEX idx_meetings_created_at ON meetings(created_at);

-- 4. Activer RLS (Row Level Security)
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- 5. Créer une politique pour permettre toutes les opérations (lecture, écriture, modification, suppression)
CREATE POLICY "Allow all operations on meetings" ON meetings
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 6. Insérer quelques données de test
INSERT INTO meetings (title, time, room, category, date) VALUES
('Assemblée Générale', '14:00', 'Salle des Congrès', 'Assemblée Générale', CURRENT_DATE + INTERVAL '1 day'),
('Commission Exécutive', '09:00', 'Bureau Confédéral', 'Commission', CURRENT_DATE + INTERVAL '2 days'),
('Négociation Salariale', '10:30', 'Salle de Négociation', 'Négociation', CURRENT_DATE + INTERVAL '3 days'),
('Formation Délégués', '14:00', 'Salle Formation A', 'Formation', CURRENT_DATE + INTERVAL '4 days'),
('Comité d''Entreprise', '16:00', 'Siège Social', 'Comité', CURRENT_DATE + INTERVAL '5 days');

-- 7. Vérifier que tout fonctionne
SELECT * FROM meetings ORDER BY date;

-- 8. Créer une fonction pour tester les opérations CRUD
CREATE OR REPLACE FUNCTION test_meetings_crud() 
RETURNS TABLE(operation TEXT, success BOOLEAN, message TEXT) 
LANGUAGE plpgsql
AS $$
DECLARE
    test_id UUID;
BEGIN
    -- Test INSERT
    BEGIN
        INSERT INTO meetings (title, time, room, category, date) 
        VALUES ('Test Meeting', '15:00', 'Test Room', 'Test', CURRENT_DATE)
        RETURNING id INTO test_id;
        
        RETURN QUERY SELECT 'INSERT'::TEXT, true, 'Insertion réussie'::TEXT;
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY SELECT 'INSERT'::TEXT, false, SQLERRM::TEXT;
    END;
    
    -- Test SELECT
    BEGIN
        PERFORM * FROM meetings WHERE id = test_id;
        RETURN QUERY SELECT 'SELECT'::TEXT, true, 'Lecture réussie'::TEXT;
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY SELECT 'SELECT'::TEXT, false, SQLERRM::TEXT;
    END;
    
    -- Test UPDATE
    BEGIN
        UPDATE meetings SET title = 'Test Meeting Updated' WHERE id = test_id;
        RETURN QUERY SELECT 'UPDATE'::TEXT, true, 'Mise à jour réussie'::TEXT;
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY SELECT 'UPDATE'::TEXT, false, SQLERRM::TEXT;
    END;
    
    -- Test DELETE
    BEGIN
        DELETE FROM meetings WHERE id = test_id;
        RETURN QUERY SELECT 'DELETE'::TEXT, true, 'Suppression réussie'::TEXT;
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY SELECT 'DELETE'::TEXT, false, SQLERRM::TEXT;
    END;
END;
$$;

-- 9. Exécuter le test
SELECT * FROM test_meetings_crud();

-- 10. Nettoyer la fonction de test
DROP FUNCTION test_meetings_crud();
