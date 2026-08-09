export interface CasePromotionInput {
  findingId: string;
  originLayer: string;
  divergentEdge: string;
  specificationState: string;
  evidenceReferences: readonly string[];
  reviewers: readonly string[];
}

export type CasePromotionResult =
  | {
      kind: "case-report";
      caseReport: {
        findingId: string;
        originLayer: string;
        divergentEdge: string;
        specificationState: string;
        evidenceReferences: string[];
        productTiedMutation: false;
      };
    }
  | { kind: "not-promoted"; reason: "IndependentReviewRequired" };

// [IMPL-TIED_FIDELITY_RESEARCH] [ARCH-TIED_FIDELITY_RESEARCH] [REQ-TIED_FIDELITY_RESEARCH]
// Promotes one adjudicated finding to a case report without automatic product specification mutation.
export function promoteConfirmedCase(
  input: CasePromotionInput,
): CasePromotionResult {
  const reviewers = new Set(input.reviewers);
  if (reviewers.size < 2) {
    return { kind: "not-promoted", reason: "IndependentReviewRequired" };
  }

  return {
    kind: "case-report",
    caseReport: {
      findingId: input.findingId,
      originLayer: input.originLayer,
      divergentEdge: input.divergentEdge,
      specificationState: input.specificationState,
      evidenceReferences: [...input.evidenceReferences],
      productTiedMutation: false,
    },
  };
}
