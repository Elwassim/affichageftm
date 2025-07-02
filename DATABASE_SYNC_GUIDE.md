# 🔄 Guide de Synchronisation Base de Données - CGT FTM Dashboard

## ✅ Synchronisation Complète Réalisée

### 🏗️ **Architecture de Synchronisation**

```
┌─ SUPABASE DATABASE ────────────────────────────────────┐
│  ├─ meetings (réunions)                                │
│  ├─ permanences (horaires permanents)                  │
│  ├─ tributes (hommages)                               │
│  ├─ users (gestion utilisateurs)                      │
│  ├─ dashboard_config (configuration système)           │
│  └─ social_posts (messages sociaux)                   │
└────────────────────────────────────────────────────────┘
                            ↕️
┌─ REACT FRONTEND ───────────────────────────────────────┐
│  ├─ Admin Panel (CRUD complet)                        │
│  ├─ Dashboard Widgets (lecture temps réel)            │
│  ├─ Hooks de synchronisation automatique              │
│  └─ Fallback localStorage si Supabase indisponible    │
└────────────────────────────────────────────────────────┘
```

---

## 📋 **Fonctionnalités Synchronisées**

### 🔧 **Panel d'Administration**

- ✅ **Réunions** : CRUD complet avec catégories
- ✅ **Hommages** : CRUD avec rotation automatique
- ✅ **Permanences** : CRUD avec types/horaires
- ✅ **Utilisateurs** : CRUD avec rôles et permissions
- ✅ **Configuration** : URL vidéo, ville météo, alertes
- ✅ **Paramètres** : Monitoring système et maintenance

### 📺 **Widgets Dashboard**

- ✅ **Réunions** : Affichage semaine courante avec auto-scroll
- ✅ **Permanences** : Rotation automatique
- ✅ **Hommages** : Rotation 30s avec indicateurs
- ✅ **Vidéo** : URL configurable depuis admin
- ✅ **Alertes** : Bandeau configurable
- ✅ **Météo** : Ville configurable

---

## 🔄 **Hooks de Synchronisation**

### `useDatabaseSync(interval)`

Hook principal pour synchronisation temps réel :

```typescript
const {
  meetings,
  tributes,
  permanences,
  users,
  config,
  loading,
  error,
  refresh,
  isConnected,
  lastSync,
} = useDatabaseSync(30000); // 30s refresh
```

### `useAdminSync()`

Hook spécialisé pour le panel admin (30s refresh)

### `useDashboardSync()`

Hook spécialisé pour le tableau de bord (60s refresh)

---

## 🗄️ **Structure Base de Données**

### **Tables Principales**

#### `meetings` - Réunions

```sql
CREATE TABLE meetings (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  time VARCHAR(100) NOT NULL,
  room VARCHAR(255) NOT NULL,
  category VARCHAR(100) DEFAULT 'Assemblée Générale',
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `users` - Utilisateurs

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  is_admin BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `permanences` - Permanences

```sql
CREATE TABLE permanences (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  schedule VARCHAR(100) NOT NULL,
  type VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `tributes` - Hommages

```sql
CREATE TABLE tributes (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  photo VARCHAR(500),
  text TEXT NOT NULL,
  date_added TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `dashboard_config` - Configuration

```sql
CREATE TABLE dashboard_config (
  id UUID PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🚀 **Déploiement & Configuration**

### **1. Setup Base de Données**

```bash
# Exécuter dans Supabase SQL Editor
-- 1. Script principal
\i supabase_setup.sql

-- 2. Migration v2 (mise à jour colonnes)
\i supabase_migration_v2.sql
```

### **2. Variables d'Environnement**

```env
VITE_SUPABASE_URL=https://tcsnnbtaedmzrnwxtiko.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### **3. Utilisateurs par Défaut**

```
Username: admin.cgt
Password: cgtftm2024
Role: Admin

Username: marie.delegue
Password: cgtftm2024
Role: Moderator
```

---

## 🔐 **Sécurité & Permissions**

### **Row Level Security (RLS)**

- ✅ Lecture publique pour affichage TV
- ✅ Écriture restreinte aux administrateurs
- ✅ Authentification sécurisée avec bcrypt
- ✅ Gestion des rôles (admin, moderator, user)

### **Policies Supabase**

```sql
-- Lecture publique dashboard
CREATE POLICY "Allow public read" ON meetings FOR SELECT USING (true);

-- Admin CRUD
CREATE POLICY "Allow admin write" ON meetings FOR ALL
  USING (user_is_admin()) WITH CHECK (user_is_admin());
```

---

## 📊 **Monitoring & Maintenance**

### **Panel Admin - Section Paramètres**

- 🟢 État connexion base de données
- 📊 Statistiques données synchronisées
- 🔄 Bouton actualisation manuelle
- 📈 Compteurs d'entrées par table
- 🕐 Horodatage dernière synchronisation

### **Fallback localStorage**

- ✅ Mode dégradé si Supabase indisponible
- ✅ Données persistées localement
- ✅ Synchronisation automatique au retour connexion

---

## 🔧 **API Database.ts**

### **Configuration**

- `getConfig(key)` - Lecture configuration
- `updateConfig(key, value)` - Mise à jour configuration

### **Réunions**

- `getMeetings()` - Réunions semaine courante
- `getAllMeetings()` - Toutes les réunions
- `addMeetingToDB(meeting)` - Ajout réunion
- `updateMeetingInDB(id, updates)` - Modification réunion
- `deleteMeetingFromDB(id)` - Suppression réunion

### **Utilisateurs**

- `getUsers()` - Liste utilisateurs
- `createUser(userData)` - Création utilisateur
- `updateUser(id, updates)` - Modification utilisateur
- `deleteUser(id)` - Suppression utilisateur
- `authenticateUser(username, password)` - Authentification

### **Hommages**

- `getTributes()` - Liste hommages
- `addTributeToDB(tribute)` - Ajout hommage
- `deleteTributeFromDB(id)` - Suppression hommage

### **Permanences**

- `getPermanences()` - Liste permanences
- `addPermanenceToDB(permanence)` - Ajout permanence
- `updatePermanence(id, updates)` - Modification permanence
- `deletePermanence(id)` - Suppression permanence

---

## ✨ **Résultat Final**

🎯 **Dashboard CGT FTM 100% synchronisé avec Supabase**

- ⚡ Temps réel avec auto-refresh
- 🔒 Sécurité enterprise avec RLS
- 📱 Interface admin moderne et réactive
- 🔄 Fallback localStorage robuste
- 📊 Monitoring intégré
- 🚀 Production-ready

Le système est maintenant **entièrement opérationnel** avec synchronisation bidirectionnelle temps réel entre l'interface et la base de données Supabase !
