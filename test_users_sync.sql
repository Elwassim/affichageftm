-- ================================================
-- TEST SIMPLE SYNCHRONISATION USERS
-- ================================================

-- 1. Créer quelques utilisateurs de test directement
INSERT INTO users (username, password_hash, email, role, is_admin, is_active) VALUES
('test1', 'test_hash_1', 'test1@cgt.fr', 'user', false, true),
('test2', 'test_hash_2', 'test2@cgt.fr', 'moderator', false, true),
('admin_test', 'test_hash_admin', 'admin@cgt.fr', 'admin', true, true)
ON CONFLICT (username) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  is_admin = EXCLUDED.is_admin,
  updated_at = NOW();

-- 2. Vérifier que les utilisateurs sont créés
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

-- 3. Vérifier les permissions de la table
SELECT 
  schemaname,
  tablename,
  tableowner,
  hasindexes,
  hasrules,
  hastriggers
FROM pg_tables 
WHERE tablename = 'users';

-- 4. Vérifier les policies RLS
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'users';
