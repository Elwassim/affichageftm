#!/bin/bash

echo "🧹 Nettoyage des logs de debug..."

# Supprimer tous les console.log avec emojis
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '/console\.log.*[🔍📊✅❌⚠️🔄💥🧹📋🗑️]/d'

# Supprimer les console.error avec emojis  
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '/console\.error.*[🔍📊✅❌⚠️🔄💥🧹📋🗑️]/d'

# Supprimer les lignes de commentaires avec emojis (logs contextuels)
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '/\/\/.*[🔍📊✅❌⚠️🔄💥🧹📋🗑️]/d'

echo "✅ Nettoyage terminé!"
