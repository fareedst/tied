/**
 * [REQ-WF_TRIAL_SUMMARIES_PUBLISH] [IMPL-WF_TRIAL_SUMMARIES_PUBLISH]
 * Insert missing master registry rows from catalog readout links (append-only).
 */
import fs from "node:fs";
import path from "node:path";

import { resolveAhePaths } from "./agent-harness-eval-docs-paths.mjs";
import { loadCatalogReadoutLinks } from "./wf-trial-catalog-readout-links.mjs";
import { loadReadoutRegistryFields } from "./wf-trial-readout-registry-fields.mjs";
import { formatMasterRow, parseMasterRow } from "./wf-trial-registry-refresh.mjs";

const MATRIX_SECTION = "## Latest-run comparison matrix";

/**
 * @param {string | null | undefined} prompt e.g. PROMPT-WF-03
 * @param {string | null} wfFromScrape
 */
function resolveWfColumn(prompt, wfFromScrape) {
  if (wfFromScrape && /^\d{2}$/.test(wfFromScrape)) return wfFromScrape;
  const m = prompt?.match(/^PROMPT-WF-(\d{2})$/);
  if (m) return m[1];
  return null;
}

/**
 * @param {string} storeRoot
 * @param {string} registryMd
 */
export function syncMasterRowsFromCatalogLinks(storeRoot, registryMd) {
  const links = loadCatalogReadoutLinks(storeRoot);
  const { readoutsDir } = resolveAhePaths(storeRoot);
  const lines = registryMd.split("\n");

  /** @type {Set<string>} */
  const existingReadouts = new Set();
  for (const line of lines) {
    const row = parseMasterRow(line);
    if (row) existingReadouts.add(path.basename(row.readout));
  }

  /** @type {string[]} */
  const insertedLines = [];
  /** @type {{ href: string; reason: string }[]} */
  const syncSkipped = [];

  for (const link of links) {
    const base = path.basename(link.href);
    if (existingReadouts.has(base)) continue;

    const readoutPath = path.join(readoutsDir, base);
    if (!fs.existsSync(readoutPath)) {
      syncSkipped.push({ href: base, reason: "missing_readout_file" });
      continue;
    }

    try {
      const fields = loadReadoutRegistryFields(storeRoot, base);
      const wf = resolveWfColumn(link.prompt, fields.wf);
      if (!wf || fields.clientId == null) {
        syncSkipped.push({ href: base, reason: "unscrapable_identity" });
        continue;
      }

      const row = {
        wf,
        clientId: String(fields.clientId),
        harness: fields.harness !== "—" ? fields.harness : "cursor",
        modelSlug: fields.modelSlug !== "—" ? fields.modelSlug : "—",
        exit: fields.exit,
        runTime: fields.runTime,
        grades: fields.gradesDisplay,
        latest: "no",
        readout: base,
      };
      insertedLines.push(formatMasterRow(row));
      existingReadouts.add(base);
    } catch {
      syncSkipped.push({ href: base, reason: "scrape_error" });
    }
  }

  const matrixIdx = lines.findIndex((l) => l.startsWith(MATRIX_SECTION));
  const insertAt = matrixIdx >= 0 ? matrixIdx : lines.length;
  if (insertedLines.length > 0) {
    lines.splice(insertAt, 0, ...insertedLines);
  }

  return {
    markdown: lines.join("\n"),
    insertedCount: insertedLines.length,
    insertedReadouts: insertedLines.map((l) => parseMasterRow(l)?.readout).filter(Boolean),
    syncSkipped,
  };
}