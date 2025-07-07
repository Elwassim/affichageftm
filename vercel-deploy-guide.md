# 🚀 Déploiement CGT FTM Dashboard sur Vercel

## 📋 Avantages de Vercel

- ✅ Déploiement automatique depuis Git
- ✅ SSL gratuit et CDN global
- ✅ Builds automatiques à chaque push
- ✅ Pas de serveur à gérer
- ✅ Interface simple et intuitive
- ✅ Domaine gratuit fourni

## 🔧 1. Préparation du Projet

### Vérification des fichiers requis

Assurez-vous que ces fichiers sont présents :

- ✅ `vercel.json` - Configuration Vercel
- ✅ `package.json` - Dépendances du projet
- ✅ `vite.config.ts` - Configuration Vite
- ✅ `database-complete.sql` - Script SQL pour Supabase

### Mise à jour du build (si nécessaire)

```bash
# Tester le build en local
npm run build

# Vérifier que le dossier dist/ est créé
ls -la dist/
```

## 🗄️ 2. Configuration Base de Données Supabase

### Exécution du script SQL

1. **Connectez-vous** à [supabase.com](https://supabase.com)
2. **Ouvrez** votre projet ou créez-en un nouveau
3. **Allez** dans `SQL Editor`
4. **Copiez-collez** le contenu du fichier `database-complete.sql`
5. **Cliquez** sur "Run" pour exécuter le script
6. **Vérifiez** que toutes les tables sont créées dans `Table Editor`

### Récupération des clés API

1. **Allez** dans `Settings` → `API`
2. **Notez** ces informations :
   - **URL du projet** : `https://xxxxx.supabase.co`
   - **Clé publique (anon)** : `eyJhbGciOiJIUzI1NiIsInR5cCI6...`

## 🌐 3. Déploiement sur Vercel

### Option A : Déploiement depuis GitHub (Recommandé)

#### 3.1 Pousser le code sur GitHub

```bash
# Initialiser Git si pas fait
git init
git add .
git commit -m "Initial commit - CGT FTM Dashboard"

# Créer un repo sur GitHub et le lier
git remote add origin https://github.com/votre-username/cgt-ftm-dashboard.git
git branch -M main
git push -u origin main
```

#### 3.2 Connecter Vercel à GitHub

1. **Allez** sur [vercel.com](https://vercel.com)
2. **Connectez-vous** avec votre compte GitHub
3. **Cliquez** sur "New Project"
4. **Sélectionnez** votre repository `cgt-ftm-dashboard`
5. **Vercel détecte** automatiquement que c'est un projet Vite
6. **Cliquez** sur "Deploy"

### Option B : Déploiement direct avec Vercel CLI

```bash
# Installer Vercel CLI
npm install -g vercel

# Se connecter à Vercel
vercel login

# Déployer depuis le dossier du projet
cd votre-projet
vercel

# Suivre les instructions :
# - Set up and deploy? Yes
# - Which scope? (votre compte)
# - Link to existing project? No
# - Project name? cgt-ftm-dashboard
# - Directory? ./
# - Override settings? No
```

## ⚙️ 4. Configuration des Variables d'Environnement

### Sur le Dashboard Vercel

1. **Allez** dans votre projet sur vercel.com
2. **Cliquez** sur `Settings`
3. **Allez** dans `Environment Variables`
4. **Ajoutez** ces variables :

```
VITE_SUPABASE_URL = https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY = votre_cle_anon_key_supabase
```

### Via CLI (alternative)

```bash
# Depuis le dossier du projet
vercel env add VITE_SUPABASE_URL
# Entrez votre URL Supabase

vercel env add VITE_SUPABASE_ANON_KEY
# Entrez votre clé anon Supabase
```

## 🔄 5. Redéploiement avec les Variables

Après avoir ajouté les variables d'environnement :

```bash
# Option 1 : Redéployer via CLI
vercel --prod

# Option 2 : Push sur GitHub (redéploiement automatique)
git add .
git commit -m "Add environment variables"
git push origin main
```

## 🎯 6. Configuration du Domaine (Optionnel)

### Domaine personnalisé

1. **Dans** Vercel Dashboard → `Settings` → `Domains`
2. **Ajoutez** votre domaine : `cgt-ftm.fr`
3. **Configurez** les DNS chez votre registrar :

   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com

   Type: A
   Name: @
   Value: 76.76.19.61
   ```

### Redirection www

Vercel gère automatiquement les redirections `www` vers le domaine principal.

## ✅ 7. Vérification du Déploiement

### Tests à effectuer

1. **URL du site** : https://votre-projet.vercel.app
2. **Page de login** : `/login`
3. **Panel admin** : `/admin`
4. **Fonctionnalités** :
   - ✅ Dashboard principal s'affiche
   - ✅ Connexion admin fonctionne
   - ✅ Widgets chargent correctement
   - ✅ RSS feed s'affiche
   - ✅ CRUD réunions/utilisateurs fonctionne
   - ✅ Permissions admin/éditeur respectées

### Debugging

Si quelque chose ne fonctionne pas :

1. **Vercel Dashboard** → `Functions` → Voir les logs
2. **Console navigateur** → Vérifier les erreurs JS
3. **Network** → Vérifier les appels API Supabase

## 🔧 8. Automatisation des Déploiements

### Déploiement automatique

Une fois connecté à GitHub, **chaque push** déclenche automatiquement :

1. Build de l'application
2. Tests de déploiement
3. Mise en ligne si succès
4. Notification par email

### Branches de déploiement

```bash
# Production (main)
git checkout main
git add .
git commit -m "Update production"
git push origin main
# → Déploie sur votre-projet.vercel.app

# Preview (autres branches)
git checkout -b feature/nouvelle-fonctionnalite
git add .
git commit -m "Add new feature"
git push origin feature/nouvelle-fonctionnalite
# → Déploie sur une URL de preview temporaire
```

## 📊 9. Monitoring et Analytics

### Analytics Vercel (gratuit)

1. **Dans** Vercel Dashboard → `Analytics`
2. **Activez** Web Analytics
3. **Surveillez** :
   - Visiteurs uniques
   - Pages vues
   - Performance
   - Core Web Vitals

### Surveillance des erreurs

```bash
# Voir les logs en temps réel
vercel logs votre-projet.vercel.app

# Logs des fonctions
vercel logs votre-projet.vercel.app --follow
```

## 🛠️ 10. Commandes Utiles

```bash
# Voir les projets Vercel
vercel list

# Infos sur le projet actuel
vercel inspect

# Logs du projet
vercel logs

# Supprimer un déploiement
vercel remove [deployment-url]

# Alias pour production
vercel alias [deployment-url] votre-domaine.com
```

## 🔒 11. Sécurité et Performance

### Headers de sécurité

Le fichier `vercel.json` inclut déjà :

- Cache optimisé pour les assets
- Redirections SPA correctes

### Performance

Vercel optimise automatiquement :

- ✅ Compression Gzip/Brotli
- ✅ CDN global
- ✅ Images optimisées
- ✅ Edge Functions
- ✅ Cache intelligent

## 🆘 12. Dépannage

### Erreurs courantes

**Build fails** :

```bash
# Tester le build localement
npm run build
# Vérifier les erreurs et corriger
```

**Variables d'environnement** :

```bash
# Vérifier les variables
vercel env ls
# Les ajouter si manquantes
```

**404 sur les routes** :
Le fichier `vercel.json` avec la configuration `rewrites` règle ce problème.

**Erreur Supabase** :

- Vérifier les clés API dans les variables d'environnement
- Tester la connexion depuis l'interface Supabase

## 🎉 13. Accès Final

Une fois déployé, votre dashboard sera accessible à :

- **URL Vercel** : `https://cgt-ftm-dashboard.vercel.app`
- **Login** : `https://cgt-ftm-dashboard.vercel.app/login`
- **Admin** : `https://cgt-ftm-dashboard.vercel.app/admin`

### Comptes de test

Utilisez les comptes créés dans Supabase :

- **Admin** : `admin.cgt` / `votre-mot-de-passe`
- **Éditeur** : `marie.delegue` / `votre-mot-de-passe`

---

## 🎯 Résumé : 3 Étapes Simples

1. **Supabase** : Exécuter `database-complete.sql`
2. **GitHub** : Pusher le code
3. **Vercel** : Connecter le repo + ajouter les variables d'env

C'est tout ! Votre dashboard CGT FTM est en ligne 🚀
