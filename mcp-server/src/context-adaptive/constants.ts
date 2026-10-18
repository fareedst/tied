/**
 * [REQ-TIED_CONTEXT_ADAPTIVE_ENGINEERING] [ARCH-TIED_CONTEXT_ADAPTIVE_ENGINEERING]
 * [IMPL-TIED_CONTEXT_ADAPTIVE_CONTRACTS]
 */

export const PRACTICE_CONTRACT_SCHEMA = "practice-contract.v1" as const;
export const PRACTICE_LIBRARY_SCHEMA = "practice-library.v1" as const;
export const CONTEXT_PROFILE_SCHEMA = "context-profile.v1" as const;
export const SELECTION_RECEIPT_SCHEMA = "selection-receipt.v1" as const;

export const DIMENSION_LEVELS = ["LOW", "MEDIUM", "HIGH", "UNKNOWN"] as const;
export type DimensionLevel = (typeof DIMENSION_LEVELS)[number];

export const PROFILE_DIMENSIONS = [
  "uncertainty",
  "criticality",
  "coupling",
  "concurrency",
  "observability",
  "reversibility",
  "environmental",
  "rate_of_change",
  "security",
] as const;

export type ProfileDimension = (typeof PROFILE_DIMENSIONS)[number];

export const SELECTOR_PROOF_BOUNDARY =
  "Deterministic rule-ordered selection; advisory only — not checklist authority.";
