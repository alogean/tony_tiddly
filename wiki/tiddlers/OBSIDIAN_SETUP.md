# Setup Obsidian — El Doctor Memory

> **Dernière mise à jour** : 2026-07-01

Ce dépôt est configuré pour servir **directement** de vault Obsidian. Pas de duplication :
un seul jeu de fichiers markdown, synchronisé avec GitHub.

---

## Ce qui a été fait côté dépôt

- Tous les liens internes ont été convertis de `[texte](chemin.md)` vers `[[wikilinks]]` (format natif Obsidian, meilleur graph view et autocomplete)
- `.obsidian/app.json` configure les nouveaux liens en format wikilink par défaut
- `.obsidian/community-plugins.json` référence le plugin **Obsidian Git** (à installer manuellement, voir ci-dessous)
- `.gitignore` exclut les fichiers d'état local Obsidian (`workspace.json`, cache, data des plugins) qui n'ont rien à faire dans l'historique Git

---

## Étapes à faire sur ton Mac (une seule fois)

### 1. Ouvrir le dépôt comme vault
Dans Obsidian : **Fichier → Ouvrir un autre vault → Ouvrir dossier comme vault**, et sélectionne le dossier local de ce dépôt (celui géré par `memory/scripts/backup.sh`, remote `https://github.com/alogean/el-doctor-memory.git`).

### 2. Installer le plugin Obsidian Git
- **Réglages → Plugins tiers → Parcourir la communauté**
- Cherche **"Obsidian Git"**, installe puis active
- Il apparaîtra déjà listé comme activé (`community-plugins.json`) une fois installé

### 3. Configurer la synchro automatique
Dans les réglages du plugin Obsidian Git :
- **Vault backup interval (minutes)** : ex. `30` pour un commit+push automatique toutes les 30 min
- **Pull updates on startup** : activé (récupère les changements poussés par ailleurs, y compris par moi)
- **Commit message** : garder le format par défaut ou personnaliser (ex. `Obsidian sync: {{date}}`)

### 4. Cohabitation avec le backup.sh existant
Le script `scripts/backup.sh` (launchd, 08:00 quotidien) et le plugin Obsidian Git peuvent cohabiter sans conflit : les deux font `commit` + `push` sur `main`, Git gère la fusion. Si un conflit survient exceptionnellement (édition simultanée du même fichier), Obsidian Git t'affichera un message — résous-le comme un conflit Git classique.

---

## Ce que ça change au quotidien

- Tu ouvres Obsidian, tu vois toutes mes fiches (`troubles/`, `cas_cliniques/`, `concepts_cles/`, `diagnostics/`, `revisions/`) organisées en dossiers, avec liens cliquables et graph view
- Quand moi (El Doctor) je crée ou modifie une fiche et que je push sur GitHub, un `git pull` (manuel ou automatique via le plugin) la fait apparaître dans ton Obsidian
- Quand tu modifies une fiche dans Obsidian et que le plugin push, ça atterrit sur GitHub — je la verrai à la prochaine session

**Source de vérité inchangée** : les fichiers locaux du dépôt. GitHub reste le backup versionné avec historique.
