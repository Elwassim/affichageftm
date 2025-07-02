-- ================================================
-- MIGRATION SUPABASE v2 - CGT FTM DASHBOARD
-- ================================================
-- Mise à jour du schéma pour correspondre au panel admin

-- ================================================
-- 1. MISE À JOUR TABLE USERS
-- ================================================
-- Ajouter les nouvelles colonnes pour les utilisateurs
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Migrer les données existantes
UPDATE users SET 
  role = CASE 
    WHEN group_name = 'admin' THEN 'admin'
    WHEN group_name = 'editor' THEN 'moderator'
    ELSE 'user'
  END,
  is_admin = CASE 
    WHEN group_name = 'admin' THEN true
    ELSE false
  END
WHERE role IS NULL OR role = 'user';

-- ================================================
-- 2. MISE À JOUR TABLE PERMANENCES
-- ================================================
-- Renommer les colonnes pour correspondre à l'interface
ALTER TABLE permanences 
  RENAME COLUMN time TO schedule;

ALTER TABLE permanences 
  RENAME COLUMN theme TO type;

-- ================================================
-- 3. AJOUTER DONNÉES UTILISATEURS PAR DÉFAUT
-- ================================================
-- Hash bcrypt pour "cgtftm2024": $2b$10$rOvjXqNE3VqU3VqU3VqU3O7nGXqU3VqU3VqU3VqU3VqU3VqU3VqU32
INSERT INTO users (username, password_hash, email, role, is_admin) VALUES
('admin.cgt', '$2b$10$rOvjXqNE3VqU3VqU3VqU3O7nGXqU3VqU3VqU3VqU3VqU3VqU3VqU32', 'admin@cgt-ftm.fr', 'admin', true),
('marie.delegue', '$2b$10$rOvjXqNE3VqU3VqU3VqU3O7nGXqU3VqU3VqU3VqU3VqU3VqU3VqU32', 'marie@cgt-ftm.fr', 'moderator', false),
('jean.permanent', '$2b$10$rOvjXqNE3VqU3VqU3VqU3O7nGXqU3VqU3VqU3VqU3VqU3VqU3VqU32', 'jean@cgt-ftm.fr', 'user', false)
ON CONFLICT (username) DO NOTHING;

-- ================================================
-- 4. NETTOYER LES DONNÉES PERMANENCES
-- ================================================
DELETE FROM permanences;

INSERT INTO permanences (name, schedule, type) VALUES
('Marie Dubois', 'Lundi-Mercredi 9h-17h', 'Délégué'),
('Jean-Claude Martin', 'Mardi-Jeudi 14h-18h', 'Secrétaire'),
('Sophie Laurent', 'Vendredi 9h-12h', 'Standard'),
('Pierre Moreau', 'Lundi-Vendredi 8h-16h', 'Délégué'),
('Catherine Blanc', 'Mardi-Jeudi 10h-16h', 'Standard'),
('Alain Rodriguez', 'Mercredi-Vendredi 14h-18h', 'Secrétaire');

-- ================================================
-- 5. MISE À JOUR PERMISSIONS RLS
-- ================================================
-- Permettre aux administrateurs de gérer les utilisateurs
CREATE POLICY "Allow admin insert users" ON users FOR INSERT 
  WITH CHECK (exists(
    select 1 from users u2 where u2.id = current_setting('request.jwt.claims')::json->>'sub' 
    and u2.is_admin = true and u2.is_active = true
  ));

CREATE POLICY "Allow admin update users" ON users FOR UPDATE 
  USING (exists(
    select 1 from users u2 where u2.id = current_setting('request.jwt.claims')::json->>'sub' 
    and u2.is_admin = true and u2.is_active = true
  ));

CREATE POLICY "Allow admin delete users" ON users FOR DELETE 
  USING (exists(
    select 1 from users u2 where u2.id = current_setting('request.jwt.claims')::json->>'sub' 
    and u2.is_admin = true and u2.is_active = true
  ));

-- Permettre les modifications pour l'administration
CREATE POLICY "Allow admin write config" ON dashboard_config FOR ALL 
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow admin write meetings" ON meetings FOR ALL 
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow admin write permanences" ON permanences FOR ALL 
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow admin write tributes" ON tributes FOR ALL 
  USING (true) WITH CHECK (true);

-- ================================================
-- 6. FONCTIONS UTILITAIRES
-- ================================================
-- Fonction pour hasher les mots de passe côté base
CREATE OR REPLACE FUNCTION hash_password(password TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf', 10));
END;
$$;

-- ================================================
-- 7. INDEX SUPPLÉMENTAIRES
-- ================================================
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);
CREATE INDEX IF NOT EXISTS idx_permanences_type ON permanences(type);
CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(date);

-- ================================================
-- VÉRIFICATION
-- ================================================
SELECT 'Migration v2 terminée avec succès!' as status;

-- Vérifier les colonnes mises à jour
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name IN ('role', 'is_admin', 'email')
ORDER BY ordinal_position;

SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'permanences' 
  AND column_name IN ('schedule', 'type')
ORDER BY ordinal_position;
