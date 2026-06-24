#!/usr/bin/env node

// [LEARN] Ce script sert à publier du code propre sur le remote GitHub (branche main).
// [LEARN] En local on travaille sur la branche 'dev' avec des commentaires [LEARN] qui
// [LEARN] expliquent le code. Ce script les supprime avant de pousser sur 'main'.
// [LEARN] Résultat : GitHub ne montre que du code professionnel, sans commentaires scolaires.

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// [LEARN] Les extensions de fichiers sur lesquelles on supprime les commentaires [LEARN]
const TARGET_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

// [LEARN] Dossiers à ignorer lors du scan des fichiers
const IGNORED_DIRS = new Set(['node_modules', '.git', 'dist', 'build', 'coverage', '.next']);

// [LEARN] Marqueur utilisé pour identifier les commentaires pédagogiques
const LEARN_MARKER = '// [LEARN]';

function run(cmd, silent = false) {
  return execSync(cmd, {
    stdio: silent ? 'pipe' : 'inherit',
    encoding: 'utf8',
    cwd: path.resolve(__dirname, '..'),
  });
}

function getAllFiles(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name)) {
        results.push(...getAllFiles(path.join(dir, entry.name)));
      }
    } else if (TARGET_EXTENSIONS.some((ext) => entry.name.endsWith(ext))) {
      results.push(path.join(dir, entry.name));
    }
  }
  return results;
}

function stripLearnComments(filePath) {
  const original = fs.readFileSync(filePath, 'utf8');
  const cleaned = original
    .split('\n')
    .filter((line) => !line.trimStart().startsWith(LEARN_MARKER))
    .join('\n');

  if (cleaned !== original) {
    fs.writeFileSync(filePath, cleaned, 'utf8');
    return true;
  }
  return false;
}

function main() {
  const repoRoot = path.resolve(__dirname, '..');

  // --- Vérifications préalables ---
  const currentBranch = run('git rev-parse --abbrev-ref HEAD', true).trim();
  if (currentBranch !== 'dev') {
    console.error(`\n❌ Tu dois être sur la branche 'dev' pour lancer ce script.`);
    console.error(`   Branche actuelle : ${currentBranch}\n`);
    process.exit(1);
  }

  const status = run('git status --porcelain', true).trim();
  if (status) {
    console.error('\n❌ Le working tree n\'est pas propre. Commite ou stash tes changements d\'abord.\n');
    process.exit(1);
  }

  console.log('\n📦 Préparation du push propre vers main...\n');

  const tempBranch = `clean-publish-${Date.now()}`;

  try {
    // --- Créer une branche temporaire à partir de dev ---
    console.log(`🌿 Création de la branche temporaire ${tempBranch}...`);
    run(`git checkout -b ${tempBranch}`, true);

    // --- Supprimer les commentaires [LEARN] ---
    const files = getAllFiles(repoRoot);
    let strippedCount = 0;
    for (const file of files) {
      if (stripLearnComments(file)) strippedCount++;
    }
    console.log(`✂️  Commentaires [LEARN] supprimés dans ${strippedCount} fichier(s).`);

    // --- Committer les fichiers nettoyés ---
    if (strippedCount > 0) {
      run('git add -A', true);
      run('git commit -m "chore: strip educational comments for clean publish"', true);
    }

    // --- Mettre à jour main avec le contenu nettoyé ---
    console.log('🔀 Mise à jour de la branche main...');
    run('git branch -f main HEAD', true);

    // --- Pousser main sur le remote ---
    console.log('🚀 Push vers origin/main...');
    run('git push origin main');

    console.log('\n✅ Remote main mis à jour avec du code propre !\n');
  } catch (err) {
    console.error('\n❌ Erreur :', err.message);
  } finally {
    // --- Toujours retourner sur dev et nettoyer ---
    run('git checkout dev', true);
    try {
      run(`git branch -D ${tempBranch}`, true);
    } catch (_) {
      // La branche temp n'existe peut-être pas si l'erreur est arrivée tôt
    }
    console.log('🔙 Retour sur la branche dev.\n');
  }
}

main();
