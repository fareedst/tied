/**
 * Batch apply index/detail merges in one process (yaml_updates_apply MCP tool).
 * [IMPL-TIED_YAML_UPDATES_ATOMIC_BATCH] [REQ-TIED_YAML_UPDATES_ATOMIC_BATCH]
 */

import fs from "node:fs";
import path from "node:path";
import { getDetailPath, loadDetail, updateDetail } from "./detail-loader.js";
import {
  getRecord,
  updateRecord,
  getProjectIndexFilePath,
  type IndexName,
} from "./yaml-loader.js";
import { mergeRecordUpdate } from "./record-merge.js";
import { validateConsistency, type ConsistencyReport } from "./consistency-validator.js";
import { formatYamlMetadata, type YamlFormatMetadata } from "./yaml-canonicalizer.js";

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
  yaml_format?: YamlFormatMetadata;
  /** True when pre-batch snapshots were restored after a failed write or consistency rejection. */
  rolled_back?: boolean;
}

/** Resolve on-disk path for a batch step target under the project corpus. */
export function resolveYamlUpdateStepPath(step: YamlUpdateStep): string | null {
  if (step.kind === "detail") return getDetailPath(step.token);
  return getProjectIndexFilePath(step.index);
}

export type BatchFileSnapshot = { path: string; bytes: Buffer | null };

/** Capture unique step target paths before batch writes (null bytes = file absent). */
export function snapshotBatchTargetFiles(steps: YamlUpdateStep[]): BatchFileSnapshot[] {
  const seen = new Set<string>();
  const snapshots: BatchFileSnapshot[] = [];
  for (const step of steps) {
    const target = resolveYamlUpdateStepPath(step);
    if (!target || seen.has(target)) continue;
    seen.add(target);
    const bytes = fs.existsSync(target) ? fs.readFileSync(target) : null;
    snapshots.push({ path: target, bytes });
  }
  return snapshots;
}

/** Restore corpus files to pre-batch snapshot bytes. */
export function restoreBatchSnapshots(snapshots: BatchFileSnapshot[]): void {
  for (const { path: filePath, bytes } of snapshots) {
    if (bytes === null) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      continue;
    }
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, bytes);
  }
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
 * Write path: snapshot touched files; rollback on write failure or consistency rejection.
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
  }

  if (dry_run) {
    return {
      ok: true,
      dry_run: true,
      applied_steps: 0,
      step_results,
    };
  }

  const snapshots = snapshotBatchTargetFiles(steps);

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]!;
    const w = writeStep(step);
    if (!w.ok) {
      restoreBatchSnapshots(snapshots);
      return {
        ok: false,
        dry_run: false,
        applied_steps: i,
        step_results,
        error: w.error,
        rolled_back: true,
      };
    }
  }

  if (run_validate_consistency) {
    const consistency = validateConsistency({});
    const out: ApplyYamlUpdatesResult = {
      ok: true,
      dry_run: false,
      applied_steps: steps.length,
      step_results,
      consistency,
      yaml_format: formatYamlMetadata(),
    };
    if (!consistency.ok) {
      restoreBatchSnapshots(snapshots);
      return {
        ...out,
        ok: false,
        error: "tied_validate_consistency reported ok: false after batch apply",
        rolled_back: true,
      };
    }
    return out;
  }

  return {
    ok: true,
    dry_run: false,
    applied_steps: steps.length,
    step_results,
    yaml_format: formatYamlMetadata(),
  };
}
