/**
 * [IMPL-TIED_HARNESS_MODEL_EVAL_PLATFORM] ESTIMATE_HARNESS_LIST_PRICE — SC-HMEP-M2-03
 */
import type { ModelRate } from "./catalog.js";
import type { TokenCompleteness } from "../types.js";

export function estimateHarnessListPrice(input: {
  completeness: TokenCompleteness;
  input_tokens: number | null;
  output_tokens: number | null;
  rate: ModelRate | null;
}): number | null {
  if (input.completeness !== "complete") {
    return null;
  }
  if (input.input_tokens === null || input.output_tokens === null) {
    return null;
  }
  if (!input.rate) {
    return null;
  }
  const inRate = input.rate.input_usd_per_mtok;
  const outRate = input.rate.output_usd_per_mtok;
  if (inRate === null || outRate === null) {
    return null;
  }
  const cost =
    (input.input_tokens / 1_000_000) * inRate + (input.output_tokens / 1_000_000) * outRate;
  return Math.round(cost * 1_000_000) / 1_000_000;
}
