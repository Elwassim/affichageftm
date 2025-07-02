-- ================================================
-- DIAGNOSTIC ET CORRECTION PERMISSIONS RLS - TABLE USERS
-- ================================================

-- 1. Vérifier l'état de RLS sur la table users
SELECT 
  schemaname,
  tablename,
  tableowner,
  rowsecurity as "RLS activé"
FROM pg_tables 
WHERE tablename = 'users';

-- 2. Voir toutes les policies existantes sur users
SELECT 
  policyname as "Nom Policy",
  permissive as "Type",
  roles as "Rôles",
  cmd as "Commande",
  qual as "Condition WHERE",
  with_check as "Condition WITH CHECK"
FROM pg_policies 
WHERE tablename = 'users';

-- 3. Compter les utilisateurs dans la table
SELECT COUNT(*) as "Total utilisateurs" FROM users;

-- 4. Voir un échantillon des utilisateurs
SELECT 
  id,
  username,
  email,
  role,
  is_admin,
  is_active
FROM users 
LIMIT 5;

-- 5. SOLUTION: Supprimer temporairement toutes les policies restrictives
-- et créer une policy permissive pour débugger

-- Supprimer les anciennes policies
DROP POLICY IF EXISTS "Allow public read users for auth" ON users;
DROP POLICY IF EXISTS "Allow admin insert users" ON users;
DROP POLICY IF EXISTS "Allow admin update users" ON users;
DROP POLICY IF EXISTS "Allow admin delete users" ON users;
DROP POLICY IF EXISTS "Allow all users operations for now" ON users;
DROP POLICY IF EXISTS "temp_allow_all" ON users;

-- Créer une policy temporaire très permissive pour débugger
CREATE POLICY "debug_allow_all_users" ON users 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- 6. Tester la requête après correction
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

-- 7. Vérifier que la nouvelle policy est active
SELECT 
  policyname,
  permissive,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'users';
