#!/usr/bin/env node
/**
 * Build Latest-run comparison matrix section for traditional-workflow-trial-runs-registry.md
 * [PLAN-WF-TRIAL-COMPARISON-MATRIX] [REQ-WF_TRIAL_REGISTRY_COMPARISON_MATRIX_CELLS]
 * [REQ-WF_TRIAL_COMPARISON_MATRIX_TOOLSET_FIX]
 * [REQ-WF_TRIAL_MATRIX_COLUMN_EFFORT_HEADERS]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

import {
  formatMatrixWallMins,
  MATRIX_COLUMNS,
  matrixKeyToColumn,
  renderWfTrialComparisonMatrixCell,
  toolsetKeyFromMasterRow,
} from "../../../../tools/bootstrap/lib/wf-trial-comparison-matrix.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
const REGISTRY = path.join(ROOT, "docs/demos/traditional-workflow-trial-runs-registry.md");

/** Master table WF column: PROMPT-WF-01…NN (any two-digit index present in registry). */
const MASTER_ROW_RE =
  /^\| (\d{2}) \| ([^|]+) \| ([^|]+) \| `?([^`|]+)`? \| ([^|]+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \| \[readout\]\(([^)]+)\) \|/;

function loadSpecs() {
  const specPath = path.join(ROOT, "docs/demos/wf-trial-model-specs.yaml");
  return yaml.load(fs.readFileSync(specPath, "utf8"));
}

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
 * Prompt indices for matrix rows: 01 … max(WF) seen in master table (minimum 08 for legacy shape).
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

function cellMarkdown(row) {
  return renderWfTrialComparisonMatrixCell({
    wallSeconds: row.runTime,
    gradesDisplay: row.gradesDisplay,
    readout: row.readout,
  });
}

function buildMatrixSection(best, wfIndices) {
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
    wallMins: "3m",
    gradesIncludes: "2.56 ·",
    readoutIncludes: "1794582335",
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
    key: "claude:claude-sonnet-5-5",
    wallMins: "12m",
    gradesIncludes: "3.86 ·",
    readoutIncludes: "1794411691",
  },
];

function runCheck(best) {
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

function main() {
  loadSpecs(); // validate yaml present
  const md = fs.readFileSync(REGISTRY, "utf8");
  const rows = parseMasterRows(md);
  /** @type {Map<string, object>} */
  const best = new Map();

  for (const row of rows) {
    const key = toolsetKeyFromMasterRow(row, { repoRoot: ROOT });
    if (!key || !matrixKeyToColumn.has(key)) continue;
    const mapKey = `${row.wf}|${key}`;
    const prev = best.get(mapKey);
    if (!prev || row.clientId > prev.clientId) best.set(mapKey, row);
  }

  if (process.argv.includes("--check")) {
    process.exit(runCheck(best) ? 0 : 1);
  }

  const wfIndices = matrixPromptWfIndices(rows);
  const section = buildMatrixSection(best, wfIndices);
  if (process.argv.includes("--stdout")) {
    process.stdout.write(section);
    return;
  }

  const footAnchor = "\n---\n\n## Footnotes";
  if (!md.includes(footAnchor)) throw new Error("Footnotes anchor missing");
  if (md.includes("## Latest-run comparison matrix")) {
    const start = md.indexOf("## Latest-run comparison matrix");
    const end = md.indexOf(footAnchor);
    const updated = md.slice(0, start) + section + footAnchor + md.slice(end + footAnchor.length);
    fs.writeFileSync(REGISTRY, updated);
  } else {
    const footnoteBullet =
      "- **Comparison matrix:** Newest run per **`toolset_key`** (`{harness}:{config_id}` optional `@medium`/`@high`); not the same grouping as master **Latest** (`WF`, harness, model slug only).\n";
    let updated = md.replace(footAnchor, `\n${section}${footAnchor}`);
    if (!updated.includes("Comparison matrix:")) {
      updated = updated.replace(
        "## Footnotes\n\n",
        `## Footnotes\n\n${footnoteBullet}`,
      );
    }
    fs.writeFileSync(REGISTRY, updated);
  }
  console.log(
    "DEBUG: parsed",
    rows.length,
    "master rows;",
    wfIndices.length,
    "prompt rows (01–" + wfIndices.at(-1) + ");",
    "matrix cells",
    best.size,
  );
  if (!runCheck(best)) process.exit(1);
  console.log("OK: comparison matrix written to", REGISTRY);
}

main();
