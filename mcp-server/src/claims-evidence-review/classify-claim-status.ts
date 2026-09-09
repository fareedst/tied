import type {
  ClaimRecord,
  ClaimReviewRow,
  CollectedEvidence,
  ClaimDisposition,
  ProofBoundary,
} from "./types.js";

// [IMPL-TIED_CLAIMS_EVIDENCE_REVIEW] [ARCH-TIED_CLAIMS_EVIDENCE_REVIEW] [REQ-TIED_CLAIMS_EVIDENCE_REVIEW]
// Classify shown | unsettled | not_examined with demonstrated_gap and unresolved_exposure dimensions.
export function classifyClaimStatus(input: {
  claim: ClaimRecord;
  evidence: CollectedEvidence | undefined;
  executionPolicy: "static_only";
}): ClaimReviewRow {
  const { claim, evidence, executionPolicy } = input;
  let disposition: ClaimDisposition;
  let reason: string;
  let proofBoundary: ProofBoundary;
  let demonstratedGap = false;
  let unresolvedExposure = false;
  const evidenceRefs: string[] = [];

  if (executionPolicy !== "static_only") {
    throw new Error("AmbiguousDisposition: unsupported execution policy");
  }

  if (claim.requiresRuntimeProof) {
    disposition = "not_examined";
    reason = "Claim requires runtime proof; static_only slice cannot examine.";
    proofBoundary = "out_of_scope_static_slice";
    unresolvedExposure = true;
  } else if (!evidence) {
    disposition = "not_examined";
    reason = "No evidence stub declared for claim.";
    proofBoundary = "static_analysis";
  } else if (evidence.proofBoundary === "out_of_scope_static_slice") {
    disposition = "not_examined";
    reason = "Evidence stub marked out of scope for static slice.";
    proofBoundary = "out_of_scope_static_slice";
    unresolvedExposure = true;
  } else if (evidence.found && evidence.contentHash) {
    disposition = "shown";
    reason = "Static evidence located with content hash.";
    proofBoundary = "static_analysis";
    if (evidence.path) evidenceRefs.push(evidence.path);
    if (evidence.command) evidenceRefs.push(evidence.command);
  } else if (evidence.found) {
    disposition = "unsettled";
    reason = "Evidence path referenced but content hash missing.";
    proofBoundary = "static_analysis";
    demonstratedGap = true;
    unresolvedExposure = true;
    if (evidence.path) evidenceRefs.push(evidence.path);
  } else {
    disposition = "unsettled";
    reason = "Bounded static search did not locate declared evidence.";
    proofBoundary = "static_analysis";
    unresolvedExposure = true;
  }

  return {
    claimId: claim.id,
    disposition,
    reason,
    proofBoundary,
    demonstratedGap,
    unresolvedExposure,
    evidenceRefs,
  };
}

export function classifyAllClaims(input: {
  claims: readonly ClaimRecord[];
  evidenceByClaimId: ReadonlyMap<string, CollectedEvidence>;
  executionPolicy: "static_only";
}): ClaimReviewRow[] {
  return input.claims.map((claim) =>
    classifyClaimStatus({
      claim,
      evidence: input.evidenceByClaimId.get(claim.id),
      executionPolicy: input.executionPolicy,
    }),
  );
}
