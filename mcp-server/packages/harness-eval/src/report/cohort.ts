/**
 * [IMPL-TIED_HARNESS_MODEL_EVAL_PLATFORM] REPORT_COHORT_BY_WF_ID — SC-HMEP-M2-05
 */
import type { EvalDatabase } from "../lib/sqlite.js";
import { listTrialRows } from "../store/query.js";

export interface CohortBucket {
  wf_id: string | null;
  harness: string;
  trial_count: number;
  input_tokens: number | null;
  output_tokens: number | null;
  wall_clock_ms: number | null;
  harness_estimated_cost: number | null;
}

export function buildCohortReport(db: EvalDatabase): {
  by_wf_id: Record<string, CohortBucket[]>;
  trials: ReturnType<typeof listTrialRows>;
} {
  const trials = listTrialRows(db);
  const by_wf_id: Record<string, CohortBucket[]> = {};
  for (const t of trials) {
    const key = t.wf_id ?? "(none)";
    const buckets = by_wf_id[key] ?? [];
    let bucket = buckets.find((b) => b.harness === t.harness);
    if (!bucket) {
      bucket = {
        wf_id: t.wf_id,
        harness: t.harness,
        trial_count: 0,
        input_tokens: null,
        output_tokens: null,
        wall_clock_ms: null,
        harness_estimated_cost: null,
      };
      buckets.push(bucket);
    }
    bucket.trial_count += 1;
    if (t.input_tokens !== null) {
      bucket.input_tokens = (bucket.input_tokens ?? 0) + t.input_tokens;
    }
    if (t.output_tokens !== null) {
      bucket.output_tokens = (bucket.output_tokens ?? 0) + t.output_tokens;
    }
    if (t.wall_clock_ms !== null) {
      bucket.wall_clock_ms = (bucket.wall_clock_ms ?? 0) + t.wall_clock_ms;
    }
    if (t.harness_estimated_cost !== null) {
      bucket.harness_estimated_cost =
        (bucket.harness_estimated_cost ?? 0) + t.harness_estimated_cost;
    }
    by_wf_id[key] = buckets;
  }
  return { by_wf_id, trials };
}

export function cohortReportJson(db: EvalDatabase): string {
  return JSON.stringify(buildCohortReport(db), null, 2);
}
