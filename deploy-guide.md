# 🚀 Guide de Déploiement - CGT FTM Dashboard sur VPS Debian

## 📋 Prérequis

- VPS Debian 11/12 avec accès root
- Domaine configuré pointant vers le VPS
- Compte Supabase avec projet configuré
- Accès SSH au serveur

## 🔧 1. Préparation du Serveur

### Installation des dépendances système

```bash
# Mise à jour du système
sudo apt update && sudo apt upgrade -y

# Installation Node.js 18.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installation des outils nécessaires
sudo apt install -y nginx certbot python3-certbot-nginx git build-essential

# Installation PM2 (gestionnaire de processus)
sudo npm install -g pm2
```

### Configuration utilisateur pour l'application

```bash
# Créer un utilisateur dédié
sudo useradd -m -s /bin/bash cgtftm
sudo usermod -aG sudo cgtftm

# Basculer vers l'utilisateur
sudo su - cgtftm
```

## 📦 2. Déploiement de l'Application

### Clonage et installation

```bash
# Naviguer vers le répertoire home
cd /home/cgtftm

# Cloner votre projet (remplacez par votre URL Git)
git clone <votre-repo-git> cgt-dashboard
cd cgt-dashboard

# Installation des dépendances
npm install

# Build de production
npm run build
```

### Configuration des variables d'environnement

```bash
# Créer le fichier .env
nano .env
```

Contenu du fichier `.env` :

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon_supabase

# Application Configuration
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Domain Configuration (optionnel)
DOMAIN=votre-domaine.fr
```

## 🗄️ 3. Configuration Base de Données Supabase

### Exécution du script SQL

1. Connectez-vous à votre dashboard Supabase
2. Allez dans `SQL Editor`
3. Copiez-collez le contenu du fichier `database-complete.sql`
4. Exécutez le script
5. Vérifiez que toutes les tables sont créées

### Configuration des clés API

1. Dans Supabase → Settings → API
2. Copiez l'URL du projet et la clé anon
3. Mettez à jour le fichier `.env`

## ⚙️ 4. Configuration PM2

### Créer le fichier de configuration PM2

```bash
nano ecosystem.config.js
```

Contenu du fichier `ecosystem.config.js` :

```javascript
module.exports = {
  apps: [
    {
      name: "cgt-dashboard",
      script: "npm",
      args: "run preview",
      cwd: "/home/cgtftm/cgt-dashboard",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOST: "0.0.0.0",
      },
      instances: 1,
      exec_mode: "fork",
      watch: false,
      max_memory_restart: "500M",
      error_file: "/home/cgtftm/logs/cgt-dashboard-error.log",
      out_file: "/home/cgtftm/logs/cgt-dashboard-out.log",
      log_file: "/home/cgtftm/logs/cgt-dashboard.log",
      time: true,
      autorestart: true,
      max_restarts: 3,
      min_uptime: "5s",
    },
  ],
};
```

### Créer le répertoire des logs

```bash
mkdir -p /home/cgtftm/logs
```

### Démarrer l'application avec PM2

```bash
# Démarrer l'application
pm2 start ecosystem.config.js

# Enregistrer la configuration PM2
pm2 save

# Configurer PM2 pour démarrer au boot
pm2 startup
# Suivre les instructions affichées (probablement sudo...)

# Vérifier le statut
pm2 status
pm2 logs cgt-dashboard
```

## 🌐 5. Configuration Nginx

### Créer le fichier de configuration Nginx

```bash
sudo nano /etc/nginx/sites-available/cgt-dashboard
```

Contenu de la configuration :

```nginx
server {
    listen 80;
    server_name votre-domaine.fr www.votre-domaine.fr;

    # Redirection vers HTTPS (sera configuré plus tard)
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name votre-domaine.fr www.votre-domaine.fr;

    # Logs
    access_log /var/log/nginx/cgt-dashboard.access.log;
    error_log /var/log/nginx/cgt-dashboard.error.log;

    # SSL Configuration (sera configuré par Certbot)
    ssl_certificate /etc/letsencrypt/live/votre-domaine.fr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/votre-domaine.fr/privkey.pem;

    # Sécurité SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Headers de sécurité
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'; frame-ancestors 'self';" always;

    # Compression
    gzip on;
    gzip_vary on;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Reverse proxy vers l'application Node.js
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Cache pour les assets statiques
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://127.0.0.1:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security.txt
    location /.well-known/security.txt {
        return 200 "Contact: admin@votre-domaine.fr\nExpires: 2024-12-31T23:59:59.000Z\n";
        add_header Content-Type text/plain;
    }
}
```

### Activer le site

```bash
# Activer la configuration
sudo ln -s /etc/nginx/sites-available/cgt-dashboard /etc/nginx/sites-enabled/

# Supprimer la configuration par défaut si elle existe
sudo rm -f /etc/nginx/sites-enabled/default

# Tester la configuration
sudo nginx -t

# Recharger Nginx
sudo systemctl reload nginx
```

## 🔒 6. Configuration SSL avec Let's Encrypt

```bash
# Obtenir le certificat SSL
sudo certbot --nginx -d votre-domaine.fr -d www.votre-domaine.fr

# Configurer le renouvellement automatique
sudo crontab -e
```

Ajouter cette ligne au crontab :

```bash
0 2 * * * /usr/bin/certbot renew --quiet && /usr/bin/systemctl reload nginx
```

## 🔧 7. Configuration du Firewall

```bash
# Installer UFW si pas installé
sudo apt install ufw

# Configuration basique
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Autoriser SSH, HTTP et HTTPS
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'

# Activer le firewall
sudo ufw enable

# Vérifier le statut
sudo ufw status
```

## 📊 8. Monitoring et Maintenance

### Surveillance PM2

```bash
# Installer PM2 Monit (optionnel)
pm2 install pm2-logrotate

# Surveiller les ressources
pm2 monit

# Redémarrer l'application
pm2 restart cgt-dashboard

# Voir les logs
pm2 logs cgt-dashboard --lines 100
```

### Surveillance Nginx

```bash
# Logs d'accès
sudo tail -f /var/log/nginx/cgt-dashboard.access.log

# Logs d'erreur
sudo tail -f /var/log/nginx/cgt-dashboard.error.log

# Statut du service
sudo systemctl status nginx
```

### Mise à jour de l'application

```bash
# Script de mise à jour (à créer)
cd /home/cgtftm/cgt-dashboard
git pull origin main
npm install
npm run build
pm2 restart cgt-dashboard
```

## 🔄 9. Script de Déploiement Automatique

Créer un script de déploiement :

```bash
nano /home/cgtftm/deploy.sh
chmod +x /home/cgtftm/deploy.sh
```

Contenu du script :

```bash
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
```

## 🎯 10. Vérification Finale

### Tests à effectuer :

1. **Accès au site** : https://votre-domaine.fr
2. **Login admin** : Tester la connexion
3. **Fonctionnalités** :
   - Dashboard principal avec tous les widgets
   - Panel admin accessible
   - CRUD des réunions, utilisateurs, etc.
   - RSS feed qui se charge
   - Permissions admin/éditeur fonctionnelles

### Commandes de diagnostic :

```bash
# Statut des services
sudo systemctl status nginx
pm2 status

# Logs en temps réel
pm2 logs cgt-dashboard --lines 50
sudo tail -f /var/log/nginx/error.log

# Test de connectivité base de données
# (depuis l'interface admin du dashboard)
```

## 🆘 Dépannage

### Problèmes courants :

**Application ne démarre pas :**

```bash
pm2 logs cgt-dashboard
# Vérifier les variables d'environnement dans .env
```

**Erreur 502 Bad Gateway :**

```bash
# Vérifier que l'app tourne sur le bon port
pm2 status
sudo netstat -tlnp | grep :3000
```

**Erreur SSL :**

```bash
sudo certbot certificates
sudo nginx -t
```

**Problème base de données :**

- Vérifier les clés Supabase dans `.env`
- Tester la connexion depuis l'interface Supabase

## 📱 11. Accès Final

Une fois déployé, votre dashboard sera accessible à :

- **URL principale** : https://votre-domaine.fr
- **Login admin** : https://votre-domaine.fr/login
- **Panel admin** : https://votre-domaine.fr/admin

---

🎉 **Félicitations !** Votre dashboard CGT FTM est maintenant déployé et opérationnel !
