/**
 * [IMPL-TIED_HARNESS_MODEL_EVAL_PLATFORM] ACCOUNT_TOKEN_OBSERVATIONS — SC-HMEP-M1-04
 */
import type { TokenCompleteness, TokenFields, TokenObservation, TrialTokenSummary } from "../types.js";

function addNullable(a: number | null, b: number | null): number | null {
  if (a === null && b === null) {
    return null;
  }
  if (a === null || b === null) {
    return a ?? b;
  }
  return a + b;
}

export function assessObservationCompleteness(obs: TokenFields): TokenCompleteness {
  const any =
    obs.input_tokens !== null ||
    obs.output_tokens !== null ||
    obs.reasoning_tokens !== null ||
    obs.cache_read_input_tokens !== null ||
    obs.cache_creation_input_tokens !== null;
  if (!any) {
    return "absent";
  }
  if (
    obs.reasoning_tokens !== null &&
    obs.output_tokens !== null &&
    obs.reasoning_tokens > obs.output_tokens
  ) {
    return "incomplete";
  }
  return "complete";
}

export function mergeCursorObservations(
  trialId: string,
  observations: TokenObservation[],
): TrialTokenSummary {
  let acc: TokenFields = {
    input_tokens: null,
    output_tokens: null,
    reasoning_tokens: null,
    cache_read_input_tokens: null,
    cache_creation_input_tokens: null,
  };
  let completeness: TokenCompleteness = "absent";
  for (const obs of observations) {
    if (obs.completeness === "incomplete") {
      completeness = "incomplete";
      return {
        trial_id: trialId,
        ...acc,
        completeness,
        observation_count: observations.length,
        input_tokens: null,
        output_tokens: null,
        reasoning_tokens: null,
        cache_read_input_tokens: null,
        cache_creation_input_tokens: null,
      };
    }
    acc = {
      input_tokens: addNullable(acc.input_tokens, obs.input_tokens),
      output_tokens: addNullable(acc.output_tokens, obs.output_tokens),
      reasoning_tokens: addNullable(acc.reasoning_tokens, obs.reasoning_tokens),
      cache_read_input_tokens: addNullable(acc.cache_read_input_tokens, obs.cache_read_input_tokens),
      cache_creation_input_tokens: addNullable(
        acc.cache_creation_input_tokens,
        obs.cache_creation_input_tokens,
      ),
    };
    if (obs.completeness === "complete") {
      completeness = "complete";
    }
  }
  if (completeness === "absent" && observations.length > 0) {
    completeness = "complete";
  }
  return { trial_id: trialId, ...acc, completeness, observation_count: observations.length };
}

export function mergeClaudeCumulativeSnapshots(
  trialId: string,
  snapshots: TokenFields[],
): TrialTokenSummary {
  const maxField = (values: (number | null)[]): number | null => {
    const nums = values.filter((v): v is number => v !== null);
    if (nums.length === 0) {
      return null;
    }
    return Math.max(...nums);
  };
  const merged: TokenFields = {
    input_tokens: maxField(snapshots.map((s) => s.input_tokens)),
    output_tokens: maxField(snapshots.map((s) => s.output_tokens)),
    reasoning_tokens: maxField(snapshots.map((s) => s.reasoning_tokens)),
    cache_read_input_tokens: maxField(snapshots.map((s) => s.cache_read_input_tokens)),
    cache_creation_input_tokens: maxField(snapshots.map((s) => s.cache_creation_input_tokens)),
  };
  const completeness = assessObservationCompleteness(merged);
  return {
    trial_id: trialId,
    ...merged,
    completeness,
    observation_count: snapshots.length,
  };
}

export function usageObjectToFields(usage: Record<string, unknown> | undefined): TokenFields {
  if (!usage || typeof usage !== "object") {
    return {
      input_tokens: null,
      output_tokens: null,
      reasoning_tokens: null,
      cache_read_input_tokens: null,
      cache_creation_input_tokens: null,
    };
  }
  const num = (key: string): number | null => {
    const v = usage[key];
    if (typeof v === "number" && Number.isFinite(v)) {
      return v;
    }
    return null;
  };
  const details = usage.output_tokens_details as Record<string, unknown> | undefined;
  const thinking =
    details && typeof details.thinking_tokens === "number" ? details.thinking_tokens : null;
  return {
    input_tokens: num("input_tokens"),
    output_tokens: num("output_tokens"),
    reasoning_tokens: thinking ?? num("reasoning_tokens"),
    cache_read_input_tokens: num("cache_read_input_tokens"),
    cache_creation_input_tokens: num("cache_creation_input_tokens"),
  };
}
