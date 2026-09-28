/**
 * [IMPL-TIED_JEV_DECISION_COPROCESSOR] [ARCH-TIED_JEV_DECISION_COPROCESSOR] [REQ-TIED_JEV_DECISION_COPROCESSOR]
 */

export const PLAN_SKILL_VALUES = [
  "plan-new-feature",
  "refine-plan",
  "build-plan",
  "plan-close-out",
] as const;

export type PlanSkillName = (typeof PLAN_SKILL_VALUES)[number];

export type PlanSkillsReadiness =
  | "disabled"
  | "configured_no_credentials"
  | "configured_unreachable"
  | "ready"
  | "locally_skipped";

export type PlanSkillsEnabledSource = "env" | "tied_yaml" | "default_off";

export type PlanSkillsFailureClass =
  | "timeout"
  | "transport"
  | "http_status"
  | "malformed_response"
  | "invalid_answers"
  | "tool_unavailable";

export const PLAN_SKILLS_STATUS_SCHEMA = "jev-plan-skills-status.v1";
export const PLAN_SKILLS_VOCAB_SHADOW_SCHEMA = "jev-plan-skills-vocab-shadow.v1";

export const PLAN_SKILLS_PROOF_BOUNDARY =
  "Advisory plan-skills shadow only; never checklist gate proof, envelope authority, or integrated adversarial inquiry activation.";

export const PLAN_SKILLS_STATUS_PROOF_BOUNDARY =
  "Configuration snapshot only; no vendor probe; never gate proof or inquiry activation.";

export function isPlanSkillName(value: string): value is PlanSkillName {
  return (PLAN_SKILL_VALUES as readonly string[]).includes(value);
}
