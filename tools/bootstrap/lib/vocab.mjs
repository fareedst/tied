/**
 * [IMPL-TIED_FILES] [IMPL-TIED_VOCABULARY_REFRESH] [ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM] [REQ-TIED_SETUP]
 * How: Methodology vocab refresh, client handoffs, doc filtering, link normalization.
 */
import fs from "node:fs";
import path from "node:path";
import {
  copyFileWithAttributes,
  copyTreeWithAttributes,
  warnModifiedCopyTarget,
  normalizeCopiedPathTimestamps,
} from "./copy-managed.mjs";
import { sayWarn } from "./console.mjs";

const CLIENT_ROUTING_TEMPLATE = `# Client vocabulary routing index

**Ownership:** Client-owned discovery handoff. TIED methodology vocabulary is refreshed under [\`../methodology/vocab/\`](../methodology/vocab/).

**Procedure:**
1. Read the [TIED methodology routing index](../methodology/vocab/routing.md) for methodology terms.
2. Read the client glossary routing table below for product terms.
3. PRELOAD only the matched glossary for the task.
4. Use the [client vocabulary catalog](domain-references.md) for cross-topic links.

---

## TIED methodology vocabulary

Use [\`../methodology/vocab/routing.md\`](../methodology/vocab/routing.md) for TIED layout, process, validation, and tooling concepts. Do not copy methodology terms into client glossaries.

## Client glossary routing table

| Pri | File | Keywords / When to read |
|-----|------|------------------------|
| — | Add client-owned glossary files here | Product-specific concepts, UI, storage, or runtime behavior |

## Ownership

Files under \`tied/vocab/\` are client-owned. Files under \`tied/methodology/vocab/\` are TIED-owned and are replaced during methodology refresh.

## Alphabetical index

| Term | Section |
|------|---------|
| client vocabulary routing index | Title |
| client glossary routing table | Client glossary routing table |
| TIED methodology vocabulary | TIED methodology vocabulary |
`;

const CLIENT_CATALOG_TEMPLATE = `# Client vocabulary catalog

**Scope:** Index of client-owned domain vocabulary. TIED methodology vocabulary is cataloged separately under [\`../methodology/vocab/domain-references.md\`](../methodology/vocab/domain-references.md).

**Procedure:** Read [\`routing.md\`](routing.md) first. Use the methodology catalog for TIED concepts and this catalog for client product concepts.

---

## TIED methodology catalog

The refreshable TIED vocabulary catalog is [\`../methodology/vocab/domain-references.md\`](../methodology/vocab/domain-references.md).

## Client canonical glossaries

| Priority | Document | Scope |
|----------|----------|-------|
| — | Add client-owned glossary files here | Product-specific concepts |

## Ownership

This catalog and all non-index glossaries in \`tied/vocab/\` are client-owned. The methodology catalog and its linked glossaries are refreshed under \`tied/methodology/vocab/\`.

## Alphabetical index

| Term | Section |
|------|---------|
| client canonical glossaries | Client canonical glossaries |
| client vocabulary catalog | Title |
| TIED methodology catalog | TIED methodology catalog |
`;

export function isSourceOnlyVocab(basename, sourceOnlyList) {
  return sourceOnlyList.includes(basename);
}

export function filterClientBootstrapDoc(source, destination, basename) {
  let text = fs.readFileSync(destination, "utf8");
  if (destination.includes(`${path.sep}methodology${path.sep}vocab${path.sep}`)) {
    text = text.replaceAll("](../docs/", "](../../docs/");
    text = text.replaceAll("](../../tools/", "](../../../tools/");
    text = text.replaceAll("](../../mcp-server/", "](../../../mcp-server/");
    text = text.replaceAll("](../../scripts/", "](../../../scripts/");
  }
  if (basename === "routing.md") {
    text = text
      .split(/\r?\n/)
      .filter((line) => !line.includes("prompt-composer.md"))
      .join("\n");
    if (!text.endsWith("\n") && text.length > 0) text += "\n";
  } else if (basename === "domain-references.md") {
    text = text
      .split(/\r?\n/)
      .filter((line) => !line.startsWith("| 5d |") && !line.startsWith("- **Prompt Composer"))
      .map((line) => line.replaceAll(" · [`prompt-composer.md`](prompt-composer.md)", ""))
      .join("\n");
  } else if (basename === "prompt-type-skills.md") {
    text = text.replaceAll(
      "**Vocabulary:** [`tied/vocab/prompt-composer.md`](../vocab/prompt-composer.md)",
      "**Vocabulary:** Prompt Composer terms are maintained in the TIED source repository and are not installed into clients."
    );
    text = text.replaceAll(
      "The canonical glossary is\n[`tied/vocab/prompt-composer.md`](../vocab/prompt-composer.md). The following\nterms were recorded for this skill implementation.",
      "Prompt Composer terms are recorded here for client skill context; the canonical glossary is maintained in the TIED source repository and is not installed into clients."
    );
    text = text.replaceAll(
      "1. Update `tied/vocab/prompt-composer.md` for new or renamed concepts.",
      "1. Update the source-only `tied/vocab/prompt-composer.md` glossary for new or renamed concepts."
    );
  }
  fs.writeFileSync(destination, text, "utf8");
  normalizeCopiedPathTimestamps(source, destination);
}

export function writeClientVocabHandoffs(clientVocabDest) {
  fs.mkdirSync(clientVocabDest, { recursive: true });
  const routing = path.join(clientVocabDest, "routing.md");
  const catalog = path.join(clientVocabDest, "domain-references.md");
  if (!fs.existsSync(routing)) {
    fs.writeFileSync(routing, CLIENT_ROUTING_TEMPLATE, "utf8");
  }
  if (!fs.existsSync(catalog)) {
    fs.writeFileSync(catalog, CLIENT_CATALOG_TEMPLATE, "utf8");
  }
}

export function refreshMethodologyVocab(vocabSrc, methodologyVocabDest, sourceOnlyList) {
  warnModifiedCopyTarget(methodologyVocabDest);
  if (fs.existsSync(methodologyVocabDest)) {
    fs.rmSync(methodologyVocabDest, { recursive: true, force: true });
  }
  fs.mkdirSync(methodologyVocabDest, { recursive: true });
  let count = 0;
  let total = 0;
  if (!fs.existsSync(vocabSrc)) {
    throw new Error(`VOCABULARY_SOURCE_MISSING: ${vocabSrc}`);
  }
  for (const name of fs.readdirSync(vocabSrc)) {
    if (!name.endsWith(".md")) continue;
    if (isSourceOnlyVocab(name, sourceOnlyList)) continue;
    total += 1;
    const src = path.join(vocabSrc, name);
    const dest = path.join(methodologyVocabDest, name);
    copyFileWithAttributes(src, dest);
    if (name === "routing.md" || name === "domain-references.md") {
      filterClientBootstrapDoc(src, dest, name);
    }
    count += 1;
  }
  sayWarn(
    `Copied ${count} of ${total} methodology vocabulary file(s) into ${methodologyVocabDest} (overwritten).`
  );
  return { count, total };
}

export function normalizeMethodologyVocabLinks(root) {
  const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  for (const current of walkMdFiles(root)) {
    let text = fs.readFileSync(current, "utf8");
    const normalized = text.replace(linkPattern, (full, label, target) => {
      const bare = target.split("#")[0].split("?")[0];
      if (
        !bare ||
        bare.startsWith("#") ||
        bare.startsWith("//") ||
        /^[a-z][a-z0-9+.-]*:/i.test(bare)
      ) {
        return full;
      }
      const resolved = path.resolve(path.dirname(current), bare);
      return fs.existsSync(resolved) ? full : label;
    });
    if (normalized !== text) {
      fs.writeFileSync(current, normalized, "utf8");
    }
  }
}

function* walkMdFiles(root) {
  if (!fs.existsSync(root)) return;
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const p = path.join(root, entry.name);
    if (entry.isDirectory()) yield* walkMdFiles(p);
    else if (entry.name.endsWith(".md")) yield p;
  }
}
