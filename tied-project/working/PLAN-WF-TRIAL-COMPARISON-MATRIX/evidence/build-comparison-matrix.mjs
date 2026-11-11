#!/usr/bin/env node
/**
 * Build Latest-run comparison matrix section for traditional-workflow-trial-runs-registry.md
 * [PLAN-WF-TRIAL-COMPARISON-MATRIX]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
const REGISTRY = path.join(ROOT, "docs/demos/traditional-workflow-trial-runs-registry.md");

const COLUMNS = [
  { id: "cursor-composer-2.5", header: "Cursor · `composer-2.5`", key: "cursor:composer-2.5" },
  { id: "cursor-luna-low", header: "Cursor · `luna-low`", key: "cursor:luna-low" },
  { id: "cursor-luna-med", header: "Cursor · `luna-med`", key: "cursor:luna-med" },
  { id: "cursor-luna-high", header: "Cursor · `luna-high`", key: "cursor:luna-high" },
  { id: "cursor-grok47-med", header: "Cursor · `grok47-med`", key: "cursor:grok47-med" },
  { id: "claude-composer-2.5", header: "Claude · `composer-2.5` (Haiku)", key: "claude:composer-2.5" },
  { id: "claude-sonnet-5-5", header: "Claude · `claude-sonnet-5-5`", key: "claude:claude-sonnet-5-5" },
  {
    id: "cursor-composer-2.5@medium",
    header: "Cursor · `composer-2.5` effort=medium",
    key: "cursor:composer-2.5@medium",
  },
  {
    id: "cursor-composer-2.5@high",
    header: "Cursor · `composer-2.5` effort=high",
    key: "cursor:composer-2.5@high",
  },
  { id: "cursor-luna-low@medium", header: "Cursor · `luna-low` effort=medium", key: "cursor:luna-low@medium" },
  {
    id: "claude-composer-2.5@medium",
    header: "Claude · Haiku effort=medium",
    key: "claude:composer-2.5@medium",
  },
];

const SLUG_TO_CONFIG = {
  "composer-2.5-fast": "composer-2.5",
  "gpt-5.6-luna-low-fast": "luna-low",
  "gpt-5.6-luna-medium-fast": "luna-med",
  "gpt-5.6-luna-high-fast": "luna-high",
  "grok-4.7-medium-fast": "grok47-med",
  "claude-haiku-5-5": "composer-2.5",
  "claude-sonnet-5-5": "claude-sonnet-5-5",
};

const EFFORT_MEDIUM_RE =
  /composer25medium|lunalowmedium|haiku55medium|claudesonnet55medium|luna-low-medium|claude-haiku55medium/i;
const EFFORT_HIGH_RE =
  /composer25high|composer25-high|haiku55high|claudesonnet55high|sonnet55high/i;

/** Master table WF column: PROMPT-WF-01…NN (any two-digit index present in registry). */
const MASTER_ROW_RE =
  /^\| (\d{2}) \| ([^|]+) \| ([^|]+) \| `?([^`|]+)`? \| ([^|]+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \| \[readout\]\(([^)]+)\) \|/;

/** @type {Map<string, typeof COLUMNS[0]>} */
const keyToColumn = new Map(COLUMNS.map((c) => [c.key, c]));

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
      readout: m[9].trim(),
    });
  }
  return rows;
}

function effortFromReadout(readoutPath) {
  const base = path.basename(readoutPath);
  if (EFFORT_HIGH_RE.test(base)) return "high";
  if (EFFORT_MEDIUM_RE.test(base)) return "medium";
  const full = path.join(ROOT, "docs/demos", readoutPath);
  if (fs.existsSync(full)) {
    const body = fs.readFileSync(full, "utf8");
    if (/model_effort=high/.test(body)) return "high";
    if (/model_effort=medium/.test(body)) return "medium";
  }
  return null;
}

function configFromRow(row) {
  let config = SLUG_TO_CONFIG[row.slug];
  if (!config) {
    if (row.slug.includes("luna") && row.slug.includes("medium")) config = "luna-med";
    else if (row.slug.includes("grok")) config = "grok47-med";
    else return null;
  }
  if (row.harness === "claude" && row.slug === "claude-sonnet-5-5") {
    config = "claude-sonnet-5-5";
  }
  return config;
}

function toolsetKey(row) {
  const config = configFromRow(row);
  if (!config) return null;
  const effort = effortFromReadout(row.readout);
  const base = `${row.harness}:${config}`;
  if (effort === "medium" || effort === "high") {
    const keyed = `${base}@${effort}`;
    if (keyToColumn.has(keyed)) return keyed;
    // e.g. claude:composer-2.5@high — no dedicated column; pivot uses baseline Haiku cell.
    if (keyToColumn.has(base)) return base;
    return null;
  }
  if (effort) return null;
  return base;
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
  const rt = row.runTime === "—" ? "—" : `${row.runTime}s`;
  const gm = row.gradeMean === "—" ? "—" : row.gradeMean;
  if (rt === "—" && gm === "—") return "—";
  return `**${rt}**<br>**${gm}**<br>[readout](${row.readout})`;
}

function buildMatrixSection(best, wfIndices) {
  const headerCells = COLUMNS.map((c) => c.header);
  const lines = [
    "## Latest-run comparison matrix",
    "",
    "Facilitator **cross-toolset** view: same **PROMPT-WF-NN**, newest recorded run per **`toolset_key`** (harness + catalog config + optional effort). Store documentation only — not methodology effectiveness or a model leaderboard. Per-run history and duplicates: [Master runs table](#master-runs-table) above.",
    "",
    "Each cell: orchestrator **wall time** (seconds, four sponsor turns) · session grade **mean** (0.00–4.00) · readout link.",
    "",
    `| Prompt | ${headerCells.join(" | ")} |`,
    `| --- | ${COLUMNS.map(() => "---").join(" | ")} |`,
  ];

  for (const wf of wfIndices) {
    const label = `[PROMPT-WF-${wf}](catalog-traditional-workflow-trial-prompts.md#prompt-wf-${wf})`;
    const cells = COLUMNS.map((col) => {
      const hit = best.get(`${wf}|${col.key}`);
      return hit ? cellMarkdown(hit) : "—";
    });
    lines.push(`| ${label} | ${cells.join(" | ")} |`);
  }
  lines.push("");
  return lines.join("\n");
}

const SPOT_CHECKS = [
  { wf: "08", key: "cursor:composer-2.5", runTime: "706", gradeMean: "3.57", readoutIncludes: "1794211741" },
  { wf: "01", key: "cursor:composer-2.5@medium", runTime: "1125", gradeMean: "3.87", readoutIncludes: "1794256930" },
  { wf: "03", key: "cursor:composer-2.5@high", runTime: "870", gradeMean: "3.87", readoutIncludes: "1794264348" },
  { wf: "09", key: "claude:composer-2.5@medium", runTime: "296", gradeMean: "3.06", readoutIncludes: "1794350349" },
  { wf: "10", key: "claude:composer-2.5@medium", runTime: "427", gradeMean: "3.29", readoutIncludes: "1794407806" },
  { wf: "10", key: "claude:claude-sonnet-5-5", runTime: "189", gradeMean: "3.07", readoutIncludes: "1794366012" },
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
    if (row.runTime !== spot.runTime) {
      console.error(`CHECK FAIL: ${spot.key} runTime ${row.runTime} !== ${spot.runTime}`);
      ok = false;
    }
    if (row.gradeMean !== spot.gradeMean) {
      console.error(`CHECK FAIL: ${spot.key} grade ${row.gradeMean} !== ${spot.gradeMean}`);
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
    const key = toolsetKey(row);
    if (!key || !keyToColumn.has(key)) continue;
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
