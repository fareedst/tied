/**
 * [IMPL-TIED_HARNESS_MODEL_EVAL_PLATFORM] REPORT_BILLING_RECONCILE — SC-HMEP-M3-04
 */
import type { EvalDatabase } from "../lib/sqlite.js";
import { listTrialRows, type TrialRow } from "../store/query.js";

export interface ReconcileDelta {
  trial_id: string;
  harness_estimated_cost: number | null;
  provider_reported_cost: number | null;
  actual_charged_cost: number | null;
  delta_estimated_vs_provider: number | null;
  delta_estimated_vs_actual: number | null;
}

function delta(a: number | null, b: number | null): number | null {
  if (a === null || b === null) {
    return null;
  }
  return a - b;
}

function rowToDelta(t: TrialRow): ReconcileDelta {
  const harness_estimated_cost = t.harness_estimated_cost;
  const provider_reported_cost = t.provider_reported_cost ?? null;
  const actual_charged_cost = t.actual_charged_cost ?? null;
  return {
    trial_id: t.trial_id,
    harness_estimated_cost,
    provider_reported_cost,
    actual_charged_cost,
    delta_estimated_vs_provider: delta(harness_estimated_cost, provider_reported_cost),
    delta_estimated_vs_actual: delta(harness_estimated_cost, actual_charged_cost),
  };
}

export function reconcileReportJson(db: EvalDatabase): string {
  const trials = listTrialRows(db);
  const rows = trials.map(rowToDelta);
  return JSON.stringify({ trials: rows }, null, 2);
}
