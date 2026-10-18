/**
 * [IMPL-TIED_CONTEXT_ADAPTIVE_REASSESS] [REQ-TIED_CONTEXT_ADAPTIVE_ENGINEERING]
 */

import type { ContextProfileV1 } from "./profile.js";
import type { SelectionReceiptV1 } from "./selector.js";
import { hashStable, selectionReceiptHash } from "./selector.js";

export type ReassessmentAction = "unchanged" | "revise_plan" | "loop_back" | "stop_for_review";

export type ReassessmentReceiptV1 = {
  schema_version: "reassessment-receipt.v1";
  prior_context_hash: string;
  revised_context_hash: string;
  prior_selection_hash: string;
  changed_dimensions: string[];
  action: ReassessmentAction;
};

const RISK_ORDER = { LOW: 0, MEDIUM: 1, HIGH: 2, UNKNOWN: 3 } as const;

function riskIncreased(before: string | undefined, after: string | undefined): boolean {
  const b = before ? RISK_ORDER[before as keyof typeof RISK_ORDER] ?? 0 : 0;
  const a = after ? RISK_ORDER[after as keyof typeof RISK_ORDER] ?? 0 : 0;
  return a > b;
}

/** [IMPL-TIED_CONTEXT_ADAPTIVE_REASSESS] REASSESS_CONTEXT_V1 */
export function reassessContextV1(input: {
  prior_profile: ContextProfileV1;
  prior_receipt: SelectionReceiptV1;
  revised_profile: ContextProfileV1;
}): ReassessmentReceiptV1 {
  const changed: string[] = [];
  const keys = new Set([
    ...Object.keys(input.prior_profile.dimensions),
    ...Object.keys(input.revised_profile.dimensions),
  ]);
  let increased = false;
  for (const key of keys) {
    const before = input.prior_profile.dimensions[key as keyof ContextProfileV1["dimensions"]];
    const after = input.revised_profile.dimensions[key as keyof ContextProfileV1["dimensions"]];
    if (before !== after) {
      changed.push(key);
      if (riskIncreased(before, after)) increased = true;
    }
  }
  let action: ReassessmentAction = "unchanged";
  if (changed.length === 0) {
    action = "unchanged";
  } else if (increased) {
    action = "loop_back";
  } else {
    action = "revise_plan";
  }
  return {
    schema_version: "reassessment-receipt.v1",
    prior_context_hash: hashStable(input.prior_profile),
    revised_context_hash: hashStable(input.revised_profile),
    prior_selection_hash: selectionReceiptHash(input.prior_receipt),
    changed_dimensions: changed,
    action,
  };
}
