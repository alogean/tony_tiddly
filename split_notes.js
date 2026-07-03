#!/usr/bin/env node
// Éclate les grosses notes El Doctor en tiddlers atomiques reliés.
// Usage: node split_notes.js [--write]   (sans --write = dry-run)
const fs = require("fs");
const path = require("path");

const TDIR = path.join(__dirname, "wiki", "tiddlers");
const OUT = path.join(__dirname, "split_notes.json");
const WRITE = process.argv.includes("--write");
const MIN_CHARS = 150; // en-dessous, la section reste dans le parent

// Notes à découper (titre = nom de fichier .md)
const TARGETS = [
  "dsm5_criteres_complets",
  "DSM-5_Diagnostique_Differentiel",
  "semiologie_psychopathologique_complete",
  "dsm5_notes",
  "marche_a_suivre_etude_cas",
  "intro_psychopathologie",
  "cycle_eveil_sommeil_reve",
  "troubles_psychotiques",
  "troubles_anxieux",
  "troubles_depressifs",
  "troubles_substances",
  "troubles_somatiques",
  "troubles_personnalite",
  "troubles_sommeil",
  "troubles_humeur",
];

function readMeta(name) {
  const p = path.join(TDIR, name + ".md.meta");
  const meta = {};
  if (fs.existsSync(p)) {
    for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
      const m = line.match(/^([^:]+):\s*(.*)$/);
      if (m) meta[m[1].trim()] = m[2].trim();
    }
  }
  return meta;
}

function categoryFromTags(tags) {
  // enlève [[🩺 El Doctor]] et récupère la catégorie restante
  let t = (tags || "").replace("[[🩺 El Doctor]]", "").trim();
  const m = t.match(/\[\[([^\]]+)\]\]/);
  if (m) return m[1];
  return t.split(/\s+/).filter(Boolean)[0] || "Trouble";
}

function cleanHeading(h) {
  return h.replace(/^\d+[\.\)]\s*/, "").replace(/\s*[:：]\s*$/, "").trim();
}

const tiddlers = [];
const plan = [];

for (const parent of TARGETS) {
  const mdPath = path.join(TDIR, parent + ".md");
  if (!fs.existsSync(mdPath)) { console.error("MANQUANT:", parent); continue; }
  const meta = readMeta(parent);
  const caption = meta.caption || parent;
  const color = meta.color || "#a142f4";
  const category = categoryFromTags(meta.tags);
  const content = fs.readFileSync(mdPath, "utf8");

  // Sépare intro (avant le 1er ##) et sections
  const lines = content.split(/\r?\n/);
  let intro = [];
  const sections = [];
  let cur = null;
  for (const line of lines) {
    const h = line.match(/^##\s+(.+)$/);
    if (h) {
      if (cur) sections.push(cur);
      cur = { heading: h[1].trim(), body: [] };
    } else if (cur) {
      cur.body.push(line);
    } else {
      intro.push(line);
    }
  }
  if (cur) sections.push(cur);

  // Construit les enfants (sections assez longues)
  const children = [];   // {title, heading, bodyText}
  const shortInline = []; // sections courtes gardées dans le parent
  const usedTitles = {};
  for (const s of sections) {
    const ch = cleanHeading(s.heading);
    const bodyText = s.body.join("\n").trim();
    if (bodyText.replace(/\s/g, "").length < MIN_CHARS) {
      shortInline.push({ heading: ch, bodyText });
      continue;
    }
    let title = `${caption} — ${ch}`;
    if (usedTitles[title]) { usedTitles[title]++; title = `${title} (${usedTitles[title]})`; }
    else usedTitles[title] = 1;
    children.push({ title, heading: ch, bodyText });
  }

  // Génère les tiddlers enfants avec relations (parent + voisines)
  children.forEach((c, i) => {
    const prev = children[i - 1];
    const next = children[i + 1];
    let rel = `\n\n## Relations\n\n- Fait partie de → [[${parent}]]`;
    const vois = [];
    if (prev) vois.push(`[[${prev.title}]]`);
    if (next) vois.push(`[[${next.title}]]`);
    if (vois.length) rel += `\n- Sections voisines → ${vois.join(" · ")}`;
    const text = `# ${c.heading}\n\n> Section de [[${parent}]]\n\n${c.bodyText}${rel}`;
    tiddlers.push({
      title: c.title,
      type: "text/markdown",
      color,
      tags: `[[🩺 El Doctor]] [[${category}]] [[${parent}]]`,
      text,
    });
  });

  // Parent -> note-sommaire (MOC)
  let moc = `# ${caption}\n\n`;
  const introText = intro.join("\n").trim();
  if (introText) moc += introText + "\n\n";
  moc += `> **Note-sommaire (MOC)** — sections éclatées en tiddlers atomiques reliés (tag \`${parent}\`).\n\n---\n\n## Carte des sections\n\n`;
  children.forEach((c) => { moc += `- [[${c.title}]]\n`; });
  if (shortInline.length) {
    moc += `\n---\n`;
    for (const s of shortInline) moc += `\n## ${s.heading}\n\n${s.bodyText}\n`;
  }
  tiddlers.push({
    title: parent,
    type: "text/markdown",
    caption,
    color,
    tags: meta.tags || `[[🩺 El Doctor]] [[${category}]]`,
    text: moc,
  });

  plan.push(`${parent}: ${children.length} enfants` +
    (shortInline.length ? ` (+${shortInline.length} sections courtes gardées dans le parent)` : ""));
}

console.log("=== PLAN ===");
plan.forEach((p) => console.log(" -", p));
const nChildren = tiddlers.filter(t => t.tags.includes("]] [[") && /\]\] \[\[[^\]]+\]\]$/.test(t.tags)).length;
console.log(`\nTotal tiddlers générés: ${tiddlers.length} (dont ${TARGETS.length} parents MOC)`);

if (WRITE) {
  fs.writeFileSync(OUT, JSON.stringify(tiddlers, null, 1));
  console.log("Écrit ->", OUT);
} else {
  console.log("\n(dry-run — relance avec --write pour générer le JSON)");
}
