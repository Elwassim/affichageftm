-- Script pour corriger les permissions RLS des utilisateurs (suppression)

-- 1. Désactiver temporairement RLS pour users
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. Supprimer toutes les politiques existantes sur users
DROP POLICY IF EXISTS "Users are viewable by authenticated users" ON users;
DROP POLICY IF EXISTS "Users can be inserted by admins" ON users;
DROP POLICY IF EXISTS "Users can be updated by admins" ON users;
DROP POLICY IF EXISTS "Users can be deleted by admins" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;
DROP POLICY IF EXISTS "Enable update for users based on email" ON users;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON users;

-- 3. Créer des politiques simples qui permettent tout
CREATE POLICY "Allow all operations on users" ON users
FOR ALL
USING (true)
WITH CHECK (true);

-- 4. Réactiver RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 5. Vérifier que la table users est accessible
SELECT COUNT(*) as total_users FROM users;

-- 6. Test de suppression (remplacez 'test-id' par un vrai ID si vous voulez tester)
-- DELETE FROM users WHERE id = 'test-id';
