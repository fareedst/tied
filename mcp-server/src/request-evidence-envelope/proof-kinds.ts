/**
 * [IMPL-TIED_CHECKER_BACKED_ENVELOPE_PROOF] [ARCH-TIED_CHECKER_BACKED_ENVELOPE_PROOF]
 * [REQ-TIED_TESTS_CHECKER_CLAIM_COMPOSE] [ARCH-TIED_INDEPENDENT_PROOF_ENVELOPE]
 * Advisory independent_proofs[] proof_kind registry (metadata-only).
 */

import type { EnvelopeGap, IndependentProofRecord } from "./types.js";

export const PROOF_KIND_CHECKER_BACKED_CLAIM = "checker_backed_claim";
export const PROOF_KIND_THEOREM_STATEMENT_METADATA = "theorem_statement_metadata";

export const KNOWN_INDEPENDENT_PROOF_KINDS = new Set<string>([
  PROOF_KIND_CHECKER_BACKED_CLAIM,
  PROOF_KIND_THEOREM_STATEMENT_METADATA,
]);

export const INDEPENDENT_PROOF_GAP_UNKNOWN_KIND = "independent_proof_unknown_proof_kind";
export const INDEPENDENT_PROOF_GAP_MISSING_BOUNDARY = "independent_proof_missing_proof_boundary";

export function collectIndependentProofAdvisoryGaps(
  proofs: IndependentProofRecord[] | undefined,
): EnvelopeGap[] {
  if (!proofs?.length) return [];
  const gaps: EnvelopeGap[] = [];
  for (const proof of proofs) {
    const kind = proof.proof_kind?.trim() ?? "";
    if (!KNOWN_INDEPENDENT_PROOF_KINDS.has(kind)) {
      gaps.push({
        code: INDEPENDENT_PROOF_GAP_UNKNOWN_KIND,
        artifact_kind: null,
        phase: null,
        detail: `proof_id=${proof.proof_id} proof_kind=${kind || "(empty)"}`,
        severity: "warn",
        source: "validate",
      });
      continue;
    }
    const boundary = proof.proof_boundary?.trim() ?? "";
    if (kind === PROOF_KIND_CHECKER_BACKED_CLAIM && boundary.length === 0) {
      gaps.push({
        code: INDEPENDENT_PROOF_GAP_MISSING_BOUNDARY,
        artifact_kind: null,
        phase: null,
        detail: `proof_id=${proof.proof_id} requires non-empty proof_boundary for checker_backed_claim`,
        severity: "warn",
        source: "validate",
      });
    }
  }
  return gaps;
}
