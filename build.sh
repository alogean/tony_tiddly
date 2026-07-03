#!/usr/bin/env bash
# Build du Second Cerveau (TiddlyWiki + TW5-Graph) en un seul fichier HTML autonome.
set -euo pipefail
cd "$(dirname "$0")"

GRAPH="$(pwd)/_plugin_src/tw5-graph/plugins/graph"
VIS="$(pwd)/_plugin_src/tw5-vis-network/plugins/vis-network"

# Build (les tiddlers sont déjà persistés dans wiki/tiddlers/)
./node_modules/.bin/tiddlywiki ++"$GRAPH" ++"$VIS" wiki --build index

# Copie à la racine pour un accès facile + GitHub Pages (index.html)
cp wiki/output/index.html "SecondCerveau.html"
cp wiki/output/index.html "index.html"
echo "OK -> $(pwd)/SecondCerveau.html (+ index.html pour GitHub Pages)"
