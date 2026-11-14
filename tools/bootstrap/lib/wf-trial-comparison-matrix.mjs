/**
 * [REQ-WF_TRIAL_REGISTRY_COMPARISON_MATRIX_CELLS]
 * [REQ-WF_TRIAL_COMPARISON_MATRIX_TOOLSET_FIX]
 * [REQ-WF_TRIAL_MATRIX_COLUMN_EFFORT_HEADERS]
 * Latest-run comparison matrix: cell render + toolset column manifest and pivot keys.
 */

import fs from "node:fs";
import path from "node:path";

import { resolveAhePaths } from "./agent-harness-eval-docs-paths.mjs";
import { formatWallClockMinutes } from "./project-size-comparison-render.mjs";
import { deriveCursorModelConfig } from "./wf-trial-model-catalog.mjs";

const COMPOSER_CONFIG_ID = "composer-2.5";

/**
 * @param {{ harnessLabel: string; configId: string; effortTier?: "low" | "medium" | "high" | null }} spec
 * @returns {string}
 */
export function formatMatrixColumnHeader({ harnessLabel, configId, effortTier = "low" }) {
  const base = `${harnessLabel} · \`${configId}\``;
  if (configId === COMPOSER_CONFIG_ID) return base;
  const tier = effortTier ?? "low";
  return `${base} effort=${tier}`;
}

/** Claude configs that support MODEL_EFFORT low / medium / high overlay columns. */
export const CLAUDE_EFFORT_TIERED_CONFIGS = ["claude-haiku-5-5", "claude-sonnet-5-5"];

/** @type {Array<"low" | "medium" | "high">} */
const CLAUDE_EFFORT_TIERS = ["low", "medium", "high"];

/**
 * @returns {Array<{ id: string; key: string; harnessLabel: string; configId: string; effortTier?: "low" | "medium" | "high" | null }>}
 */
export function claudeEffortColumnSpecs() {
  const specs = [];
  for (const configId of CLAUDE_EFFORT_TIERED_CONFIGS) {
    for (const tier of CLAUDE_EFFORT_TIERS) {
      const key =
        tier === "low" ? `claude:${configId}` : `claude:${configId}@${tier}`;
      specs.push({
        id: tier === "low" ? configId : `${configId}@${tier}`,
        harnessLabel: "Claude",
        configId,
        effortTier: tier,
        key,
      });
    }
  }
  return specs;
}

/** @type {Array<{ id: string; key: string; harnessLabel: string; configId: string; effortTier?: "low" | "medium" | "high" | null }>} */
const CURSOR_MATRIX_COLUMN_SPECS = [
  {
    id: "cursor-composer-2.5",
    harnessLabel: "Cursor",
    configId: COMPOSER_CONFIG_ID,
    effortTier: null,
    key: "cursor:composer-2.5",
  },
  {
    id: "cursor-luna-low",
    harnessLabel: "Cursor",
    configId: "luna-low",
    effortTier: "low",
    key: "cursor:luna-low",
  },
  {
    id: "cursor-luna-med",
    harnessLabel: "Cursor",
    configId: "luna-med",
    effortTier: "low",
    key: "cursor:luna-med",
  },
  {
    id: "cursor-luna-high",
    harnessLabel: "Cursor",
    configId: "luna-high",
    effortTier: "low",
    key: "cursor:luna-high",
  },
  {
    id: "cursor-grok47-low",
    harnessLabel: "Cursor",
    configId: "grok47-low",
    effortTier: "low",
    key: "cursor:grok47-low",
  },
  {
    id: "cursor-grok47-med",
    harnessLabel: "Cursor",
    configId: "grok47-med",
    effortTier: "low",
    key: "cursor:grok47-med",
  },
  {
    id: "cursor-luna-low@medium",
    harnessLabel: "Cursor",
    configId: "luna-low",
    effortTier: "medium",
    key: "cursor:luna-low@medium",
  },
];

const MATRIX_COLUMN_SPECS = [...CURSOR_MATRIX_COLUMN_SPECS, ...claudeEffortColumnSpecs()];

/** Column order: alphabetical by header text (Claude toolsets before Cursor at current labels). */
export const MATRIX_COLUMNS = MATRIX_COLUMN_SPECS.map((spec) => ({
  id: spec.id,
  key: spec.key,
  header: formatMatrixColumnHeader(spec),
  effortTier: spec.effortTier,
})).sort((a, b) => a.header.localeCompare(b.header));

/** @type {Map<string, (typeof MATRIX_COLUMNS)[0]>} */
export const matrixKeyToColumn = new Map(MATRIX_COLUMNS.map((c) => [c.key, c]));

export const SLUG_TO_CONFIG = {
  "composer-2.5-fast": "composer-2.5",
  "gpt-5.6-luna-low-fast": "luna-low",
  "gpt-5.6-luna-medium-fast": "luna-med",
  "gpt-5.6-luna-high-fast": "luna-high",
  "grok-4.7-low-fast": "grok47-low",
  "grok-4.7-medium-fast": "grok47-med",
  "claude-haiku-5-5": "claude-haiku-5-5",
  "claude-sonnet-5-5": "claude-sonnet-5-5",
};

const EFFORT_MEDIUM_RE =
  /lunalowmedium|haiku55medium|claudesonnet55medium|luna-low-medium|claude-haiku55medium/i;
const EFFORT_HIGH_RE = /haiku55high|claudesonnet55high|sonnet55high/i;

/**
 * @param {string} readoutPath relative readout path
 * @param {{ repoRoot?: string }} [opts]
 * @returns {"medium" | "high" | null}
 */
export function effortFromReadout(readoutPath, opts = {}) {
  const base = path.basename(readoutPath);
  if (/composer25/i.test(base)) return null;
  if (EFFORT_HIGH_RE.test(base)) return "high";
  if (EFFORT_MEDIUM_RE.test(base)) return "medium";
  const root = opts.repoRoot;
  if (root) {
    const full = path.join(resolveAhePaths(root).readoutsDir, path.basename(readoutPath));
    if (fs.existsSync(full)) {
      const body = fs.readFileSync(full, "utf8");
      if (/model_effort=high/.test(body)) return "high";
      if (/model_effort=medium/.test(body)) return "medium";
    }
  }
  return null;
}

/**
 * @param {{ harness: string; slug: string }} row
 * @returns {string | null}
 */
export function configIdFromMasterRow(row) {
  if (row.harness === "claude") {
    let config = SLUG_TO_CONFIG[row.slug];
    if (row.slug === "claude-sonnet-5-5") {
      config = "claude-sonnet-5-5";
    }
    return config ?? null;
  }
  if (row.harness === "cursor") {
    let config = SLUG_TO_CONFIG[row.slug];
    if (!config) {
      config = deriveCursorModelConfig(row.slug);
    }
    if (!config && row.slug.includes("luna") && row.slug.includes("medium")) {
      config = "luna-med";
    }
    return config || null;
  }
  let config = SLUG_TO_CONFIG[row.slug];
  return config ?? null;
}

/**
 * @param {{ harness: string; slug: string; readout: string }} row
 * @param {{ repoRoot?: string }} [opts]
 * @returns {string | null}
 */
/**
 * @param {{ harness: string; slug: string; readout: string }} row
 * @param {(key: string) => boolean} hasColumn
 * @param {{ repoRoot?: string }} [opts]
 * @returns {string | null}
 */
export function toolsetKeyFromMasterRowWithColumnCheck(row, hasColumn, opts = {}) {
  const config = configIdFromMasterRow(row);
  if (!config) return null;
  const base = `${row.harness}:${config}`;
  if (config === COMPOSER_CONFIG_ID) return base;
  const effort = effortFromReadout(row.readout, opts);
  if (effort === "medium" || effort === "high") {
    const keyed = `${base}@${effort}`;
    if (hasColumn(keyed)) return keyed;
    return null;
  }
  if (effort) return null;
  return hasColumn(base) ? base : null;
}

/**
 * @param {{ harness: string; slug: string; readout: string }} row
 * @param {{ repoRoot?: string }} [opts]
 * @returns {string | null}
 */
export function toolsetKeyFromMasterRow(row, opts = {}) {
  return toolsetKeyFromMasterRowWithColumnCheck(row, (k) => matrixKeyToColumn.has(k), opts);
}

/**
 * @param {number | string | null | undefined} wallSeconds Master Run time (seconds) or em dash token.
 * @returns {string}
 */
export function formatMatrixWallMins(wallSeconds) {
  if (wallSeconds === null || wallSeconds === undefined || wallSeconds === "—") {
    return "—";
  }
  const n = typeof wallSeconds === "number" ? wallSeconds : Number(wallSeconds);
  if (!Number.isFinite(n)) return "—";
  const minutes = formatWallClockMinutes(n);
  return minutes === null ? "—" : `${minutes}m`;
}

/**
 * @param {{ wallSeconds: number | string | null | undefined; gradesDisplay: string; readout: string }} opts
 * @returns {string}
 */
export function renderWfTrialComparisonMatrixCell({ wallSeconds, gradesDisplay, readout }) {
  const wallEm = formatMatrixWallMins(wallSeconds);
  const gradesEm =
    gradesDisplay === null || gradesDisplay === undefined || gradesDisplay === "—" ? "—" : gradesDisplay;
  if (wallEm === "—" && gradesEm === "—") return "—";
  return `**${wallEm}**<br>**${gradesEm}**<br>[readout](${readout})`;
}
