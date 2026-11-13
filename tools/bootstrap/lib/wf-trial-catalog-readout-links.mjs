/**
 * [REQ-WF_TRIAL_SUMMARIES_PUBLISH] [IMPL-WF_TRIAL_SUMMARIES_PUBLISH]
 */
import fs from "node:fs";
import path from "node:path";

const RECORDED_TRIALS_HEADING = /^## Recorded trials \(facilitator\)\s*$/m;
const READOUT_LINK_RE = /\]\((trial-readout-PROMPT-WF-[^)]+\.md)\)/g;

/**
 * @param {string} catalogMarkdown
 * @returns {{ href: string, prompt: string | null, line: number }[]}
 */
export function extractCatalogReadoutLinks(catalogMarkdown) {
  const split = catalogMarkdown.split(RECORDED_TRIALS_HEADING);
  if (split.length < 2) return [];
  const section = split[1];
  const lines = section.split("\n");
  /** @type {{ href: string, prompt: string | null, line: number }[]} */
  const out = [];
  const seen = new Set();
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("## ") && !line.includes("Recorded trials")) break;
    if (!line.startsWith("| PROMPT-WF-")) continue;
    const promptMatch = line.match(/^\| (PROMPT-WF-\d{2})/);
    const prompt = promptMatch ? promptMatch[1] : null;
    for (const m of line.matchAll(READOUT_LINK_RE)) {
      const href = m[1];
      if (seen.has(href)) continue;
      seen.add(href);
      out.push({ href, prompt, line: i + 1 });
    }
  }
  return out;
}

/**
 * @param {string} storeRoot
 */
export function loadCatalogReadoutLinks(storeRoot) {
  const catalogPath = path.join(
    storeRoot,
    "docs/demos/catalog-traditional-workflow-trial-prompts.md",
  );
  const md = fs.readFileSync(catalogPath, "utf8");
  return extractCatalogReadoutLinks(md);
}

/**
 * @param {string} storeRoot
 * @returns {string[]} basenames under docs/demos
 */
export function globWfTrialReadoutBasenames(storeRoot) {
  const demosDir = path.join(storeRoot, "docs/demos");
  return fs
    .readdirSync(demosDir)
    .filter((n) => n.startsWith("trial-readout-PROMPT-WF-") && n.endsWith(".md"));
}

/**
 * @param {string} storeRoot
 * @param {string[]} catalogHrefs
 * @param {string[]} onDisk
 */
export function diffOrphanReadouts(storeRoot, catalogHrefs, onDisk) {
  const catalogSet = new Set(catalogHrefs);
  const orphans = onDisk.filter((b) => !catalogSet.has(b));
  const missing = catalogHrefs.filter((h) => !onDisk.includes(h));
  return { orphans, missing };
}
