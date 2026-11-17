#!/usr/bin/env node
/**
 * Build Latest-run comparison matrix section for traditional-workflow-trial-runs-registry.md
 * [REQ-WF_TRIAL_REGISTRY_COMPARISON_MATRIX_CELLS] [REQ-WF_TRIAL_SUMMARIES_PUBLISH]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

import { resolveAhePaths } from "./agent-harness-eval-docs-paths.mjs";
import { TIED_REPO_ROOT } from "./constants.mjs";
import {
  formatMatrixWallMins,
  MATRIX_COLUMNS,
  matrixKeyToColumn,
  renderWfTrialComparisonMatrixCell,
  toolsetKeyFromMasterRow,
} from "./wf-trial-comparison-matrix.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = TIED_REPO_ROOT;

/** Master table WF column: PROMPT-WF-01…NN (any two-digit index present in registry). */
const MASTER_ROW_RE =
  /^\| (\d{2}) \| ([^|]+) \| ([^|]+) \| `?([^`|]+)`? \| ([^|]+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \| \[readout\]\(([^)]+)\) \|/;

/**
 * @param {string} root
 */
function loadSpecs(root) {
  const specPath = resolveAhePaths(root).modelSpecsYaml;
  return yaml.load(fs.readFileSync(specPath, "utf8"));
}

/**
 * @param {string} md
 */
function parseMasterRows(md) {
  const rows = [];
  for (const line of md.split("\n")) {
    const m = line.match(MASTER_ROW_RE);
    if (!m) continue;
    const clientId = m[2].trim();
    if (clientId === "—") continue;
    const gradesRaw = m[7].trim();
    const meanMatch = gradesRaw.match(/^([\d.]+)/);
    rows.push({
      wf: m[1],
      clientId: Number(clientId),
      harness: m[3].trim(),
      slug: m[4].trim(),
      runTime: m[6].trim(),
      gradeMean: meanMatch ? meanMatch[1] : "—",
      gradesDisplay: gradesRaw,
      readout: m[9].trim(),
    });
  }
  return rows;
}

/**
 * @param {ReturnType<typeof parseMasterRows>} rows
 */
function matrixPromptWfIndices(rows) {
  let maxWf = 8;
  for (const row of rows) {
    const n = Number(row.wf);
    if (Number.isFinite(n) && n > maxWf) maxWf = n;
  }
  const indices = [];
  for (let n = 1; n <= maxWf; n++) {
    indices.push(String(n).padStart(2, "0"));
  }
  return indices;
}

/**
 * @param {object} row
 */
function cellMarkdown(row) {
  return renderWfTrialComparisonMatrixCell({
    wallSeconds: row.runTime,
    gradesDisplay: row.gradesDisplay,
    readout: row.readout,
  });
}

/**
 * @param {Map<string, object>} best
 * @param {string[]} wfIndices
 */
export function buildMatrixSection(best, wfIndices) {
  const headerCells = MATRIX_COLUMNS.map((c) => c.header);
  const lines = [
    "## Latest-run comparison matrix",
    "",
    "Facilitator **cross-toolset** view: same **PROMPT-WF-NN**, newest recorded run per **`toolset_key`** (harness + catalog config + optional effort). Store documentation only — not methodology effectiveness or a model leaderboard. Per-run history and duplicates: [Master runs table](#master-runs-table) above.",
    "",
    "Each cell: orchestrator **wall_mins** (nearest integer, `m` suffix, four sponsor turns) · session **Grades** (`mean · Req/Tr/Ts/Al/Pr/Ch/Ml` from master table) · readout link.",
    "",
    `| Prompt | ${headerCells.join(" | ")} |`,
    `| --- | ${MATRIX_COLUMNS.map(() => "---").join(" | ")} |`,
  ];

  for (const wf of wfIndices) {
    const label = `[PROMPT-WF-${wf}](catalog-traditional-workflow-trial-prompts.md#prompt-wf-${wf})`;
    const cells = MATRIX_COLUMNS.map((col) => {
      const hit = best.get(`${wf}|${col.key}`);
      return hit ? cellMarkdown(hit) : "—";
    });
    lines.push(`| ${label} | ${cells.join(" | ")} |`);
  }
  lines.push(`| Prompt | ${headerCells.join(" | ")} |`);
  lines.push("");
  return lines.join("\n");
}

const SPOT_CHECKS = [
  {
    wf: "08",
    key: "cursor:composer-2.5",
    wallMins: "12m",
    gradesIncludes: "3.57 ·",
    readoutIncludes: "1794211741",
  },
  {
    wf: "01",
    key: "cursor:composer-2.5",
    wallMins: "19m",
    gradesIncludes: "3.87 ·",
    readoutIncludes: "1794256930",
  },
  {
    wf: "03",
    key: "cursor:composer-2.5",
    wallMins: "15m",
    gradesIncludes: "3.87 ·",
    readoutIncludes: "1794264348",
  },
  {
    wf: "09",
    key: "claude:claude-haiku-5-5",
    wallMins: "4m",
    gradesIncludes: "2.56 ·",
    readoutIncludes: "1794880253",
  },
  {
    wf: "09",
    key: "cursor:grok47-low",
    wallMins: "12m",
    gradesIncludes: "2.56 ·",
    readoutIncludes: "1794608051",
  },
  {
    wf: "09",
    key: "claude:claude-haiku-5-5@medium",
    wallMins: "5m",
    gradesIncludes: "3.06 ·",
    readoutIncludes: "1794350349",
  },
  {
    wf: "10",
    key: "claude:claude-haiku-5-5@medium",
    wallMins: "7m",
    gradesIncludes: "3.29 ·",
    readoutIncludes: "1794407806",
  },
  {
    wf: "10",
    key: "claude:claude-sonnet-5-5@high",
    wallMins: "12m",
    gradesIncludes: "3.86 ·",
    readoutIncludes: "1794411691",
  },
  {
    wf: "10",
    key: "claude:claude-haiku-5-5@high",
    wallMins: "14m",
    gradesIncludes: "3.71 ·",
    readoutIncludes: "1794409094",
  },
  {
    wf: "09",
    key: "claude:claude-sonnet-5-5@high",
    wallMins: "13m",
    gradesIncludes: "3.63 ·",
    readoutIncludes: "1794353174",
  },
  {
    wf: "09",
    key: "claude:claude-sonnet-5-5",
    wallMins: "4m",
    gradesIncludes: "3.33 ·",
    readoutIncludes: "1794586024",
  },
];

/**
 * @param {Map<string, object>} best
 */
export function runMatrixSpotChecks(best) {
  let ok = true;
  for (const spot of SPOT_CHECKS) {
    const row = best.get(`${spot.wf}|${spot.key}`);
    if (!row) {
      console.error(`CHECK FAIL: missing ${spot.wf} ${spot.key}`);
      ok = false;
      continue;
    }
    const wallMins = formatMatrixWallMins(row.runTime);
    if (wallMins !== spot.wallMins) {
      console.error(`CHECK FAIL: ${spot.key} wallMins ${wallMins} !== ${spot.wallMins}`);
      ok = false;
    }
    if (!row.gradesDisplay.includes(spot.gradesIncludes)) {
      console.error(`CHECK FAIL: ${spot.key} grades ${row.gradesDisplay}`);
      ok = false;
    }
    if (!row.readout.includes(spot.readoutIncludes)) {
      console.error(`CHECK FAIL: readout ${row.readout}`);
      ok = false;
    }
  }
  return ok;
}

/**
 * @param {string} registryMd
 * @param {string} root
 */
export function buildBestCellsMap(registryMd, root) {
  const rows = parseMasterRows(registryMd);
  /** @type {Map<string, object>} */
  const best = new Map();
  for (const row of rows) {
    const key = toolsetKeyFromMasterRow(row, { repoRoot: root });
    if (!key || !matrixKeyToColumn.has(key)) continue;
    const mapKey = `${row.wf}|${key}`;
    const prev = best.get(mapKey);
    if (!prev || row.clientId > prev.clientId) best.set(mapKey, row);
  }
  return { rows, best };
}

/**
 * @param {string} root
 * @param {{ write?: boolean, checkOnly?: boolean }} opts
 */
export function patchRegistryComparisonMatrix(root, opts = {}) {
  const REGISTRY = resolveAhePaths(root).registry;
  const md = fs.readFileSync(REGISTRY, "utf8");
  const { rows, best } = buildBestCellsMap(md, root);

  if (opts.checkOnly) {
    return runMatrixSpotChecks(best);
  }

  const wfIndices = matrixPromptWfIndices(rows);
  const section = buildMatrixSection(best, wfIndices);

  const footAnchor = "\n---\n\n## Footnotes";
  if (!md.includes(footAnchor)) throw new Error("Footnotes anchor missing");
  let updated;
  if (md.includes("## Latest-run comparison matrix")) {
    const start = md.indexOf("## Latest-run comparison matrix");
    const end = md.indexOf(footAnchor);
    updated = md.slice(0, start) + section + footAnchor + md.slice(end + footAnchor.length);
  } else {
    const footnoteBullet =
      "- **Comparison matrix:** Newest run per **`toolset_key`** (`{harness}:{config_id}` optional `@medium`/`@high`); not the same grouping as master **Latest** (`WF`, harness, model slug only).\n";
    updated = md.replace(footAnchor, `\n${section}${footAnchor}`);
    if (!updated.includes("Comparison matrix:")) {
      updated = updated.replace(
        "## Footnotes\n\n",
        `## Footnotes\n\n${footnoteBullet}`,
      );
    }
  }

  if (opts.write !== false) {
    fs.writeFileSync(REGISTRY, updated);
  }
  const ok = runMatrixSpotChecks(best);
  return { ok, rowCount: rows.length, updated };
}

function main() {
  const root =
    process.argv.find((a) => a.startsWith("--store-root="))?.split("=")[1] ??
    DEFAULT_ROOT;
  loadSpecs(root);
  if (process.argv.includes("--check")) {
    const md = fs.readFileSync(resolveAhePaths(root).registry, "utf8");
    const { best } = buildBestCellsMap(md, root);
    process.exit(runMatrixSpotChecks(best) ? 0 : 1);
  }
  const result = patchRegistryComparisonMatrix(root, { write: true });
  console.log(
    "DEBUG: parsed",
    result.rowCount,
    "master rows; matrix cells from refreshed registry",
  );
  if (!result.ok) process.exit(1);
  console.log("OK: comparison matrix written");
}

const isMain =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) main();
