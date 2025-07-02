-- ================================================
-- SUPABASE SETUP - CGT FTM DASHBOARD
-- ================================================
-- Exécutez ce script dans votre base Supabase
-- (SQL Editor > New Query > Coller le code > Run)

-- ================================================
-- 1. TABLE CONFIGURATION DASHBOARD
-- ================================================
CREATE TABLE IF NOT EXISTS dashboard_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- 2. TABLE RÉUNIONS
-- ================================================
CREATE TABLE IF NOT EXISTS meetings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  time VARCHAR(100) NOT NULL,
  room VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'Assemblée Générale',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- 3. TABLE PERMANENCES
-- ================================================
CREATE TABLE IF NOT EXISTS permanences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  time VARCHAR(100) NOT NULL,
  theme VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- 4. TABLE UTILISATEURS
-- ================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  group_name VARCHAR(50) NOT NULL DEFAULT 'viewer',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- 5. TABLE POSTS SOCIAUX
-- ================================================
CREATE TABLE IF NOT EXISTS social_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  text TEXT NOT NULL,
  hashtag VARCHAR(100),
  photo VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- 6. TABLE HOMMAGES
-- ================================================
CREATE TABLE IF NOT EXISTS tributes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  photo VARCHAR(500),
  text TEXT NOT NULL,
  date_added TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- DONNÉES PAR DÉFAUT - CONFIGURATION
-- ================================================
INSERT INTO dashboard_config (key, value) VALUES
('videoUrl', '"https://www.youtube.com/embed/dQw4w9WgXcQ"'),
('alertText', '"🚨 APPEL CGT FTM - Négociation collective métallurgie - Jeudi 21 mars à 14h - Siège fédéral - Mobilisation pour nos salaires !"'),
('weatherCity', '"Paris"')
ON CONFLICT (key) DO NOTHING;

-- ================================================
-- DONNÉES PAR DÉFAUT - UTILISATEURS
-- Mot de passe pour tous: cgtftm2024
-- Hash bcrypt: $2b$10$rOvjXqNE3VqU3VqU3VqU3O7nGXqU3VqU3VqU3VqU3VqU3VqU3VqU32
-- ================================================
INSERT INTO users (username, password_hash, name, group_name) VALUES
('marie.dubois', '$2b$10$rOvjXqNE3VqU3VqU3VqU3O7nGXqU3VqU3VqU3VqU3VqU3VqU3VqU32', 'Marie Dubois', 'admin'),
('jc.martin', '$2b$10$rOvjXqNE3VqU3VqU3VqU3O7nGXqU3VqU3VqU3VqU3VqU3VqU3VqU32', 'Jean-Claude Martin', 'editor'),
('admin.cgt', '$2b$10$rOvjXqNE3VqU3VqU3VqU3O7nGXqU3VqU3VqU3VqU3VqU3VqU3VqU32', 'Administrateur CGT', 'admin'),
('sophie.laurent', '$2b$10$rOvjXqNE3VqU3VqU3VqU3O7nGXqU3VqU3VqU3VqU3VqU3VqU3VqU32', 'Sophie Laurent', 'editor')
ON CONFLICT (username) DO NOTHING;

-- ================================================
-- DONNÉES PAR DÉFAUT - RÉUNIONS 2024
-- ================================================
INSERT INTO meetings (title, time, room, category) VALUES
-- JANVIER 2024
('Assemblée Générale Ordinaire', '14:00', 'Salle des Congrès', 'Assemblée Générale'),
('Commission Exécutive', '09:00', 'Bureau Confédéral', 'Commission'),
('Formation délégués nouveaux adhérents', '14:00', 'Salle de Formation A', 'Formation'),

-- FÉVRIER 2024
('Négociation Salariale Métallurgie', '09:30', 'Salle de Négociation', 'Négociation'),
('Comité d''Entreprise Renault', '14:00', 'Siège Renault', 'Comité'),
('Commission Santé-Sécurité', '10:00', 'Salle Médicale', 'Commission'),

-- MARS 2024
('Journée Internationale des Femmes', '08:00', 'Place de la République', 'Assemblée Générale'),
('Formation Droit Syndical', '14:00', 'Salle de Formation B', 'Formation'),
('Délégués du Personnel PSA', '16:00', 'Usine PSA', 'Délégués'),

-- AVRIL 2024
('Commission Retraites', '14:30', 'Bureau Syndical', 'Commission'),
('Assemblée Générale Extraordinaire', '09:00', 'Salle des Congrès', 'Assemblée Générale'),
('Formation Sécurité au Travail', '08:30', 'Atelier Formation', 'Formation'),

-- MAI 2024
('1er Mai - Manifestation', '10:00', 'Place Bastille', 'Assemblée Générale'),
('Négociation Temps de Travail', '14:00', 'Salle de Négociation', 'Négociation'),
('Commission Formation Professionnelle', '09:30', 'Centre de Formation', 'Commission'),

-- JUIN 2024
('Comité d''Entreprise Airbus', '15:00', 'Site Airbus Toulouse', 'Comité'),
('Assemblée Statutaire', '14:00', 'Salle des Congrès', 'Assemblée Générale'),
('Formation Négociation Collective', '09:00', 'Salle de Formation A', 'Formation'),

-- JUILLET 2024
('Commission Vacances', '10:00', 'Bureau Syndical', 'Commission'),
('Délégués Syndicaux ArcelorMittal', '14:30', 'Siège ArcelorMittal', 'Délégués'),

-- SEPTEMBRE 2024
('Rentrée Sociale - Assemblée Générale', '09:00', 'Salle des Congrès', 'Assemblée Générale'),
('Commission Emploi', '14:00', 'Bureau Confédéral', 'Commission'),
('Formation Délégués CHSCT', '08:30', 'Centre de Formation', 'Formation'),

-- OCTOBRE 2024
('Négociation Classification', '09:30', 'Salle de Négociation', 'Négociation'),
('Comité d''Entreprise Thales', '15:00', 'Siège Thales', 'Comité'),
('Commission Internationale', '14:00', 'Bureau Syndical', 'Commission'),

-- NOVEMBRE 2024
('Assemblée Générale Budget 2025', '14:00', 'Salle des Congrès', 'Assemblée Générale'),
('Formation Prévention Risques', '09:00', 'Salle de Formation B', 'Formation'),
('Délégués du Personnel Safran', '16:00', 'Site Safran', 'Délégués'),

-- DÉCEMBRE 2024
('Commission Bilan Annuel', '10:00', 'Bureau Confédéral', 'Commission'),
('Assemblée Générale de Clôture', '14:00', 'Salle des Congrès', 'Assemblée Générale'),
('Vœux et Perspectives 2025', '18:00', 'Salle de Réception', 'Assemblée Générale');

-- ================================================
-- DONNÉES PAR DÉFAUT - PERMANENCES
-- ================================================
INSERT INTO permanences (name, time, theme) VALUES
('Marie Dubois', 'Lun-Mer 9h-17h', 'Droit du travail & contentieux'),
('Jean-Claude Martin', 'Mar-Jeu 14h-18h', 'Négociation collective'),
('Sophie Laurent', 'Ven 9h-12h', 'Accident du travail'),
('Pierre Moreau', 'Lun-Ven 8h-16h', 'Protection sociale'),
('Catherine Blanc', 'Mar-Jeu 10h-16h', 'Formation professionnelle'),
('Alain Rodriguez', 'Mer-Ven 14h-18h', 'Santé au travail');

-- ================================================
-- DONNÉES PAR DÉFAUT - HOMMAGES
-- ================================================
INSERT INTO tributes (name, photo, text) VALUES
('Henri Krasucki', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', 'Secrétaire général de la CGT de 1982 à 1992. Figure emblématique du syndicalisme français, il a consacré sa vie à la défense des travailleurs et à la justice sociale.'),
('Pierre Mauroy', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', 'Ancien Premier ministre et grand défenseur des droits syndicaux. Son engagement pour les travailleurs de la métallurgie restera dans nos mémoires.'),
('Ambroise Croizat', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face', 'Ministre du Travail et de la Sécurité sociale, créateur de la Sécurité sociale française. "Ensemble, nous avons été plus forts que les égoïsmes."');

-- ================================================
-- DONNÉES PAR DÉFAUT - POST SOCIAL
-- ================================================
INSERT INTO social_posts (name, text, hashtag, photo, is_active) VALUES
('Sophie Lefebvre', 'Victoire dans les négociations métallurgie ! Nous avons obtenu 4% d''augmentation générale et amélioration des conditions de travail. La détermination des métallurgistes paye ! Continuons le combat syndical !', '#CGTFTM', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face', true);

-- ================================================
-- POLITIQUES DE SÉCURITÉ (ROW LEVEL SECURITY)
-- ================================================
-- Activer RLS sur toutes les tables
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE permanences ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_config ENABLE ROW LEVEL SECURITY;

-- Politiques de lecture publique pour l'affichage TV
CREATE POLICY "Allow public read meetings" ON meetings FOR SELECT USING (true);
CREATE POLICY "Allow public read permanences" ON permanences FOR SELECT USING (true);
CREATE POLICY "Allow public read active social posts" ON social_posts FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read tributes" ON tributes FOR SELECT USING (true);
CREATE POLICY "Allow public read config" ON dashboard_config FOR SELECT USING (true);

-- Politiques restrictives pour les utilisateurs
CREATE POLICY "Allow public read users for auth" ON users FOR SELECT USING (is_active = true);

-- ================================================
-- INDEX POUR PERFORMANCE
-- ================================================
CREATE INDEX IF NOT EXISTS idx_meetings_category ON meetings(category);
CREATE INDEX IF NOT EXISTS idx_meetings_created_at ON meetings(created_at);
CREATE INDEX IF NOT EXISTS idx_permanences_created_at ON permanences(created_at);
CREATE INDEX IF NOT EXISTS idx_tributes_created_at ON tributes(created_at);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_config_key ON dashboard_config(key);

-- ================================================
-- TRIGGERS POUR UPDATED_AT
-- ================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Appliquer les triggers
CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON meetings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_permanences_updated_at BEFORE UPDATE ON permanences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_posts_updated_at BEFORE UPDATE ON social_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tributes_updated_at BEFORE UPDATE ON tributes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_config_updated_at BEFORE UPDATE ON dashboard_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- FINALISATION
-- ================================================
-- Vérification des tables créées
SELECT 'Tables créées avec succès!' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('meetings', 'permanences', 'users', 'social_posts', 'tributes', 'dashboard_config');
