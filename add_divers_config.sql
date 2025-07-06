-- Script SQL pour ajouter la configuration du widget Divers
-- À exécuter dans l'éditeur SQL de Supabase

-- Insérer la configuration par défaut pour le widget Divers
INSERT INTO dashboard_config (key, value, created_at, updated_at)
VALUES (
  'diversContent',
  '{"title":"Informations diverses","subtitle":"CGT FTM","content":"Aucune information particulière pour le moment.","isActive":false}',
  NOW(),
  NOW()
)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = NOW();

-- Vérifier que l'insertion a bien fonctionné
SELECT * FROM dashboard_config WHERE key = 'diversContent';
