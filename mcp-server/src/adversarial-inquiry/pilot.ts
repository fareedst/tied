export type PilotCalibrationInput = {
  sampleSize: number;
  truePositives: number;
  falsePositives: number;
  reviewerAgreements: number;
  reviewerComparisons: number;
  negativeControlsDetected: boolean;
  deterministicScope: boolean;
  explicitProofBoundaries: boolean;
  waiverSupport: boolean;
  representativeEvidence: boolean;
  localMinutes: number;
  ciMinutes: number;
  consecutiveBudgetBreaches: number;
};

export type PilotCalibrationResult = {
  precision: number;
  reviewerAgreement: number;
  eligibleForStrict: boolean;
  stopExpansion: boolean;
  diagnostics: string[];
};

// [IMPL-TIED_ADVERSARIAL_INQUIRY] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY]
// How: measure pilot precision, reviewer agreement, proof controls, and bounded cost before strict promotion.
export function calibratePilot(input: PilotCalibrationInput): PilotCalibrationResult {
  const diagnostics: string[] = [];
  const precisionDenominator = input.truePositives + input.falsePositives;
  const precision = precisionDenominator > 0 ? input.truePositives / precisionDenominator : 0;
  const reviewerAgreement = input.reviewerComparisons > 0
    ? input.reviewerAgreements / input.reviewerComparisons
    : 0;
  if (!input.negativeControlsDetected) diagnostics.push("negative_controls_required");
  if (!input.deterministicScope) diagnostics.push("deterministic_scope_required");
  if (!input.explicitProofBoundaries) diagnostics.push("proof_boundaries_required");
  if (!input.waiverSupport) diagnostics.push("waiver_support_required");
  if (!input.representativeEvidence) diagnostics.push("representative_evidence_required");
  if (input.localMinutes > 5) diagnostics.push("local_budget_exceeded");
  if (input.ciMinutes > 15) diagnostics.push("ci_budget_exceeded");

  return {
    precision,
    reviewerAgreement,
    eligibleForStrict:
      input.sampleSize > 0
      && input.negativeControlsDetected
      && input.deterministicScope
      && input.explicitProofBoundaries
      && input.waiverSupport
      && input.representativeEvidence,
    stopExpansion: input.consecutiveBudgetBreaches >= 2,
    diagnostics,
  };
}
