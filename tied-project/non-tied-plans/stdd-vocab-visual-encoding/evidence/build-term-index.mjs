#!/usr/bin/env node
/**
 * [stdd-vocab-visual-encoding] Generate term-domain-color-index.md from glossaries.
 * Usage: node build-term-index.mjs [--check]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(
  path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "../../../../mcp-server/package.json",
  ),
);
const yaml = require("js-yaml");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "../../../../");
const VOCAB = path.join(REPO, "tied-project/vocab");
const OUT = path.join(VOCAB, "term-domain-color-index.md");

const EXCLUDE = new Set([
  "visual-encoding-domains.md",
  "term-domain-color-index.md",
]);

const GLOSSARY_DEFAULTS = yaml.load(
  fs.readFileSync(path.join(VOCAB, "term-domain-glossary-defaults.yaml"), "utf8"),
);
const OVERRIDE_RAW = yaml.load(
  fs.readFileSync(path.join(VOCAB, "term-domain-overrides.yaml"), "utf8"),
);

/** @type {Map<string, { domain: string, sub_role?: string, notes?: string }>} */
const overrideMap = new Map();
for (const [key, val] of Object.entries(OVERRIDE_RAW.overrides ?? {})) {
  overrideMap.set(norm(key), {
    domain: val.domain,
    sub_role: val.sub_role,
    notes: val.notes,
  });
}

function norm(s) {
  return s.trim().toLowerCase();
}

function canonicalDisplay(terms) {
  const first = terms[0];
  return first;
}

/** @type {Map<string, { term: string, sources: Set<string>, domain: string, sub_role: string, notes: string[] }>} */
const index = new Map();

function addTerm(term, sourceFile) {
  const t = term.trim();
  if (!t || t.includes("(proposed)")) return;
  if (t.startsWith("[") && t.endsWith("]")) return;
  const key = norm(t);
  const glossaryDomain =
    GLOSSARY_DEFAULTS.defaults[sourceFile] ?? "dom.tiedCorpus";
  let ov = overrideMap.get(key);
  if (!ov && (/^\[?PROC-/i.test(t) || /^PROC-/i.test(t))) {
    ov = {
      domain: "dom.tiedCorpus",
      sub_role: "tokenRegistry",
      notes: "Process token",
    };
  }
  const domain = ov?.domain ?? glossaryDomain;
  const sub_role = ov?.sub_role ?? "—";
  const noteFromOverride = ov?.notes;

  if (!index.has(key)) {
    index.set(key, {
      term: t.replace(/\*\*/g, ""),
      sources: new Set([sourceFile]),
      domain,
      sub_role,
      notes: noteFromOverride ? [noteFromOverride] : [],
    });
  } else {
    const row = index.get(key);
    row.sources.add(sourceFile);
    if (ov) {
      row.domain = domain;
      if (sub_role !== "—") row.sub_role = sub_role;
      if (noteFromOverride && !row.notes.includes(noteFromOverride)) {
        row.notes.push(noteFromOverride);
      }
    } else if (row.domain !== domain) {
      row.notes.push(
        `Domain conflict: ${[...row.sources].join(", ")} vs ${sourceFile} (kept ${row.domain})`,
      );
    }
  }
}

function extractFromMarkdown(content, sourceFile) {
  const lines = content.split("\n");
  let inAlpha = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^## Alphabetical index/i.test(line)) inAlpha = true;
    if (/^## /i.test(line) && !/^## Alphabetical/i.test(line)) {
      if (inAlpha && i > 0) inAlpha = false;
    }

    const pref = line.match(/^\|\s*\*\*([^*|]+)\*\*\s*\|/);
    if (pref) addTerm(pref[1], sourceFile);

    const bullet = line.match(/^-\s+\*\*([^*]+)\*\*/);
    if (bullet) addTerm(bullet[1], sourceFile);

    if (inAlpha) {
      const alpha = line.match(/^\|\s*([^|]+)\s*\|\s*[^|]+\s*\|/);
      if (alpha && !alpha[1].includes("---") && alpha[1].trim() !== "Term") {
        addTerm(alpha[1].replace(/\*\*/g, "").trim(), sourceFile);
      }
    }
  }
}

function listGlossaryFiles() {
  return fs
    .readdirSync(VOCAB)
    .filter((f) => f.endsWith(".md") && !EXCLUDE.has(f))
    .sort();
}

function buildMarkdown() {
  const files = listGlossaryFiles();
  for (const f of files) {
    extractFromMarkdown(fs.readFileSync(path.join(VOCAB, f), "utf8"), f);
  }

  const rows = [...index.values()].sort((a, b) =>
    a.term.localeCompare(b.term, undefined, { sensitivity: "base" }),
  );

  const bySource = new Map();
  for (const row of rows) {
    for (const src of row.sources) {
      if (!bySource.has(src)) bySource.set(src, []);
      bySource.get(src).push(row);
    }
  }

  let md = `# Term domain color index (canonical)

**Scope:** Parallel map from client glossary terms to [visual-encoding-domains.md](visual-encoding-domains.md) \`dom.*\` ids.

**Traceability:** [\`[PROC-VOCABULARY_INDEX]\`](../../tied-bundle/docs/processes.md) · [stdd-vocab-visual-encoding PLAN](../non-tied-plans/stdd-vocab-visual-encoding/PLAN.md) · [@informative-color-coding](../../.cursor/skills/informative-color-coding/SKILL.md)

**See also:** [\`routing.md\`](routing.md) · [\`domain-references.md\`](domain-references.md) · [\`visual-encoding-domains.md\`](visual-encoding-domains.md) · [visual-encoding-standards.md](../../docs/visual-encoding-standards.md)

**Precedence:** See domain registry § Assignment precedence.

**Row count:** ${rows.length} canonical rows (post-dedupe).

**Regenerate:** \`node tied-project/non-tied-plans/stdd-vocab-visual-encoding/evidence/build-term-index.mjs\`

---

`;

  const emitSourceSection = (f) => {
    const sectionRows = (bySource.get(f) ?? []).sort((a, b) =>
      a.term.localeCompare(b.term),
    );
    if (!sectionRows.length) return;
    const title = f.replace(/\.md$/, "").replace(/-/g, " ");
    md += `## ${title}\n\nSource: [${f}](${f})\n\n`;
    md += `| Term | Primary domain | Sub-role | Notes |\n| --- | --- | --- | --- |\n`;
    for (const r of sectionRows) {
      const notes =
        r.notes.length > 0
          ? r.notes.join("; ")
          : r.sources.size > 1
            ? `Also: ${[...r.sources].filter((s) => s !== f).join(", ")}`
            : "—";
      const display = r.term.replace(/`/g, "");
      md += `| **${display}** | \`${r.domain}\` | ${r.sub_role === "—" ? "—" : r.sub_role} | ${notes} |\n`;
    }
    md += "\n";
  };

  for (const f of files) {
    if (f === "routing.md" || f === "domain-references.md") continue;
    emitSourceSection(f);
  }
  emitSourceSection("domain-references.md");
  emitSourceSection("routing.md");

  md += `## Master index (alphabetical)\n\n`;
  md += `| Term | Primary domain | Sub-role | Glossary source | Notes |\n| --- | --- | --- | --- | --- |\n`;
  for (const r of rows) {
    const src = [...r.sources].sort().join(", ");
    const notes = r.notes.length ? r.notes.join("; ") : "—";
    const display = r.term.replace(/`/g, "");
    md += `| **${display}** | \`${r.domain}\` | ${r.sub_role === "—" ? "—" : r.sub_role} | ${src} | ${notes} |\n`;
  }

  md += `\n## Alphabetical index\n\n`;
  md += `| Term | Section |\n| --- | --- |\n`;
  md += `| Parallel map | Scope |\n`;
  md += `| Precedence | Scope |\n`;
  md += `| Row count | Scope |\n`;
  md += `| Regenerate | Scope |\n`;

  return { md, rowCount: rows.length };
}

const check = process.argv.includes("--check");
const { md, rowCount } = buildMarkdown();
console.log(`DEBUG: TRACE: index rows=${rowCount}`);

if (check) {
  const existing = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8") : "";
  const existingCount = existing.match(/\*\*Row count:\*\*/);
  if (existingCount && !existing.includes(`**Row count:** ${rowCount}`)) {
    console.error(`DIAGNOSTIC: row count drift (existing vs ${rowCount})`);
    process.exit(1);
  }
  process.exit(0);
}

fs.writeFileSync(OUT, md);
console.log(`Wrote ${OUT} (${rowCount} rows)`);