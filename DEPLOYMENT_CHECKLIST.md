# 🚀 CGT FTM Dashboard - Guide de Déploiement

## ✅ Checklist de Déploiement

### 1. Configuration Base de Données

- [ ] Exécuter `PRODUCTION_DATABASE_SETUP.sql` sur Supabase
- [ ] Vérifier que toutes les tables sont créées
- [ ] Tester l'accès admin avec `admin.cgt`

### 2. Variables d'Environnement

```env
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_cle_anonyme
```

### 3. Build de Production

```bash
npm run build
```

### 4. Fonctionnalités Testées ✅

- [x] Affichage date/heure en temps réel
- [x] Widgets permanences techniques/politiques
- [x] Widget réunions avec salles
- [x] Widget vidéo avec autoplay
- [x] Widget hommages
- [x] Widget RSS France Info en temps réel
- [x] Panel admin complet
- [x] Synchronisation temps réel admin ↔ dashboard
- [x] Gestion utilisateurs
- [x] Configuration vidéo/alertes

### 5. Widgets Dashboard

- **DateTimeWidget** : Date et heure en temps réel
- **PermanencesCombinedWidget** : Permanences techniques + politiques séparées
- **MeetingsWidget** : Réunions avec salle
- **DiversWidget** : Widget informatif
- **VideoWidget** : Vidéo avec autoplay TV
- **SocialWidget** : Hommages avec rotation
- **RSSWidget** : Flux RSS France Info en temps réel
- **AlertBanner** : Bandeau d'alerte personnalisable

### 6. Panel Administration

- **Gestion réunions** : Ajout/modification/suppression
- **Gestion permanences** : Par type, avec sélection multi-jours
- **Gestion hommages** : Textes et photos
- **Gestion utilisateurs** : Rôles et permissions
- **Configuration** : Vidéos, alertes, paramètres

### 7. Technologies Utilisées

- **Frontend** : React + TypeScript + Tailwind CSS
- **Backend** : Supabase (PostgreSQL + Auth + RLS)
- **État** : localStorage + Supabase sync
- **Build** : Vite
- **Déploiement** : Netlify/Vercel compatible

### 8. Performance

- **Chargement initial** : < 2s
- **Sync temps réel** : 30s intervals
- **RSS updates** : 2 minutes
- **Auto-scroll** : Smooth animations
- **Cache** : localStorage backup

### 9. Structure Fichiers Essentiels

```
src/
├── components/dashboard/     # Widgets dashboard
├── components/admin/         # Panel admin
├── pages/                   # Pages principales
├── lib/                     # Logique métier
├── hooks/                   # Hooks React
└── styles/                  # CSS personnalisé
```

### 10. Maintenance

- **Logs** : Console debug pour RSS et sync
- **Backup** : localStorage automatique
- **Updates** : Variables d'environnement hot-reload
- **Monitoring** : Status indicators sur dashboard

## 🎯 Prêt pour Production

Toutes les fonctionnalités sont testées et optimisées pour un usage TV/kiosque en continu.
