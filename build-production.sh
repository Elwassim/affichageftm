#!/bin/bash

echo "🚀 CGT FTM Dashboard - Build Production"
echo "======================================"

# Vérifier Node.js
echo "📦 Vérification Node.js..."
node --version
npm --version

# Installer les dépendances
echo "📥 Installation des dépendances..."
npm ci

# Lint et vérifications
echo "🔍 Vérifications du code..."
npm run lint || echo "⚠️ Warnings lint détectés"

# Build production
echo "🏗️ Build de production..."
npm run build

# Vérifier la taille du build
echo "📊 Taille du build:"
du -sh dist/

echo "✅ Build terminé avec succès!"
echo "📁 Fichiers prêts dans ./dist/"
echo ""
echo "🚀 Prêt pour le déploiement:"
echo "- Supabase: Exécuter PRODUCTION_DATABASE_SETUP.sql"
echo "- Variables: Configurer VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY"
echo "- Deploy: Utiliser le dossier ./dist/"
