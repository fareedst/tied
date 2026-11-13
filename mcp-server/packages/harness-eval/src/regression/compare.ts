/**
 * [IMPL-TIED_HARNESS_MODEL_EVAL_PLATFORM] COMPARE_TRIAL_TO_BASELINE — SC-HMEP-M4-02; F-15
 */
import type { EvalDatabase } from "../lib/sqlite.js";
import { getTrialRow, type TrialRow } from "../store/query.js";
import type { BaselineExpectation, BaselineMetricSpec, RegressionBaselineDoc } from "./baseline.js";
import { parseRegressionBaselineFile } from "./baseline.js";

export interface MetricCompareResult {
  metric: string;
  status: "pass" | "fail" | "skip";
  expected?: number;
  observed?: number | null;
  reason?: string;
}

export interface ExpectationCompareResult {
  bind: BaselineExpectation["bind"];
  metrics: MetricCompareResult[];
}

export interface CompareTrialSummary {
  trial_id: string;
  baseline_id: string;
  ok: boolean;
  expectations: ExpectationCompareResult[];
}

const TRIAL_METRIC_KEYS = new Set([
  "wall_clock_ms",
  "input_tokens",
  "output_tokens",
  "reasoning_tokens",
  "harness_estimated_cost",
  "normalized_list_price_cost",
  "provider_reported_cost",
  "actual_charged_cost",
]);

export function readTrialMetric(trial: TrialRow, metric: string): number | null {
  if (!TRIAL_METRIC_KEYS.has(metric)) {
    return null;
  }
  const map: Record<string, number | null | undefined> = {
    wall_clock_ms: trial.wall_clock_ms,
    input_tokens: trial.input_tokens,
    output_tokens: trial.output_tokens,
    reasoning_tokens: trial.reasoning_tokens,
    harness_estimated_cost: trial.harness_estimated_cost,
    normalized_list_price_cost: trial.normalized_list_price_cost,
    provider_reported_cost: trial.provider_reported_cost,
    actual_charged_cost: trial.actual_charged_cost,
  };
  const v = map[metric];
  return typeof v === "number" && !Number.isNaN(v) ? v : null;
}

export function metricWithinTolerance(observed: number, spec: BaselineMetricSpec): boolean {
  let band = 0;
  if (spec.tolerance_abs != null) {
    band = Math.max(band, spec.tolerance_abs);
  }
  if (spec.tolerance_pct != null) {
    band = Math.max(band, Math.abs(spec.value) * (spec.tolerance_pct / 100));
  }
  return Math.abs(observed - spec.value) <= band;
}

export function bindMatchesTrial(bind: BaselineExpectation["bind"], trial: TrialRow): boolean {
  if (bind.trial_id && bind.trial_id !== trial.trial_id) {
    return false;
  }
  if (bind.wf_id !== (trial.wf_id ?? "")) {
    return false;
  }
  if (bind.harness !== trial.harness) {
    return false;
  }
  if (bind.model_slug && bind.model_slug !== (trial.model_slug ?? "")) {
    return false;
  }
  return true;
}

export function compareExpectationToTrial(
  expectation: BaselineExpectation,
  trial: TrialRow,
): ExpectationCompareResult | null {
  if (!bindMatchesTrial(expectation.bind, trial)) {
    return null;
  }
  const metrics: MetricCompareResult[] = [];
  for (const [name, spec] of Object.entries(expectation.metrics ?? {})) {
    if (spec === null || spec === undefined) {
      metrics.push({ metric: name, status: "skip", reason: "null baseline metric" });
      continue;
    }
    const observed = readTrialMetric(trial, name);
    if (observed === null) {
      metrics.push({
        metric: name,
        status: "fail",
        expected: spec.value,
        observed: null,
        reason: "observed null",
      });
      continue;
    }
    const pass = metricWithinTolerance(observed, spec);
    metrics.push({
      metric: name,
      status: pass ? "pass" : "fail",
      expected: spec.value,
      observed,
      reason: pass ? undefined : "outside tolerance",
    });
  }
  return { bind: expectation.bind, metrics };
}

export function compareTrialToBaselineFile(
  db: EvalDatabase,
  trialId: string,
  baselinePath: string,
): CompareTrialSummary {
  const baseline: RegressionBaselineDoc = parseRegressionBaselineFile(baselinePath);
  const trial = getTrialRow(db, trialId);
  if (!trial) {
    throw new Error(`DEBUG: unknown trial_id=${trialId}`);
  }
  const expectations: ExpectationCompareResult[] = [];
  for (const exp of baseline.expectations) {
    const row = compareExpectationToTrial(exp, trial);
    if (row) {
      expectations.push(row);
    }
  }
  const ok = expectations.every((e) => e.metrics.every((m) => m.status !== "fail"));
  return { trial_id: trialId, baseline_id: baseline.baseline_id, ok, expectations };
}
