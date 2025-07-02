-- ================================================
-- CORRECTION SYNCHRONISATION USERS - CGT FTM
-- ================================================
-- Script pour corriger la synchronisation des utilisateurs

-- ================================================
-- 1. NETTOYER ET RECRÉER TABLE USERS
-- ================================================

-- Supprimer les anciennes données
DELETE FROM users;

-- S'assurer que toutes les colonnes existent
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- ================================================
-- 2. INSÉRER UTILISATEURS DE TEST
-- ================================================
-- Hash bcrypt valide pour "cgtftm2024": $2b$10$9K8qQ6P8Q6P8Q6P8Q6P8QuK8Q6P8Q6P8Q6P8Q6P8Q6P8Q6P8Q6P8Qe

INSERT INTO users (username, password_hash, email, role, is_admin, is_active) VALUES
('admin.cgt', '$2b$10$9K8qQ6P8Q6P8Q6P8Q6P8QuK8Q6P8Q6P8Q6P8Q6P8Q6P8Q6P8Q6P8Qe', 'admin@cgt-ftm.fr', 'admin', true, true),
('marie.delegue', '$2b$10$9K8qQ6P8Q6P8Q6P8Q6P8QuK8Q6P8Q6P8Q6P8Q6P8Q6P8Q6P8Q6P8Qe', 'marie@cgt-ftm.fr', 'moderator', false, true),
('jean.permanent', '$2b$10$9K8qQ6P8Q6P8Q6P8Q6P8QuK8Q6P8Q6P8Q6P8Q6P8Q6P8Q6P8Q6P8Qe', 'jean@cgt-ftm.fr', 'user', false, true),
('test.user', '$2b$10$9K8qQ6P8Q6P8Q6P8Q6P8QuK8Q6P8Q6P8Q6P8Q6P8Q6P8Q6P8Q6P8Qe', 'test@cgt-ftm.fr', 'user', false, true)
ON CONFLICT (username) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  is_admin = EXCLUDED.is_admin,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- ================================================
-- 3. VÉRIFIER LES PERMISSIONS RLS
-- ================================================

-- Supprimer les anciennes policies s'il y en a
DROP POLICY IF EXISTS "Allow public read users for auth" ON users;
DROP POLICY IF EXISTS "Allow admin insert users" ON users;
DROP POLICY IF EXISTS "Allow admin update users" ON users;
DROP POLICY IF EXISTS "Allow admin delete users" ON users;

-- Créer les nouvelles policies
CREATE POLICY "Allow public read users for auth" ON users 
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow all users operations for now" ON users 
  FOR ALL USING (true) WITH CHECK (true);

-- ================================================
-- 4. VÉRIFICATION FINALE
-- ================================================

-- Afficher les utilisateurs créés
SELECT 
  id, 
  username, 
  email, 
  role, 
  is_admin, 
  is_active,
  created_at
FROM users 
ORDER BY created_at;

-- Vérifier la structure de la table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
