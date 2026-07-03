# Second Cerveau — POC (TiddlyWiki + Zettelkasten + PARA + TW5-Graph)

Un **second cerveau** en un seul fichier HTML autonome : notes atomiques reliées (Zettelkasten),
organisation par actionabilité (PARA), et **graphe interactif** de tes idées (plugin TW5-Graph).

## 🚀 Utilisation immédiate

1. Ouvre **`SecondCerveau.html`** dans un navigateur (double-clic).
2. Page d'accueil : boutons pour créer des notes + navigation.
3. Ouvre **« 🕸 Graphe de la pensée »** pour voir la carte interactive.
4. Lis **« 📐 Conventions »** pour la méthode.

> ⚠️ **Sauvegarde** : un fichier HTML ouvert en local ne se sauve pas tout seul. Pour garder tes
> modifications, utilise l'une de ces options :
> - Bouton **« save changes »** de TiddlyWiki (télécharge une nouvelle version du fichier), ou
> - **TiddlyDesktop** (app dédiée, sauvegarde directe), ou
> - l'extension navigateur **TiddlyWiki Saver**, ou
> - le mode **serveur** (voir ci-dessous), qui sauvegarde automatiquement.

## 🧠 Ce qu'il contient (exemples de démarrage)

- **Notes permanentes** interconnectées : Zettelkasten, Second cerveau, Note atomique, Méthode PARA,
  Calligraphie scientifique, Art Brut, Écriture asémique, IA générative, Coaching augmenté par l'IA,
  Coaching-one.com, etc.
- **Notes littéraires** (Ahrens, Forte), une **note fugace** (idée-pont art ↔ pensée).
- **PARA** via tags : Projet / Domaine / Ressource / Archive.
- Trois clusters reliés : gestion des connaissances, art, coaching/IA.

## 🔁 Reconstruire après édition des sources

Les tiddlers sont persistés dans `wiki/tiddlers/`. Pour reconstruire le fichier :

```bash
./build.sh
```

## 🖥️ Mode serveur (sauvegarde automatique, recommandé pour un usage réel)

```bash
./node_modules/.bin/tiddlywiki \
  ++"$(pwd)/_plugin_src/tw5-graph/plugins/graph" \
  ++"$(pwd)/_plugin_src/tw5-vis-network/plugins/vis-network" \
  wiki --listen
```

Puis ouvre http://127.0.0.1:8080 — chaque modification est sauvegardée automatiquement dans `wiki/tiddlers/`.

## 📦 Structure

- `SecondCerveau.html` — le wiki autonome (résultat, à ouvrir/partager)
- `wiki/` — le wiki-dossier source (tiddlers + config de build)
- `seed.json` — contenu initial (déjà importé ; utile pour repartir de zéro)
- `_plugin_src/` — sources des plugins TW5-Graph et tw5-vis-network (clonés depuis GitHub)
- `build.sh` — script de build
- `node_modules/` — TiddlyWiki (CLI)

## 🔌 Crédits plugins
- [TW5-Graph](https://github.com/flibbles/tw5-graph) (flibbles) — framework de graphe
- [tw5-vis-network](https://github.com/flibbles/tw5-vis-network) (flibbles) — moteur de rendu vis-network
