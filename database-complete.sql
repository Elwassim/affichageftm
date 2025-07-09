-- ====================================================================
-- CGT FTM Dashboard - Base de données complète pour Supabase
-- ====================================================================
-- Instructions : Exécutez ce script dans l'éditeur SQL de Supabase
-- ====================================================================

-- ============ SUPPRESSION DES TABLES EXISTANTES ============
DROP TABLE IF EXISTS public.meetings CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.tributes CASCADE;
DROP TABLE IF EXISTS public.permanences CASCADE;
DROP TABLE IF EXISTS public.config CASCADE;

-- ============ CRÉATION DES TABLES ============

-- Table des utilisateurs
CREATE TABLE public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT,
    email VARCHAR(100),
    role VARCHAR(20) DEFAULT 'editor',
    is_admin BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des réunions
CREATE TABLE public.meetings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    room VARCHAR(100),
    category VARCHAR(50) DEFAULT 'Assemblée Générale',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des hommages
CREATE TABLE public.tributes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des permanences
CREATE TABLE public.permanences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location VARCHAR(200),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table de configuration
CREATE TABLE public.config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    video_url TEXT DEFAULT '',
    weather_city VARCHAR(100) DEFAULT 'Paris',
    alert_text TEXT DEFAULT '🚨 APPEL CGT FTM - Rejoignez-nous pour défendre vos droits ! 🚨',
    divers_title VARCHAR(200) DEFAULT 'Informations Diverses',
    divers_subtitle VARCHAR(200) DEFAULT 'Actualités et communications importantes',
    divers_content TEXT DEFAULT 'Restez informés des dernières actualités syndicales et des communications importantes de la CGT FTM.',
    divers_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============ INDICES POUR LES PERFORMANCES ============
CREATE INDEX idx_meetings_date ON public.meetings(date);
CREATE INDEX idx_meetings_category ON public.meetings(category);
CREATE INDEX idx_users_username ON public.users(username);
CREATE INDEX idx_users_active ON public.users(is_active);
CREATE INDEX idx_permanences_day ON public.permanences(day_of_week);
CREATE INDEX idx_permanences_active ON public.permanences(is_active);
CREATE INDEX idx_tributes_created ON public.tributes(created_at);

-- ============ FONCTIONS DE MISE À JOUR ============
-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON public.meetings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tributes_updated_at BEFORE UPDATE ON public.tributes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_permanences_updated_at BEFORE UPDATE ON public.permanences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_config_updated_at BEFORE UPDATE ON public.config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============ DONNÉES PAR DÉFAUT ============

-- Utilisateurs par défaut
INSERT INTO public.users (username, email, role, is_admin, is_active) VALUES
('admin.cgt', 'admin@cgt-ftm.fr', 'admin', true, true),
('marie.delegue', 'marie@cgt-ftm.fr', 'editor', false, true),
('jean.secretaire', 'jean@cgt-ftm.fr', 'editor', false, true);

-- Configuration par défaut
INSERT INTO public.config (video_url, weather_city, alert_text, divers_title, divers_subtitle, divers_content, divers_active) VALUES
('https://www.youtube.com/watch?v=YQHsXMglC9A', 'Paris', '🚨 APPEL CGT FTM - Rejoignez-nous pour défendre vos droits ! 🚨', 'Informations Diverses', 'Actualités et communications importantes', 'Restez informés des dernières actualités syndicales et des communications importantes de la CGT FTM.', true);

-- Réunions d'exemple
INSERT INTO public.meetings (title, date, time, room, category) VALUES
('Assemblée Générale Mensuelle', CURRENT_DATE + INTERVAL '7 days', '14:00', 'Salle de conférence A', 'Assemblée Générale'),
('Réunion Délégués du Personnel', CURRENT_DATE + INTERVAL '3 days', '10:00', 'Bureau syndical', 'Délégués'),
('Formation Sécurité au Travail', CURRENT_DATE + INTERVAL '10 days', '09:00', 'Salle de formation', 'Formation');

-- Permanences d'exemple
INSERT INTO public.permanences (title, day_of_week, start_time, end_time, location, description) VALUES
('Permanence Délégués', 1, '14:00', '17:00', 'Bureau CGT - Bâtiment A', 'Accueil et conseil aux salariés'),
('Permanence Juridique', 3, '09:00', '12:00', 'Bureau CGT - Bâtiment A', 'Consultations juridiques avec avocat'),
('Permanence Administrative', 5, '13:00', '16:00', 'Bureau CGT - Bâtiment A', 'Aide aux démarches administratives');

-- Hommages d'exemple
INSERT INTO public.tributes (name, message) VALUES
('Solidarité Ouvrière', 'En mémoire de tous nos camarades qui ont lutté pour nos droits sociaux et notre dignité au travail.'),
('Lutte Syndicale', 'Hommage aux militants qui continuent de défendre les valeurs de justice sociale et d''égalité dans l''entreprise.');

-- ============ SÉCURITÉ RLS (Row Level Security) ============
-- Activer RLS sur toutes les tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permanences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.config ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour permettre l'accès aux utilisateurs authentifiés
CREATE POLICY "Allow all for authenticated users" ON public.users FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON public.meetings FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON public.tributes FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON public.permanences FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON public.config FOR ALL USING (true);

-- ============ VUES UTILES ============
-- Vue des prochaines réunions
CREATE OR REPLACE VIEW public.upcoming_meetings AS
SELECT
    id,
    title,
    date,
    time,
    room,
    category,
    EXTRACT(DOW FROM date) as day_of_week
FROM public.meetings
WHERE date >= CURRENT_DATE
ORDER BY date ASC, time ASC;

-- Vue des permanences actives
CREATE OR REPLACE VIEW public.active_permanences AS
SELECT
    id,
    title,
    day_of_week,
    start_time,
    end_time,
    location,
    description,
    CASE day_of_week
        WHEN 0 THEN 'Dimanche'
        WHEN 1 THEN 'Lundi'
        WHEN 2 THEN 'Mardi'
        WHEN 3 THEN 'Mercredi'
        WHEN 4 THEN 'Jeudi'
        WHEN 5 THEN 'Vendredi'
        WHEN 6 THEN 'Samedi'
    END as day_name
FROM public.permanences
WHERE is_active = true
ORDER BY day_of_week;

-- ============ COMMENTAIRES ============
COMMENT ON TABLE public.users IS 'Table des utilisateurs du système - admin et éditeurs';
COMMENT ON TABLE public.meetings IS 'Table des réunions CGT FTM';
COMMENT ON TABLE public.tributes IS 'Table des hommages et messages de solidarité';
COMMENT ON TABLE public.permanences IS 'Table des permanences syndicales';
COMMENT ON TABLE public.config IS 'Table de configuration du dashboard';

COMMENT ON COLUMN public.users.is_admin IS 'true = Administrateur (gère tout), false = Éditeur (tout sauf users)';
COMMENT ON COLUMN public.permanences.day_of_week IS '0=Dimanche, 1=Lundi, 2=Mardi, 3=Mercredi, 4=Jeudi, 5=Vendredi, 6=Samedi';

-- ====================================================================
-- FIN DU SCRIPT - Base de données CGT FTM configurée avec succès !
-- ====================================================================
