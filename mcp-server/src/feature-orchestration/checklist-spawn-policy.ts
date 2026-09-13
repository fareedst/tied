/**
 * [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION] [ARCH-PSEUDOCODE_FLEET_MIGRATION_GOVERNANCE]
 * [REQ-REQUEST_EVIDENCE_ENVELOPE] — Non-breaking FEAT-spawned checklist defaults (Phase 5 P5-G).
 */
export type FeatSpawnedChecklistRecommendation = {
  effective_after: string;
  policy_doc: string;
  checklist_template: string;
  depth_tier: "integrated";
  gate_policy_default: "advisory";
  envelope_path_pattern: string;
  validator_cli: string;
};

export const FEAT_SPAWNED_CHECKLIST_RECOMMENDATION_PHASE5: FeatSpawnedChecklistRecommendation = {
  effective_after: "2026-09-13",
  policy_doc: "working/fleet-constraint-v2/p5-g-feat-spawned-req-envelope-policy.v1.md",
  checklist_template: "templates/agent-req-checklist-feat-spawned-phase5.v1.yaml",
  depth_tier: "integrated",
  gate_policy_default: "advisory",
  envelope_path_pattern: "working/{REQ-TOKEN}/evidence/request-evidence-envelope.v1.json",
  validator_cli: "node scripts/validate-feat-spawned-envelope-policy.mjs --checklist PATH",
};
