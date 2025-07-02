-- ================================================
-- CRÉER UTILISATEURS DE TEST - CGT FTM
-- ================================================

-- 1. Vérifier que la table users existe
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- 2. Compter les utilisateurs existants
SELECT COUNT(*) as "Nombre d'utilisateurs" FROM users;

-- 3. Ajouter des utilisateurs de test
INSERT INTO users (username, password_hash, email, role, is_admin, is_active) VALUES
('admin.cgt', 'temp_hash_admin', 'admin@cgt-ftm.fr', 'admin', true, true),
('marie.dupont', 'temp_hash_marie', 'marie@cgt-ftm.fr', 'moderator', false, true),
('jean.martin', 'temp_hash_jean', 'jean@cgt-ftm.fr', 'user', false, true),
('test.user', 'temp_hash_test', 'test@cgt-ftm.fr', 'user', false, true)
ON CONFLICT (username) DO UPDATE SET
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  is_admin = EXCLUDED.is_admin,
  updated_at = NOW();

-- 4. Vérifier que les utilisateurs sont créés
SELECT 
  id,
  username,
  email,
  role,
  is_admin,
  is_active,
  created_at
FROM users
ORDER BY created_at DESC;

-- 5. Vérifier les permissions RLS
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users';

-- Si RLS est trop restrictif, temporairement permettre tout
-- (à exécuter seulement si nécessaire)
-- DROP POLICY IF EXISTS "Allow public read users for auth" ON users;
-- CREATE POLICY "temp_allow_all" ON users FOR ALL USING (true) WITH CHECK (true);
