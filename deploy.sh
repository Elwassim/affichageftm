#!/bin/bash
set -e

echo "🚀 Déploiement CGT Dashboard..."

# Naviguer vers le répertoire
cd /home/cgtftm/cgt-dashboard

# Sauvegarder l'état actuel
echo "💾 Sauvegarde de l'état actuel..."
pm2 save

# Mise à jour du code
echo "📦 Mise à jour du code..."
git pull origin main

# Installation des dépendances
echo "📋 Installation des dépendances..."
npm ci --production

# Build de production
echo "🔨 Build de production..."
npm run build

# Redémarrage de l'application
echo "🔄 Redémarrage de l'application..."
pm2 restart cgt-dashboard

# Vérification
echo "✅ Vérification du statut..."
pm2 status

echo "🎉 Déploiement terminé avec succès !"
