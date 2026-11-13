/**
 * [IMPL-TIED_HARNESS_MODEL_EVAL_PLATFORM] QUERY_CROSS_HARNESS_SUMMARY — SC-HMEP-M1-08
 */
import type { EvalDatabase } from "../lib/sqlite.js";
import type { CrossHarnessTrialRow } from "../types.js";

export interface TrialRow extends CrossHarnessTrialRow {
  wf_id: string | null;
  reasoning_tokens: number | null;
  completeness: string | null;
  exit_code: number | null;
  model_slug: string | null;
  harness_estimated_cost: number | null;
  normalized_list_price_cost: number | null;
  provider_reported_cost: number | null;
  actual_charged_cost: number | null;
}

const TRIAL_SELECT = `trial_id, harness, wf_id, input_tokens, output_tokens, reasoning_tokens,
  wall_clock_ms, config_fingerprint, completeness, exit_code, model_slug,
  harness_estimated_cost, normalized_list_price_cost,
  provider_reported_cost, actual_charged_cost`;

export function listTrials(db: EvalDatabase): CrossHarnessTrialRow[] {
  const rows = db
    .prepare(
      `SELECT trial_id, harness, input_tokens, output_tokens, wall_clock_ms, config_fingerprint
       FROM trials ORDER BY trial_id`,
    )
    .all() as CrossHarnessTrialRow[];
  return rows;
}

export function listTrialRows(db: EvalDatabase): TrialRow[] {
  return db.prepare(`SELECT ${TRIAL_SELECT} FROM trials ORDER BY trial_id`).all() as TrialRow[];
}

export function getTrialRow(db: EvalDatabase, trialId: string): TrialRow | undefined {
  return db.prepare(`SELECT ${TRIAL_SELECT} FROM trials WHERE trial_id = ?`).get(trialId) as
    | TrialRow
    | undefined;
}

export function crossHarnessSummaryJson(db: EvalDatabase): string {
  const trials = listTrials(db);
  const byHarness: Record<string, { trial_count: number; input_tokens: number | null; output_tokens: number | null }> =
    {};
  for (const t of trials) {
    const bucket = byHarness[t.harness] ?? {
      trial_count: 0,
      input_tokens: null,
      output_tokens: null,
    };
    bucket.trial_count += 1;
    if (t.input_tokens !== null) {
      bucket.input_tokens = (bucket.input_tokens ?? 0) + t.input_tokens;
    }
    if (t.output_tokens !== null) {
      bucket.output_tokens = (bucket.output_tokens ?? 0) + t.output_tokens;
    }
    byHarness[t.harness] = bucket;
  }
  return JSON.stringify({ by_harness: byHarness, trials }, null, 2);
}
