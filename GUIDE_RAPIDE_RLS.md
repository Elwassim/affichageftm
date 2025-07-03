# 🚨 Guide Rapide - Correction RLS Hommages

## Problème

Les hommages ne s'affichent pas à cause des permissions RLS (Row Level Security) de Supabase.

## ⚡ Solution Rapide (1 minute)

### Option 1: Script Complet

1. Copiez le contenu de `FIX_ALL_RLS.sql`
2. Allez dans **Supabase Dashboard → SQL Editor**
3. Collez et **exécutez le script**
4. ✅ **Terminé !** Toutes les tables seront accessibles

### Option 2: Hommages Seulement

1. Copiez le contenu de `FIX_TRIBUTES_RLS.sql`
2. Allez dans **Supabase Dashboard → SQL Editor**
3. Collez et **exécutez le script**
4. ✅ Les hommages fonctionneront

### Option 3: Interface Admin

1. Allez dans **l'onglet "Hommages"** de l'admin
2. Cliquez sur **"Réparer Hommages"**
3. Si ça ne marche pas → utilisez Option 1 ou 2

## 🔍 Ce que fait le script

- ✅ Désactive RLS sur la table `tributes`
- ✅ Crée une fonction `get_all_tributes()` de contournement
- ✅ Ajoute un hommage d'exemple si la table est vide
- ✅ Teste que tout fonctionne

## ✅ Vérification

Après le script:

1. Retournez dans l'interface admin
2. Cliquez sur "Vérifier Tout" (en haut à droite)
3. Les hommages devraient maintenant afficher: **✅ OK**

## 📊 Scripts Disponibles

- `FIX_ALL_RLS.sql` - **Recommandé** (corrige tout)
- `FIX_TRIBUTES_RLS.sql` - Hommages seulement
- `FIX_PERMANENCES_RLS.sql` - Permanences seulement

Le script `FIX_ALL_RLS.sql` est le plus complet et corrige tous les problèmes RLS d'un coup !
