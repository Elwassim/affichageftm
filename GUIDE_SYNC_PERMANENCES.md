# Guide de Synchronisation des Permanences

## 🎯 Objectif

Synchroniser le système de permanences avancées avec la base de données Supabase.

## 🚀 Méthodes de Synchronisation

### Méthode 1: Interface Admin (Recommandée)

1. Allez dans l'**interface Admin** de votre application
2. Cliquez sur l'onglet **"Permanences"**
3. Cliquez sur le bouton **"Synchroniser BDD"**
4. Attendez la confirmation de succès

### Méthode 2: Script SQL Direct

1. Ouvrez Supabase Dashboard
2. Allez dans **SQL Editor**
3. Copiez-collez le contenu du fichier `EXECUTE_PERMANENCES_SYNC.sql`
4. Exécutez le script

## 📋 Ce qui sera créé

### Tables

- **`permanences`** - Table principale des permanences
- **`permanence_categories`** - Table des catégories (P, PAR, MAL, RTT, etc.)

### Catégories Techniques

- **P** - Permanences (bleu)
- **PAR** - Congés Parental (rose)
- **MAL** - Maladie (rouge)
- **RTT** - RTT (vert)
- **REC** - Récupération (orange)
- **CP** - Congés Payés (violet)
- **FER** - Férié (gris)

### Données d'Exemple

- Permanences de BINET, MAGALI
- RTT de GALLOIS, FATIMA
- Congés de LETELLIER, VIRGINIE
- Et autres exemples du document CGT FTM

## ✅ Vérification

Après synchronisation, vous devriez voir:

- Interface calendrier colorée dans l'admin
- Catégories disponibles dans les menus déroulants
- Permanences d'exemple affichées

## 🆘 En cas de problème

- Vérifiez les logs dans la console du navigateur
- Assurez-vous que Supabase est bien configuré
- Contactez l'admin système si les permissions RLS bloquent

## 📊 Structure des Données

### Permanence

```json
{
  "id": "uuid",
  "name": "NOM, Prénom",
  "type": "technique|politique",
  "category": "P|PAR|MAL|RTT|REC|CP|FER",
  "month": "juillet",
  "year": 2025,
  "days": { "2": "P", "14": "FER", "18": "RTT" },
  "description": "Description optionnelle"
}
```

### Catégorie

```json
{
  "type": "technique",
  "code": "P",
  "label": "Permanences",
  "color": "#3b82f6",
  "description": "Permanences normales"
}
```
