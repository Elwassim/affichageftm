-- Script pour recréer complètement la table users dans Supabase
-- Exécuter ce script dans l'éditeur SQL de Supabase

-- 1. Supprimer la table existante si elle existe
DROP TABLE IF EXISTS users CASCADE;

-- 2. Créer la nouvelle table users avec la structure correcte
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    email TEXT,
    role TEXT NOT NULL DEFAULT 'user',
    is_admin BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Créer des index pour améliorer les performances
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_admin ON users(is_admin);
CREATE INDEX idx_users_is_active ON users(is_active);

-- 4. Activer RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 5. Créer une politique pour permettre toutes les opérations
CREATE POLICY "Allow all operations on users" ON users
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 6. Insérer des utilisateurs de test
INSERT INTO users (username, password_hash, email, role, is_admin, is_active) VALUES
('admin.test', '$2b$10$hash_admin_test', 'admin@cgt-ftm.fr', 'admin', true, true),
('marie.delegue', '$2b$10$hash_marie_delegue', 'marie@cgt-ftm.fr', 'moderator', false, true),
('jean.permanent', '$2b$10$hash_jean_permanent', 'jean@cgt-ftm.fr', 'user', false, true),
('sophie.responsable', '$2b$10$hash_sophie_responsable', 'sophie@cgt-ftm.fr', 'admin', true, true),
('pierre.membre', '$2b$10$hash_pierre_membre', 'pierre@cgt-ftm.fr', 'user', false, true);

-- 7. Créer une fonction RPC pour contourner RLS si nécessaire
CREATE OR REPLACE FUNCTION delete_user_by_id(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM users WHERE id = user_id;
    RETURN FOUND;
END;
$$;

-- 8. Créer une fonction pour tester les opérations CRUD
CREATE OR REPLACE FUNCTION test_users_crud() 
RETURNS TABLE(operation TEXT, success BOOLEAN, message TEXT) 
LANGUAGE plpgsql
AS $$
DECLARE
    test_id UUID;
BEGIN
    -- Test INSERT
    BEGIN
        INSERT INTO users (username, email, role, is_admin, is_active) 
        VALUES ('test.user', 'test@cgt-ftm.fr', 'user', false, true)
        RETURNING id INTO test_id;
        
        RETURN QUERY SELECT 'INSERT'::TEXT, true, 'Insertion réussie'::TEXT;
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY SELECT 'INSERT'::TEXT, false, SQLERRM::TEXT;
    END;
    
    -- Test SELECT
    BEGIN
        PERFORM * FROM users WHERE id = test_id;
        RETURN QUERY SELECT 'SELECT'::TEXT, true, 'Lecture réussie'::TEXT;
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY SELECT 'SELECT'::TEXT, false, SQLERRM::TEXT;
    END;
    
    -- Test UPDATE
    BEGIN
        UPDATE users SET email = 'test.updated@cgt-ftm.fr' WHERE id = test_id;
        RETURN QUERY SELECT 'UPDATE'::TEXT, true, 'Mise à jour réussie'::TEXT;
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY SELECT 'UPDATE'::TEXT, false, SQLERRM::TEXT;
    END;
    
    -- Test DELETE
    BEGIN
        DELETE FROM users WHERE id = test_id;
        RETURN QUERY SELECT 'DELETE'::TEXT, true, 'Suppression réussie'::TEXT;
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY SELECT 'DELETE'::TEXT, false, SQLERRM::TEXT;
    END;
END;
$$;

-- 9. Exécuter le test
SELECT * FROM test_users_crud();

-- 10. Vérifier la structure finale
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 11. Vérifier les données insérées
SELECT id, username, email, role, is_admin, is_active, created_at FROM users;

-- 12. Nettoyer la fonction de test
DROP FUNCTION test_users_crud();
