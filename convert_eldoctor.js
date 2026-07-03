#!/usr/bin/env node
// Convertit le vault Obsidian el-doctor-memory en tiddlers TiddlyWiki (JSON).
const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "_import_eldoctor");
const OUT = path.join(__dirname, "eldoctor.json");

const MASTER = "🩺 El Doctor";

// Mapping dossier -> {tag catégorie, couleur}
const CATS = {
  cas_cliniques: { tag: "Cas clinique", color: "#e8710a" },
  concepts_cles: { tag: "Concept clé", color: "#34a853" },
  diagnostics:   { tag: "Diagnostic",  color: "#4285f4" },
  troubles:      { tag: "Trouble",     color: "#a142f4" },
  revisions:     { tag: "Révision",    color: "#f4b400" },
  _root:         { tag: "Méta",        color: "#80868b" },
};

const tiddlers = [];

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    if (name === ".git" || name === ".obsidian") continue;
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full);
    else handleFile(full);
  }
}

function categoryFor(full) {
  const rel = path.relative(SRC, full);
  const top = rel.split(path.sep)[0];
  if (rel.includes(path.sep) && CATS[top]) return CATS[top];
  return CATS._root;
}

function firstH1(text) {
  const m = text.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : "";
}

function handleFile(full) {
  const ext = path.extname(full).toLowerCase();
  const base = path.basename(full);
  if (base === ".gitignore" || base === "app.json" ||
      base === "community-plugins.json") return;

  if (ext === ".md") {
    const stem = base.replace(/\.md$/, "");
    const cat = categoryFor(full);
    let text = fs.readFileSync(full, "utf8");
    // Réécrit les images markdown ![alt](path) -> [img[alt|path]] (syntaxe TW)
    text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (m, alt, src) => {
      const a = (alt || "").trim();
      return a ? `[img[${a}|${src}]]` : `[img[${src}]]`;
    });
    const caption = firstH1(text);
    tiddlers.push({
      title: stem,
      type: "text/markdown",
      tags: `[[${MASTER}]] [[${cat.tag}]]`,
      color: cat.color,
      ...(caption ? { caption } : {}),
      text,
    });
  } else if ([".png", ".jpg", ".jpeg", ".gif", ".svg"].includes(ext)) {
    // Titre = chemin relatif au dossier du .md parent (= la ref utilisée dans le md)
    // Les images sont sous cas_cliniques/image/... -> ref "image/..."
    const rel = path.relative(SRC, full).split(path.sep);
    // enlève le 1er segment (dossier catégorie) pour matcher la ref relative du md
    const refPath = rel.slice(1).join("/");
    const mime = ext === ".svg" ? "image/svg+xml"
      : ext === ".jpg" || ext === ".jpeg" ? "image/jpeg"
      : ext === ".gif" ? "image/gif" : "image/png";
    const data = fs.readFileSync(full).toString("base64");
    tiddlers.push({
      title: refPath,
      type: mime,
      tags: `[[${MASTER}]] [[Image]]`,
      text: data,
    });
  } else if (ext === ".sh") {
    const stem = base;
    tiddlers.push({
      title: stem,
      type: "text/plain",
      tags: `[[${MASTER}]] [[Méta]]`,
      color: CATS._root.color,
      text: fs.readFileSync(full, "utf8"),
    });
  }
}

walk(SRC);

// --- Tiddlers de structure (catégories, portail, graphe) ---
function catTiddler(tag, color, desc) {
  return { title: tag, color, text: desc };
}
tiddlers.push(catTiddler(MASTER, "#d93025",
  "Base de connaissances **psychopathologie** (module M17) importée depuis le vault Obsidian //el-doctor-memory//. Voir le [[🩺 El Doctor — Portail]] et le [[🕸 Graphe El Doctor]]."));
tiddlers.push(catTiddler("Cas clinique", "#e8710a", `Cas cliniques étudiés. Tag de [[${MASTER}]].`));
tiddlers.push(catTiddler("Concept clé", "#34a853", `Concepts théoriques transversaux. Tag de [[${MASTER}]].`));
tiddlers.push(catTiddler("Diagnostic", "#4285f4", `Outils et démarches diagnostiques (DSM-5). Tag de [[${MASTER}]].`));
tiddlers.push(catTiddler("Trouble", "#a142f4", `Familles de troubles. Tag de [[${MASTER}]].`));
tiddlers.push(catTiddler("Révision", "#f4b400", `Fiches de révision et flashcards. Tag de [[${MASTER}]].`));
tiddlers.push(catTiddler("Méta", "#80868b", `Fichiers de configuration de l'agent El Doctor. Tag de [[${MASTER}]].`));
tiddlers.push(catTiddler("Image", "#bdc1c6", `Illustrations des cas cliniques. Tag de [[${MASTER}]].`));

// Portail
tiddlers.push({
  title: "🩺 El Doctor — Portail",
  tags: `[[${MASTER}]]`,
  color: "#d93025",
  text: `! 🩺 El Doctor — Psychopathologie (M17)

Base de révision importée depuis Obsidian. Explore par catégorie ou via le [[🕸 Graphe El Doctor]].

!! 🧠 Diagnostics & méthodologie
<<list-links "[tag[Diagnostic]sort[title]]">>

!! 🧩 Concepts clés
<<list-links "[tag[Concept clé]sort[title]]">>

!! ⚠️ Familles de troubles
<<list-links "[tag[Trouble]sort[title]]">>

!! 🗂 Cas cliniques
<<list-links "[tag[Cas clinique]sort[title]]">>

!! 🎯 Révisions
<<list-links "[tag[Révision]sort[title]]">>

!! ⚙️ Méta (config agent)
<<list-links "[tag[Méta]sort[title]]">>
`,
});

// Graphe dédié El Doctor
tiddlers.push({
  title: "🕸 Graphe El Doctor",
  tags: `[[${MASTER}]]`,
  color: "#d93025",
  text: `! 🕸 Graphe El Doctor

Réseau des notes de psychopathologie (liens \`[[...]]\` entre notes). Couleurs par catégorie.

<$let graphengine="Vis-Network">
<div style="height:74vh;border:1px solid #ddd;border-radius:10px;overflow:hidden;">
<$graph>
<$properties.stack>
<$list filter="[tag[${MASTER}]!tag[Image]!is[system]]">
<$node label={{{ [{!!caption}!is[blank]then{!!caption}] ~[{!!title}] }}} color={{!!color}} />
<$edges.typed $fields="[all[]] -[all[]]" />
</$list>
</$properties.stack>
</$graph>
</div>
</$let>
`,
});

fs.writeFileSync(OUT, JSON.stringify(tiddlers, null, 1));
console.log("Tiddlers générés:", tiddlers.length, "->", OUT);
const byType = {};
for (const t of tiddlers) byType[t.type || "wikitext"] = (byType[t.type||"wikitext"]||0)+1;
console.log("Par type:", JSON.stringify(byType));
