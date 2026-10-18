/**
 * [IMPL-TIED_BOUNDED_PILOT_BUDGET] [IMPL-TIED_BOUNDED_TRAJECTORY_EVIDENCE]
 * [ARCH-TIED_BOUNDED_COMPOSITION] [REQ-TIED_BOUNDED_COMPOSITION]
 */

export const PILOT_BUDGET_SCHEMA_VERSION = "pilot-budget.v1";

export const BOUNDED_PROOF_BOUNDARIES = {
  defaultOffOptIn: "default_off_opt_in_only",
  harness2MechanicsNotEffectiveness: "harness2_mechanics_not_effectiveness",
  rawTrajectoriesOperatorLocal: "raw_trajectories_operator_local",
  advisoryNotGateAuthority: "shadow_and_divergence_advisory_not_gate_authority",
} as const;

export const BOUNDED_ENVELOPE_ARTIFACT_SCHEMAS = {
  pilotBudget: "pilot-budget.v1",
  trajectoryManifest: "trajectory-manifest.v1",
  divergenceReport: "trajectory-divergence-report.v1",
  lessonDraftReport: "trajectory-lesson-draft-report.v1",
  shadowComparison: "shadow-comparison.v1",
} as const;
