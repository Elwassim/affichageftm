# 🔧 Système de Permanences Avancé - CGT FTM

## ✅ **Transformation réalisée**

Le système de permanences a été **complètement restructuré** pour supporter la complexité réelle des permanences CGT FTM.

---

## 📋 **Nouvelle Structure**

### **🏗️ Base de Données**

```sql
-- Table principale
permanences:
  - id (UUID)
  - name (VARCHAR) // Nom de la personne
  - type (technique|politique) // Type principal
  - category (VARCHAR) // Code catégorie (P, PAR, MAL, RTT...)
  - month (VARCHAR) // Mois en français
  - year (INTEGER) // Année
  - days (JSONB) // {1: "P", 5: "PAR", 14: "FER"}
  - description (TEXT) // Optionnel

-- Table des catégories
permanence_categories:
  - type (technique|politique)
  - code (P, PAR, MAL, RTT, REC, CP, FER)
  - label (Permanences, Congés Parental, Maladie...)
  - color (couleur hex pour affichage)
```

### **🎨 Interface Admin**

- ✅ **Calendrier interactif** pour sélectionner les jours
- ✅ **Codes couleur** par catégorie (PAR, MAL, RTT, etc.)
- ✅ **Types** : Technique 🔧 / Politique 🏛️
- ✅ **Légende** des catégories avec couleurs
- ✅ **Prévisualisation** des jours sélectionnés

---

## 🚀 **Installation**

### **1. Exécuter la migration Supabase**

```sql
-- Dans l'éditeur SQL Supabase
\i PERMANENCES_MIGRATION_V2.sql
```

### **2. Vérifier l'installation**

```sql
-- Compter les permanences
SELECT COUNT(*) FROM permanences;

-- Voir les catégories
SELECT * FROM permanence_categories;

-- Tester la vue
SELECT * FROM permanences_with_categories LIMIT 5;
```

---

## 📊 **Catégories Techniques (implémentées)**

| Code    | Label           | Couleur   | Description                |
| ------- | --------------- | --------- | -------------------------- |
| **P**   | Permanences     | 🔵 Bleu   | Permanences normales       |
| **PAR** | Congés Parental | 🌸 Rose   | Congés parental            |
| **MAL** | Maladie         | 🔴 Rouge  | Arrêt maladie              |
| **RTT** | RTT             | 🟢 Vert   | Réduction temps de travail |
| **REC** | Récupération    | 🟡 Jaune  | Récupération               |
| **CP**  | Congés Payés    | 🟣 Violet | Congés payés               |
| **FER** | Férié           | ⚫ Gris   | Jour férié                 |

---

## 🔧 **Utilisation du Panel Admin**

### **Ajouter une permanence :**

1. **Remplir les infos de base** :

   - Nom de la personne
   - Type (Technique/Politique)
   - Catégorie (P, PAR, MAL...)
   - Mois et année

2. **Sélectionner les jours** :

   - Cliquer sur les jours du calendrier
   - Les jours se colorent selon la catégorie
   - Codes affichés sur chaque jour

3. **Sauvegarder** :
   - Tous les jours sélectionnés sont enregistrés
   - Prévisualisation dans la liste

### **Gérer les permanences :**

- ✅ **Liste complète** avec aperçu des jours
- ✅ **Codes couleur** par catégorie
- ✅ **Filtres** par type (technique/politique)
- ✅ **Suppression** simple
- ✅ **Informations** : mois, année, nombre de jours

---

## 📱 **Widget Dashboard (à venir)**

Le widget des permanences sera mis à jour pour :

- Afficher les permanences du mois actuel
- Codes couleur par catégorie
- Rotation des personnes
- Légende des codes

---

## 🏛️ **Permanences Politiques**

Structure prête pour :

- Nouvelles catégories politiques
- Codes spécifiques (à définir)
- Couleurs dédiées
- Même interface d'administration

**Envoyez le document des permanences politiques** pour compléter l'implémentation !

---

## ✨ **Résultat Final**

🎯 **Système professionnel complet** :

- ✅ Conforme aux pratiques CGT FTM
- ✅ Calendrier interactif avancé
- ✅ Codes couleur professionnels
- ✅ Base de données structurée
- ✅ Interface admin moderne
- ✅ Prêt pour les permanences politiques

**Le système est maintenant à la hauteur des besoins réels de la CGT FTM !** 🚀
