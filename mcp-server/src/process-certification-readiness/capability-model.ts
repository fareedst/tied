/**
 * [IMPL-TIED_PROCESS_CERTIFICATION_CAPABILITY] [ARCH-TIED_PROCESS_CERTIFICATION_READINESS]
 * [REQ-TIED_PROCESS_CERTIFICATION_READINESS]
 */

import {
  CAPABILITY_DIMENSION_IDS,
  CAPABILITY_PROFILE_SCHEMA,
  PROOF_BOUNDARY_NON_CERT,
} from "./constants.js";
import type {
  CapabilityProfileV1,
  EdseProcessRecordV1,
  Iso330xxCapabilityModelV1,
  ValidationDiagnostic,
} from "./types.js";

export type CapabilityEvaluateOptions = {
  include_aggregate_score?: boolean;
  maturity_level?: number;
  rollup_percentage?: number;
};

function dimensionRating(record: EdseProcessRecordV1, dimensionId: string): {
  rating: "sufficient" | "insufficient" | "not_evaluated";
  refs: string[];
} {
  const key = `capability_${dimensionId}`;
  const val = record.evidence[key] ?? record.evidence[dimensionId];
  if (val === undefined || val === null) return { rating: "not_evaluated", refs: [] };
  if (val === false || val === "fail") return { rating: "insufficient", refs: [String(key)] };
  return { rating: "sufficient", refs: [String(key)] };
}

/** EVALUATE_CAPABILITY_PROFILE_V1 */
export function evaluateCapabilityProfileV1(input: {
  record: EdseProcessRecordV1;
  model: Iso330xxCapabilityModelV1;
  specContentHash: string;
  options?: CapabilityEvaluateOptions;
}): { ok: boolean; profile?: CapabilityProfileV1; diagnostics: ValidationDiagnostic[] } {
  const diagnostics: ValidationDiagnostic[] = [];
  const opts = input.options ?? {};
  if (opts.include_aggregate_score || opts.maturity_level !== undefined || opts.rollup_percentage !== undefined) {
    return {
      ok: false,
      diagnostics: [{ code: "AGGREGATE_SCORE_FORBIDDEN", message: "rollup options forbidden", path: "options" }],
    };
  }
  const dimensions = CAPABILITY_DIMENSION_IDS.map((dimensionId) => {
    const result = dimensionRating(input.record, dimensionId);
    return {
      dimension_id: dimensionId,
      rating: result.rating,
      evidence_refs: result.refs,
      proof_boundary: input.model.proof_boundary,
      limitations: "Per-dimension only; not organizational certification.",
    };
  });
  return {
    ok: true,
    profile: {
      schema_version: CAPABILITY_PROFILE_SCHEMA,
      spec_content_hash: input.specContentHash,
      dimensions,
      proof_boundary: PROOF_BOUNDARY_NON_CERT,
    },
    diagnostics,
  };
}
