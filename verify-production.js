#!/usr/bin/env node

/**
 * Script de vérification pour le déploiement en production
 * CGT FTM Dashboard
 */

const fs = require("fs");
const path = require("path");

console.log("🔍 CGT FTM Dashboard - Vérification Production");
console.log("================================================");

const checks = [];

// Vérifier les fichiers essentiels
const essentialFiles = [
  "dist/index.html",
  "dist/assets",
  "PRODUCTION_DATABASE_SETUP.sql",
  "DEPLOYMENT_CHECKLIST.md",
  "README.md",
];

essentialFiles.forEach((file) => {
  if (fs.existsSync(file)) {
    checks.push(`✅ ${file}`);
  } else {
    checks.push(`❌ ${file} MANQUANT`);
  }
});

// Vérifier package.json
if (fs.existsSync("package.json")) {
  const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
  checks.push(`✅ Package: ${pkg.name}@${pkg.version}`);

  // Vérifier les scripts essentiels
  const scripts = ["build", "dev", "preview"];
  scripts.forEach((script) => {
    if (pkg.scripts && pkg.scripts[script]) {
      checks.push(`✅ Script: ${script}`);
    } else {
      checks.push(`❌ Script manquant: ${script}`);
    }
  });
}

// Vérifier la structure des composants
const componentPaths = [
  "src/components/dashboard",
  "src/components/admin",
  "src/pages",
  "src/lib",
];

componentPaths.forEach((dir) => {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    checks.push(`✅ ${dir} (${files.length} fichiers)`);
  } else {
    checks.push(`❌ ${dir} MANQUANT`);
  }
});

// Afficher les résultats
console.log("\n📋 Résultats de vérification:");
checks.forEach((check) => console.log(check));

// Vérifier la taille du build
if (fs.existsSync("dist")) {
  const getDirectorySize = (dir) => {
    let size = 0;
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        size += getDirectorySize(filePath);
      } else {
        size += stats.size;
      }
    });
    return size;
  };

  const buildSize = getDirectorySize("dist");
  const buildSizeMB = (buildSize / 1024 / 1024).toFixed(2);
  console.log(`\n📊 Taille du build: ${buildSizeMB} MB`);
}

console.log("\n🚀 Instructions de déploiement:");
console.log("1. Configurer Supabase avec PRODUCTION_DATABASE_SETUP.sql");
console.log(
  "2. Définir les variables VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY",
);
console.log("3. Déployer le dossier ./dist/ sur votre hébergeur");
console.log("4. Accéder au dashboard: / et à l'admin: /admin");

const hasErrors = checks.some((check) => check.includes("❌"));
if (hasErrors) {
  console.log(
    "\n⚠️  Des erreurs ont été détectées. Veuillez les corriger avant le déploiement.",
  );
  process.exit(1);
} else {
  console.log(
    "\n✅ Toutes les vérifications sont passées. Prêt pour le déploiement!",
  );
  process.exit(0);
}
