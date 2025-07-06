# 🚀 CGT FTM Dashboard

Dashboard syndical en temps réel pour la Confédération Générale du Travail - Fédération des Travailleurs de la Métallurgie.

## ✨ Fonctionnalités

### 📺 Dashboard Principal

- **Date/Heure** en temps réel
- **Permanences** techniques et politiques séparées
- **Réunions** avec salles et horaires
- **Vidéo** institutionnelle avec autoplay
- **Hommages** avec rotation automatique
- **Flux RSS** France Info en temps réel
- **Alertes** personnalisables

### 🔧 Panel Administration

- Gestion complète des réunions
- Configuration des permanences par type
- Upload et gestion des hommages
- Gestion des utilisateurs et rôles
- Configuration vidéos et alertes
- Synchronisation temps réel

## 🚀 Déploiement Rapide

### 1. Variables d'Environnement

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anonyme
```

_Utiliser les URLs Supabase existantes - la base de données est déjà configurée et fonctionnelle._

### 2. Build et Déploiement

```bash
npm install
npm run build
# Déployer le dossier ./dist/
```

### 3. Accès

- **Dashboard** : `/` (mode kiosque/TV)
- **Administration** : `/admin`
- **Connexion** : Utiliser les comptes existants en base

## 🎯 Optimisé Pour

- **Affichage TV** 24/7
- **Mode kiosque** tactile
- **Performance** temps réel
- **Responsif** tous écrans

## 🛠️ Technologies

- React + TypeScript
- Tailwind CSS
- Supabase (base existante)
- Vite (build)
- Lucide Icons

## 📊 Structure

```
src/
├── components/dashboard/    # Widgets dashboard
├── components/admin/        # Panel administration
├── pages/                   # Pages principales
├── lib/                     # Logique métier
└── hooks/                   # Hooks React
```

## 🔒 Sécurité

- Authentification Supabase
- Row Level Security (RLS)
- Rôles et permissions
- Données chiffrées

## 📈 Performance

- **Build** : 876KB gzipped
- **Chargement** : < 2s
- **Sync** : 30s intervals
- **Cache** : localStorage backup

## ✅ Status

**PRODUCTION READY** - Base de données existante, code optimisé, build testé.

---

**Développé pour CGT FTM** - Dashboard syndical professionnel
