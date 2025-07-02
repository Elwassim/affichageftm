-- Ajouter des utilisateurs de test simples
INSERT INTO users (username, password_hash, email, role, is_admin, is_active) VALUES
('test.user1', 'hash123', 'test1@test.com', 'user', false, true),
('test.admin', 'hash456', 'admin@test.com', 'admin', true, true),
('test.moderator', 'hash789', 'mod@test.com', 'moderator', false, true)
ON CONFLICT (username) DO NOTHING;

-- Vérifier que les utilisateurs sont ajoutés
SELECT id, username, email, role, is_admin, is_active FROM users;
