/**
 * [REQ-TIED_PROJECT_SIZE_LAYERS] [REQ-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_COMPACT]
 * [REQ-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_WALL_CLOCK]
 * [REQ-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_GRADES]
 * Markdown comparison table from snapshot receipts.
 */

import fs from "node:fs";
import path from "node:path";

import { parseEpochFromBasename } from "./project-size-discover-clients.mjs";
import { buildTrialReadoutGradesIndex } from "./read-trial-readout-session-grading.mjs";

const FORBIDDEN_PHRASES = ["leaderboard", "maturity_score", "maturity score"];

/** Allow negated disclaimer lines (e.g. "not a leaderboard") while blocking affirmative use. */
function lineHasForbiddenAffirmative(line, phrase) {
  const lower = line.toLowerCase();
  if (!lower.includes(phrase)) return false;
  if (/\bnot\s+(a\s+)?leaderboard\b/.test(lower)) return false;
  if (/\bnot\s+.*\bmaturity\b/.test(lower)) return false;
  return true;
}

function assertNoForbiddenPhrases(text) {
  for (const line of text.split("\n")) {
    for (const phrase of FORBIDDEN_PHRASES) {
      if (lineHasForbiddenAffirmative(line, phrase)) {
        throw new Error(`FORBIDDEN_PHRASE_IN_OUTPUT: ${phrase}`);
      }
    }
  }
}

/** [IMPL-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_COMPACT] Batch CLI default epoch floor for WF cohort. */
export const DEFAULT_SUMMARY_EPOCH_MIN = 1794259000;

const PROOF_BOUNDARY_FALLBACK =
  "Read-only size evidence from subject repo; counts and hashes do not prove REQ satisfaction, test passage, checklist gates, or trial grade.";

/** [IMPL-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_COMPACT] wf-NN-… suffix at end of discover basename. */
export const SUMMARY_LABEL_SUFFIX_RE = /(wf-\d{2}-.+)$/i;

/** [IMPL-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_COMPACT] Display precision for cross-layer ratio columns. */
export const CROSS_LAYER_DECIMALS = 0;

/**
 * @param {string} label Discover basename from manifest
 * @returns {string} Table display label
 */
export function trimComparisonDisplayLabel(label) {
  const text = String(label);
  const match = text.match(SUMMARY_LABEL_SUFFIX_RE);
  return match ? match[1] : text;
}

/** @param {{ label: string }} a @param {{ label: string }} b */
function compareRowsByDisplayLabel(a, b) {
  const byDisplay = trimComparisonDisplayLabel(a.label).localeCompare(
    trimComparisonDisplayLabel(b.label),
    "en",
    { sensitivity: "base" },
  );
  if (byDisplay !== 0) return byDisplay;
  return a.label.localeCompare(b.label, "en", { sensitivity: "base" });
}

/**
 * @param {Array<{ label: string; receipt: Record<string, unknown> }>} rows
 */
export function sortSummaryRowsByDisplayLabel(rows) {
  return [...rows].sort(compareRowsByDisplayLabel);
}

/**
 * @param {Array<{ label: string; receipt: Record<string, unknown> }>} rows ok rows only
 * @param {{ summaryEpochMin?: number }} opts
 */
export function prepareComparisonSummaryRows(rows, { summaryEpochMin = 0 } = {}) {
  let filtered = rows;
  if (summaryEpochMin > 0) {
    filtered = rows.filter((row) => {
      const epoch = parseEpochFromBasename(row.label);
      if (epoch === null) return false;
      return epoch > summaryEpochMin;
    });
  }
  const byDisplay = new Map();
  for (const row of filtered) {
    const display = trimComparisonDisplayLabel(row.label);
    const epoch = parseEpochFromBasename(row.label) ?? -Infinity;
    const prev = byDisplay.get(display);
    if (!prev) {
      byDisplay.set(display, row);
      continue;
    }
    const prevEpoch = parseEpochFromBasename(prev.label) ?? -Infinity;
    if (epoch > prevEpoch) byDisplay.set(display, row);
  }
  return sortSummaryRowsByDisplayLabel([...byDisplay.values()]);
}

/**
 * @param {Record<string, unknown>} receipt
 * @returns {number | null}
 */
export function orchestratorWallTimeSeconds(receipt) {
  const tf = receipt.trial_factors;
  if (tf && typeof tf === "object") {
    const stored = /** @type {Record<string, unknown>} */ (tf).orchestrator_wall_time_seconds;
    if (typeof stored === "number" && Number.isFinite(stored)) return stored;
  }
  const repoRoot = receipt.repo_root;
  if (typeof repoRoot !== "string") return null;
  const manifestPath = path.join(
    repoRoot,
    "tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json",
  );
  try {
    if (!fs.existsSync(manifestPath)) return null;
    const parsed = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    const started = parsed.started_at;
    const finished = parsed.finished_at;
    if (typeof started !== "string" || typeof finished !== "string") return null;
    const s = Date.parse(started);
    const f = Date.parse(finished);
    if (!Number.isFinite(s) || !Number.isFinite(f)) return null;
    const seconds = (f - s) / 1000;
    return Number.isFinite(seconds) ? seconds : null;
  } catch {
    return null;
  }
}

/**
 * [IMPL-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_WALL_CLOCK] Nearest integer minutes from wall seconds.
 * @param {number | null} seconds
 * @returns {number | null}
 */
export function formatWallClockMinutes(seconds) {
  if (seconds === null || typeof seconds !== "number" || !Number.isFinite(seconds)) {
    return null;
  }
  return Math.round(seconds / 60);
}

/**
 * @param {Record<string, unknown>} receipt
 * @returns {string}
 */
export function renderWallClockCell(receipt) {
  const minutes = formatWallClockMinutes(orchestratorWallTimeSeconds(receipt));
  return minutes === null ? "—" : String(minutes);
}

/**
 * [IMPL-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_GRADES] Lookup grades display by full discover basename.
 * @param {string} discoverBasename
 * @param {Map<string, { display: string }> | Record<string, { display: string }>} gradesIndex
 * @returns {string}
 */
export function renderGradesCell(discoverBasename, gradesIndex) {
  const key = String(discoverBasename);
  let entry;
  if (gradesIndex instanceof Map) {
    entry = gradesIndex.get(key);
  } else if (gradesIndex && typeof gradesIndex === "object") {
    entry = gradesIndex[key];
  }
  if (!entry?.display) return "—";
  return String(entry.display).replace(/\|/g, "\\|");
}

/**
 * @param {{
 *   storeRoot?: string;
 *   gradesIndex?: Map<string, { display: string }> | Record<string, { display: string }>;
 * }} meta
 * @returns {Map<string, { display: string }> | Record<string, { display: string }>}
 */
function resolveGradesIndex(meta) {
  if (meta.gradesIndex !== undefined && meta.gradesIndex !== null) {
    return meta.gradesIndex;
  }
  if (typeof meta.storeRoot === "string" && meta.storeRoot.length > 0) {
    return buildTrialReadoutGradesIndex(meta.storeRoot);
  }
  return new Map();
}

function tailPath(repoRoot, parts = 3) {
  const segs = String(repoRoot).split(/[/\\]/).filter(Boolean);
  return segs.slice(-parts).join("/");
}

function fmtNum(value, decimals = 0) {
  if (value === null || value === undefined) return "—";
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  if (decimals === 0) return String(Math.round(value));
  return value.toFixed(decimals);
}

function hashPrefix(hash, len = 8) {
  if (typeof hash !== "string" || hash.length === 0) return "—";
  return hash.slice(0, len);
}

/** Glossary for summary table headers (aligned with project-size-metrics.registry.yaml). */
function renderColumnDefinitionsSection() {
  const lines = [];
  lines.push("## Column definitions");
  lines.push("");
  lines.push(
    "Three layers: **atoms** (agreement footprint), **operational intent** (IMPL pseudo-code mass), **proof facets** (tests and evidence files). See [catalog-tied-size-and-trial-statistics.md](../../../docs/demos/catalog-tied-size-and-trial-statistics.md).",
  );
  lines.push("");
  lines.push("| Column | Layer | Definition |");
  lines.push("| --- | --- | --- |");
  lines.push(
    "| **label** | — | Display label: `wf-NN-…` suffix when basename matches `/(wf-\\d{2}-.+)$/i`; else full basename. Full discover name remains in `manifest.v1.json` and `receipts/*.json`. Summary applies an epoch floor (`summary_epoch_min` in manifest), then dedupes by display label (max discover epoch wins), then sorts. |",
  );
  lines.push(
    "| **Vocab** | atoms | Rows in client vocab preferred-term tables under `tied-project/vocab/`. |",
  );
  lines.push("| **REQ** | atoms | Count of REQ tokens in `tied-project/requirements.yaml` index. |");
  lines.push("| **ARCH** | atoms | Count of ARCH tokens in `tied-project/architecture-decisions.yaml` index. |");
  lines.push("| **IMPL** | atoms | Count of IMPL tokens in `tied-project/implementation-decisions.yaml` index. |");
  lines.push(
    "| **applied_utf8** | operational intent | `applied_utf8_bytes`: UTF-8 byte length of trimmed non-empty lines minus template overlap bytes. |",
  );
  lines.push(
    "| **applied_lines** | operational intent | Non-template pseudo-code lines across merged `IMPL-*-pseudocode.md` sidecars (gross minus template overlap). |",
  );
  lines.push(
    "| **procedures** | operational intent | Analyzer procedure count in pseudo-code (`procedure_count`). |",
  );
  lines.push(
    "| **unit** | proof facets | Unit test **cases** (`node:test` `it`/`test` per file) under subject `src/`. Receipt `validator_version` ≥ 1.1.0. |",
  );
  lines.push(
    "| **comp** | proof facets | Path-declared composition test **cases** (suffixes per [proof path semantics](../../tied-project/requirements/REQ-TIED_PROJECT_SIZE_PROOF_PATH_SEMANTICS.yaml)). |",
  );
  lines.push(
    "| **comp_inferred** | proof facets | `composition_inferred_cases` (validator_version ≥ 1.2.0): binding heuristic on path-unit files; does not change **comp**. |",
  );
  lines.push(
    "| **lbl:*** | proof facets | `label_case_counts` subtypes (`composition.wiring`, etc.) when `--fine-labels` (1.2.0 receipts). |",
  );
  lines.push("| **e2e** | proof facets | E2E test **cases** per classified file (same counting rule). |");
  lines.push(
    "| **utf8/atom** | cross-layer | `operational_intent_utf8_per_atom`: applied_utf8_bytes ÷ (Vocab + REQ + ARCH + IMPL + optional corpus nodes). Rounded to nearest integer in table. |",
  );
  lines.push(
    "| **oi/atom** | cross-layer | `operational_intent_per_atom`: applied_lines ÷ same atom denominator. Rounded to nearest integer in table; receipt JSON keeps full precision. |",
  );
  lines.push(
    "| **pf/atom** | cross-layer | `proof_facets_per_atom`: (unit + comp + e2e + binding-inventory **cases**) ÷ same atom denominator. Pre-1.1.0 receipts counted **files**. Rounded to nearest integer in table. |",
  );
  lines.push(
    "| **wall_clock** | — | Orchestrator wall duration in **minutes** (nearest integer from `trial_factors.orchestrator_wall_time_seconds` or render-time hydration). Receipt JSON keeps full-second precision; `—` when missing. |",
  );
  lines.push(
    "| **grades** | — | Facilitator session bands from linked trial readout (`mean · Req/Tr/Ts/Al/Pr/Ch/Ml` via `meanCompactGrades`); keyed by **full discover basename** in `manifest.v1.json`. Not REQ status; not a leaderboard. `—` when readout missing. |",
  );
  lines.push("");
  lines.push(
    "Expanded table (`--verbose-table`): **repo (tail)**, **oi_hash**, **verify_ev** (`*consistency*.json` under `tied-project/working/**/evidence/`), **corpus_nodes** / **corpus_edges**, **gross_lines** / **parse_nodes** / **sidecars**, **binding_inv**. Row set matches Summary (`prepareComparisonSummaryRows`); display **label** uses the same trim rule.",
  );
  lines.push("");
  return lines;
}

/**
 * @param {Array<{ label: string; receipt: Record<string, unknown> }>} rows
 * @param {{
 *   generatedAt?: string;
 *   discoverParent?: string;
 *   pattern?: string;
 *   patternRegex?: boolean;
 *   verboseTable?: boolean;
 *   summaryEpochMin?: number;
 *   fineLabels?: boolean;
 *   storeRoot?: string;
 *   gradesIndex?: Map<string, { display: string }> | Record<string, { display: string }>;
 * }} meta
 */
export function renderComparisonMarkdown(rows, meta = {}) {
  const summaryEpochMin = meta.summaryEpochMin ?? 0;
  const generatedAt = meta.generatedAt ?? new Date().toISOString();
  const proof =
    (rows.find((r) => typeof r.receipt?.proof_boundary === "string")?.receipt
      ?.proof_boundary) || PROOF_BOUNDARY_FALLBACK;

  const lines = [];
  lines.push("# Project size comparison (facilitator)");
  lines.push("");
  lines.push(`**Generated:** ${generatedAt}`);
  if (meta.discoverParent) lines.push(`**Discover parent:** \`${meta.discoverParent}\``);
  if (meta.pattern !== undefined) {
    const mode = meta.patternRegex ? "regex" : "substring";
    lines.push(`**Pattern (${mode}):** \`${meta.pattern}\``);
  }
  lines.push("");
  lines.push(
    "Descriptive cohort size evidence; optional **grades** join from trial readouts (facilitator bands only — not REQ status, not a leaderboard).",
  );
  lines.push("");
  lines.push(...renderColumnDefinitionsSection());

  const gradesIndex = resolveGradesIndex(meta);

  const okRows = prepareComparisonSummaryRows(
    rows.filter((r) => r.receipt?.ok === true),
    { summaryEpochMin },
  );
  const failRows = rows.filter((r) => r.receipt?.ok !== true);

  lines.push("## Summary");
  lines.push("");
  lines.push(
    "Rows after epoch floor (when `summary_epoch_min` > 0), dedupe by display **label** (latest discover epoch), sorted by display label then full basename.",
  );
  lines.push("");
  lines.push(
    "| label | Vocab | REQ | ARCH | IMPL | applied_utf8 | applied_lines | procedures | unit | comp | e2e | utf8/atom | oi/atom | pf/atom | wall_clock | grades |",
  );
  lines.push(
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
  );

  for (const { label, receipt } of okRows) {
    const atoms = receipt.layers?.atoms ?? {};
    const oi = receipt.layers?.operational_intent ?? {};
    const pf = receipt.layers?.proof_facets ?? {};
    const cross = receipt.cross_layer ?? {};
    const displayLabel = trimComparisonDisplayLabel(label);
    const wallCell = renderWallClockCell(receipt);
    const gradesCell = renderGradesCell(label, gradesIndex);
    lines.push(
      [
        displayLabel,
        fmtNum(atoms.vocab_preferred_terms),
        fmtNum(atoms.index_req),
        fmtNum(atoms.index_arch),
        fmtNum(atoms.index_impl),
        fmtNum(oi.applied_utf8_bytes),
        fmtNum(oi.applied_lines),
        fmtNum(oi.procedure_count),
        fmtNum(pf.unit_tests),
        fmtNum(pf.composition_tests),
        fmtNum(pf.e2e_tests),
        fmtNum(cross.operational_intent_utf8_per_atom, CROSS_LAYER_DECIMALS),
        fmtNum(cross.operational_intent_per_atom, CROSS_LAYER_DECIMALS),
        fmtNum(cross.proof_facets_per_atom, CROSS_LAYER_DECIMALS),
        wallCell,
        gradesCell,
      ]
        .map((c) => String(c).replace(/\|/g, "\\|"))
        .join(" | ")
        .replace(/^/, "| ")
        .concat(" |"),
    );
  }

  if (okRows.length === 0) {
    lines.push("| — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — |");
  }

  lines.push("");

  if (failRows.length > 0 || (meta.discoverDiagnostics?.length ?? 0) > 0) {
    lines.push("## Failed / skipped");
    lines.push("");
    for (const { label, receipt } of failRows) {
      const diags = Array.isArray(receipt?.diagnostics) ? receipt.diagnostics : [];
      const msg = diags.map((d) => `${d.code}: ${d.message}`).join("; ") || "ok=false";
      lines.push(`- **${label}:** ${msg}`);
    }
    for (const d of meta.discoverDiagnostics ?? []) {
      lines.push(`- **discover:** ${d.code}: ${d.message}`);
    }
    lines.push("");
  }

  if (meta.fineLabels === true && okRows.length > 0) {
    lines.push("## Fine label counts (1.2.0)");
    lines.push("");
    lines.push(
      "| label | lbl:wiring | lbl:integration | lbl:contract | comp_inferred |",
    );
    lines.push("| --- | --- | --- | --- | --- |");
    for (const { label, receipt } of okRows) {
      const pf = receipt.layers?.proof_facets ?? {};
      const lc = pf.label_case_counts ?? {};
      const displayLabel = trimComparisonDisplayLabel(label);
      lines.push(
        `| ${displayLabel} | ${fmtNum(lc["composition.wiring"])} | ${fmtNum(lc["composition.integration"])} | ${fmtNum(lc["composition.contract"])} | ${fmtNum(pf.composition_inferred_cases)} |`,
      );
    }
    lines.push("");
  }

  if (meta.verboseTable === true && okRows.length > 0) {
    lines.push("## Expanded metrics");
    lines.push("");
    lines.push(
      "| label | repo (tail) | oi_hash | verify_ev | corpus_nodes | corpus_edges | gross_lines | parse_nodes | binding_inv | sidecars |",
    );
    lines.push("| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |");
    for (const { label, receipt } of okRows) {
      const atoms = receipt.layers?.atoms ?? {};
      const oi = receipt.layers?.operational_intent ?? {};
      const pf = receipt.layers?.proof_facets ?? {};
      const hashes = receipt.hashes ?? {};
      const displayLabel = trimComparisonDisplayLabel(label);
      lines.push(
        `| ${displayLabel} | ${tailPath(receipt.repo_root)} | ${hashPrefix(hashes.operational_intent_hash)} | ${fmtNum(pf.verify_evidence_files)} | ${fmtNum(atoms.corpus_graph_nodes)} | ${fmtNum(atoms.corpus_graph_edges)} | ${fmtNum(oi.gross_lines)} | ${fmtNum(oi.parse_node_count)} | ${fmtNum(pf.binding_inventory_tests)} | ${fmtNum(oi.sidecar_count)} |`,
      );
    }
    lines.push("");
  }

  lines.push("---");
  lines.push("");
  lines.push(`**Proof boundary:** ${proof}`);
  lines.push("");

  const text = lines.join("\n");
  assertNoForbiddenPhrases(text);
  return text;
}

export function assertRenderableMarkdown(text) {
  assertNoForbiddenPhrases(text);
  if (!text.includes("Proof boundary")) {
    throw new Error("MISSING_PROOF_BOUNDARY_SECTION");
  }
}
