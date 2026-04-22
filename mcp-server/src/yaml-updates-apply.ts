/**
 * Batch apply index/detail merges in one process (yaml_updates_apply MCP tool).
 */

import { loadDetail, updateDetail } from "./detail-loader.js";
import { getRecord, updateRecord, type IndexName } from "./yaml-loader.js";
import { mergeRecordUpdate } from "./record-merge.js";
import { validateConsistency, type ConsistencyReport } from "./consistency-validator.js";

const INDEX_NAMES = new Set<string>([
  "requirements",
  "architecture",
  "implementation",
  "semantic-tokens",
]);

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

/**
 * Parse MCP `steps` payload into typed steps (detail | index).
 */
export function parseYamlUpdateSteps(
  raw: unknown
): { ok: true; steps: YamlUpdateStep[] } | { ok: false; error: string } {
  if (!Array.isArray(raw)) return { ok: false, error: "steps must be a non-null array" };
  const steps: YamlUpdateStep[] = [];
  for (let i = 0; i < raw.length; i++) {
    const s = raw[i];
    if (!isPlainObject(s)) return { ok: false, error: `steps[${i}] must be an object` };
    const kind = s.kind;
    if (kind === "detail") {
      if (typeof s.token !== "string" || !s.token.trim()) {
        return { ok: false, error: `steps[${i}]: detail requires non-empty token` };
      }
      if (!isPlainObject(s.updates)) {
        return { ok: false, error: `steps[${i}]: detail requires updates object` };
      }
      steps.push({ kind: "detail", token: s.token, updates: s.updates });
    } else if (kind === "index") {
      if (typeof s.index !== "string" || !INDEX_NAMES.has(s.index)) {
        return {
          ok: false,
          error: `steps[${i}]: index must be requirements|architecture|implementation|semantic-tokens`,
        };
      }
      if (typeof s.token !== "string" || !s.token.trim()) {
        return { ok: false, error: `steps[${i}]: index step requires non-empty token` };
      }
      if (!isPlainObject(s.updates)) {
        return { ok: false, error: `steps[${i}]: index requires updates object` };
      }
      steps.push({
        kind: "index",
        index: s.index as IndexName,
        token: s.token,
        updates: s.updates,
      });
    } else {
      return { ok: false, error: `steps[${i}]: kind must be "detail" or "index"` };
    }
  }
  return { ok: true, steps };
}

export type YamlUpdateStep =
  | { kind: "detail"; token: string; updates: Record<string, unknown> }
  | { kind: "index"; index: IndexName; token: string; updates: Record<string, unknown> };

export interface ApplyYamlUpdatesOptions {
  steps: YamlUpdateStep[];
  dry_run?: boolean;
  /** When false and not dry_run, skip tied_validate_consistency at the end (default: true). */
  run_validate_consistency?: boolean;
}

export type YamlUpdateStepResult =
  | {
      step: number;
      ok: true;
      kind: "detail" | "index";
      token: string;
      index?: IndexName;
      merged_preview: Record<string, unknown>;
    }
  | { step: number; ok: false; error: string };

export interface ApplyYamlUpdatesResult {
  ok: boolean;
  dry_run: boolean;
  applied_steps?: number;
  step_results: YamlUpdateStepResult[];
  error?: string;
  consistency?: ConsistencyReport;
}

function simulateStep(step: YamlUpdateStep, stepIndex: number): YamlUpdateStepResult {
  if (step.kind === "detail") {
    const existing = loadDetail(step.token);
    if (!existing) {
      return { step: stepIndex, ok: false, error: `No detail file for token: ${step.token}` };
    }
    const merged = mergeRecordUpdate(
      existing as Record<string, unknown>,
      step.updates
    );
    return {
      step: stepIndex,
      ok: true,
      kind: "detail",
      token: step.token,
      merged_preview: merged,
    };
  }
  const existing = getRecord(step.index, step.token);
  if (!existing || typeof existing !== "object" || Array.isArray(existing)) {
    return {
      step: stepIndex,
      ok: false,
      error: `No index record for ${step.index}/${step.token}`,
    };
  }
  const merged = mergeRecordUpdate(existing as Record<string, unknown>, step.updates);
  return {
    step: stepIndex,
    ok: true,
    kind: "index",
    token: step.token,
    index: step.index,
    merged_preview: merged,
  };
}

function writeStep(step: YamlUpdateStep): { ok: true } | { ok: false; error: string } {
  if (step.kind === "detail") {
    return updateDetail(step.token, step.updates);
  }
  return updateRecord(step.index, step.token, step.updates);
}

/**
 * Apply ordered detail/index merges. Same merge rules as yaml_*_update.
 * dry_run: compute merged previews only; no writes.
 */
export function applyYamlUpdates(options: ApplyYamlUpdatesOptions): ApplyYamlUpdatesResult {
  const { steps, dry_run = false, run_validate_consistency = true } = options;
  const step_results: YamlUpdateStepResult[] = [];

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]!;
    const simulated = simulateStep(step, i);
    if (!simulated.ok) {
      return {
        ok: false,
        dry_run,
        applied_steps: dry_run ? 0 : i,
        step_results: [...step_results, simulated],
        error: simulated.error,
      };
    }
    step_results.push(simulated);

    if (!dry_run) {
      const w = writeStep(step);
      if (!w.ok) {
        return {
          ok: false,
          dry_run: false,
          applied_steps: i,
          step_results,
          error: w.error,
        };
      }
    }
  }

  if (!dry_run && run_validate_consistency) {
    const consistency = validateConsistency({});
    const out: ApplyYamlUpdatesResult = {
      ok: true,
      dry_run: false,
      applied_steps: steps.length,
      step_results,
      consistency,
    };
    if (!consistency.ok) {
      return {
        ...out,
        ok: false,
        error: "tied_validate_consistency reported ok: false after batch apply",
      };
    }
    return out;
  }

  return {
    ok: true,
    dry_run,
    applied_steps: dry_run ? 0 : steps.length,
    step_results,
  };
}
