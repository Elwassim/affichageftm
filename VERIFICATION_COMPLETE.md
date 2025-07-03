# Vérification Complète CGT FTM Dashboard

## ✅ Liste de Vérification

### 1. Navigation et Accessibilité

- [ ] Page d'accueil (Dashboard) charge correctement
- [ ] Lien "Admin" en haut à droite fonctionne
- [ ] Navigation entre les onglets admin (Réunions, Utilisateurs, Permanences, Hommages)
- [ ] Retour vers le dashboard depuis l'admin

### 2. Widgets du Dashboard

- [ ] **Date/Heure** : Affiche l'heure actuelle
- [ ] **Météo** : Se synchronise (ou affiche le placeholder)
- [ ] **Réunions** :
  - [ ] Affiche les réunions des 7 prochains jours
  - [ ] Montre la date (Aujourd'hui/Demain/Jour précis)
  - [ ] Affiche l'heure quand disponible (🕐)
- [ ] **Permanences** :
  - [ ] Affiche les permanences des 7 prochains jours
  - [ ] Montre le type (technique/politique) avec couleurs
  - [ ] Affiche l'heure quand disponible (🕐)
- [ ] **Vidéo** : Lecture automatique
- [ ] **Alerte** : Texte défilant
- [ ] **Hommages** : Rotation des tributes

### 3. Admin - Réunions

- [ ] **Ajouter** : Formulaire complet avec tous les champs
- [ ] **Modifier** : Édition inline avec sauvegarde
- [ ] **Supprimer** : Suppression avec rafraîchissement
- [ ] **Validation** : Champs obligatoires respectés

### 4. Admin - Utilisateurs

- [ ] **Ajouter** : Création nouvel utilisateur
- [ ] **Modifier** : Édition inline (email, rôle, statuts)
- [ ] **Supprimer** : ⚠️ À VÉRIFIER - Problème récent
- [ ] **Rôles** : Admin, Moderator, User
- [ ] **Statuts** : Actif/Inactif, Admin/Non-admin

### 5. Admin - Permanences

- [ ] **Ajouter** :
  - [ ] Nom, type (technique/politique)
  - [ ] Mois/année sélection
  - [ ] Calendrier interactif
  - [ ] **Heure par défaut** appliquée aux jours sélectionnés
- [ ] **Affichage** :
  - [ ] Liste avec heures visibles
  - [ ] Calendrier montre heures sous les jours
- [ ] **Modifier/Supprimer** : CRUD complet

### 6. Admin - Hommages

- [ ] **Ajouter** : Nom, photo, texte
- [ ] **Supprimer** : Fonctionnel
- [ ] **Affichage** : Prévisualisation

### 7. Base de Données

- [ ] **Connexion** : Indicateur de statut en admin
- [ ] **Synchronisation** : Données persistées
- [ ] **RLS** : Permissions correctes
- [ ] **Migration heures** : Structure des permanences avec temps

## 🔧 Actions de Test

### Test Navigation

1. Aller sur `/` (dashboard)
2. Cliquer "Admin" → Vérifier redirection
3. Tester chaque onglet admin
4. Retour dashboard

### Test CRUD Réunions

1. Admin → Réunions
2. Ajouter une réunion test avec heure
3. Vérifier affichage dans widget dashboard
4. Modifier la réunion
5. Supprimer la réunion

### Test CRUD Utilisateurs

1. Admin → Utilisateurs
2. Ajouter un utilisateur test
3. Modifier email/rôle
4. **TESTER SUPPRESSION** ⚠️
5. Vérifier logs console pour erreurs

### Test CRUD Permanences avec Heures

1. Admin → Permanences
2. Ajouter permanence avec heure (ex: 14:30)
3. Sélectionner plusieurs jours
4. Vérifier affichage heures dans calendrier
5. Vérifier affichage widget dashboard avec 🕐

### Test Scripts SQL (si problèmes)

1. `FIX_USERS_RLS_DELETE.sql` - Permissions utilisateurs
2. `CREATE_DELETE_USER_RPC.sql` - Fonction suppression
3. `ADD_TIME_SUPPORT_PERMANENCES.sql` - Migration heures
4. `ADD_EXAMPLE_TIMES_PERMANENCES.sql` - Données test

## 🚨 Problèmes Connus à Vérifier

1. **Suppression utilisateurs** : RLS permissions
2. **Heures permanences** : Affichage dashboard
3. **Migration base** : Structure données
4. **Console errors** : JavaScript/réseau

## 📊 Résultats Attendus

- Tous les widgets dashboard fonctionnels
- CRUD complet sur tous les modules admin
- Heures affichées dans réunions et permanences
- Aucune erreur JavaScript critique
- Base de données synchronisée
