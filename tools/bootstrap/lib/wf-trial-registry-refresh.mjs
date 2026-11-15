/**
 * [REQ-WF_TRIAL_SUMMARIES_PUBLISH] [IMPL-WF_TRIAL_SUMMARIES_PUBLISH]
 */
import fs from "node:fs";
import path from "node:path";

import { resolveAhePaths } from "./agent-harness-eval-docs-paths.mjs";
import { loadReadoutRegistryFields } from "./wf-trial-readout-registry-fields.mjs";

const MASTER_HEADER =
  "| WF | Client ID | Harness | Model slug | Exit | Run time | Grades | Latest | Readout |";
const MASTER_ROW_RE =
  /^(\| \d{2} \|)([^|]*)(\|[^|]*\|[^|]*\|[^|]*\|[^|]*\|[^|]*\|[^|]*\|[^|]*\| \[readout\]\([^)]+\) \|)/;

/**
 * @param {string} line
 */
export function parseMasterRow(line) {
  const m = line.match(
    /^\| (\d{2}) \| ([^|]+) \| ([^|]+) \| `?([^`|]+)`? \| ([^|]+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \| \[readout\]\(([^)]+)\) \|/,
  );
  if (!m) return null;
  return {
    wf: m[1],
    clientId: m[2].trim(),
    harness: m[3].trim(),
    modelSlug: m[4].trim(),
    exit: m[5].trim(),
    runTime: m[6].trim(),
    grades: m[7].trim(),
    latest: m[8].trim(),
    readout: m[9].trim(),
    line,
  };
}

function formatMasterRow(row) {
  const slugCell = row.modelSlug === "—" ? "—" : `\`${row.modelSlug}\``;
  return `| ${row.wf} | ${row.clientId} | ${row.harness} | ${slugCell} | ${row.exit} | ${row.runTime} | ${row.grades} | ${row.latest} | [readout](${row.readout}) |`;
}

/**
 * @param {ReturnType<typeof parseMasterRow>[]} rows
 */
export function recomputeLatestForCell(rows) {
  /** @type {Map<string, ReturnType<typeof parseMasterRow>[]>} */
  const groups = new Map();
  for (const row of rows) {
    if (!row || row.clientId === "—") {
      if (row) row.latest = "n/a";
      continue;
    }
    const key = `${row.wf}|${row.harness}|${row.modelSlug}`;
    const list = groups.get(key) ?? [];
    list.push(row);
    groups.set(key, list);
  }
  for (const list of groups.values()) {
    const ids = list.map((r) => Number(r.clientId)).filter((n) => Number.isFinite(n));
    const maxId = ids.length ? Math.max(...ids) : null;
    for (const row of list) {
      const id = Number(row.clientId);
      row.latest = maxId != null && id === maxId ? "yes" : "no";
    }
  }
}

/**
 * Refresh grades, exit, run time from readout files; recompute Latest.
 * @param {string} storeRoot
 * @param {string} registryMd
 */
export function refreshRegistryFromReadouts(storeRoot, registryMd) {
  const lines = registryMd.split("\n");
  /** @type {ReturnType<typeof parseMasterRow>[]} */
  const rows = [];
  const indices = [];
  for (let i = 0; i < lines.length; i++) {
    const row = parseMasterRow(lines[i]);
    if (!row) continue;
    const readoutPath = path.join(
      resolveAhePaths(storeRoot).readoutsDir,
      path.basename(row.readout),
    );
    if (fs.existsSync(readoutPath)) {
      try {
        const fields = loadReadoutRegistryFields(storeRoot, row.readout);
        if (fields.gradesDisplay !== "—") row.grades = fields.gradesDisplay;
        if (fields.exit !== "—") row.exit = fields.exit;
        if (fields.runTime !== "—") row.runTime = fields.runTime;
        if (fields.harness !== "—") row.harness = fields.harness;
        if (fields.modelSlug !== "—" && row.modelSlug === "—") {
          row.modelSlug = fields.modelSlug;
        }
      } catch {
        /* keep row as-is */
      }
    }
    rows.push(row);
    indices.push(i);
  }
  recomputeLatestForCell(rows);
  for (let j = 0; j < rows.length; j++) {
    lines[indices[j]] = formatMasterRow(rows[j]);
  }
  return { markdown: lines.join("\n"), masterRowCount: rows.length };
}

/**
 * @param {string} md
 * @param {number} rowCount
 * @param {string} dateIso YYYY-MM-DD
 */
export function patchRegistryHeader(md, rowCount, dateIso) {
  let updated = md.replace(
    /\|\s*\*\*Rows\*\*\s*\|\s*\*\*\d+\*\*/,
    `| **Rows** | **${rowCount}**`,
  );
  updated = updated.replace(
    /\|\s*\*\*Last updated\*\*\s*\|\s*[^\|]+/,
    `| **Last updated** | ${dateIso}`,
  );
  return updated;
}

/**
 * @param {string} storeRoot
 * @param {{ write?: boolean }} opts
 */
export function refreshTraditionalWorkflowTrialRunsRegistry(storeRoot, opts = {}) {
  const registryPath = resolveAhePaths(storeRoot).registry;
  const md = fs.readFileSync(registryPath, "utf8");
  const { markdown, masterRowCount } = refreshRegistryFromReadouts(storeRoot, md);
  const today = new Date().toISOString().slice(0, 10);
  const patched = patchRegistryHeader(markdown, masterRowCount, today);
  if (opts.write !== false) {
    fs.writeFileSync(registryPath, patched);
  }
  return { registryPath, masterRowCount, markdown: patched };
}
