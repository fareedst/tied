/**
 * [IMPL-TIED_CONTEXT_ADAPTIVE_EVAL_LINK] [REQ-TIED_CONTEXT_ADAPTIVE_ENGINEERING]
 */

import type { SelectionReceiptV1 } from "./selector.js";

export type MethodEffectivenessRefsV1 = {
  schema_version: "method-effectiveness-refs.v1";
  selection_receipt_hash: string;
  conformance_refs: string[];
  proof_boundary: string;
};

/** [IMPL-TIED_CONTEXT_ADAPTIVE_EVAL_LINK] BUILD_METHOD_EFFECTIVENESS_REFS_V1 */
export function buildMethodEffectivenessRefsV1(input: {
  selection_receipt: SelectionReceiptV1;
  conformance_refs: string[];
}): MethodEffectivenessRefsV1 {
  return {
    schema_version: "method-effectiveness-refs.v1",
    selection_receipt_hash: input.selection_receipt.context_hash,
    conformance_refs: [...input.conformance_refs],
    proof_boundary: "Observational pilot only; conformance success does not imply effectiveness.",
  };
}
