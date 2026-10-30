/**
 * [REQ-METHODOLOGY-PRODUCTION-SYSTEM-ENROLLMENT] [ARCH-METHODOLOGY-PRODUCTION-SYSTEM-ENROLLMENT]
 * [IMPL-METHODOLOGY-PRODUCTION-SYSTEM-ENROLLMENT]
 */

export const ENROLLMENT_VALIDATOR_SCHEMA_VERSION =
  "methodology-production-system-enrollment-validator.v1" as const;

export const ENROLLMENT_PROOF_BOUNDARY =
  "Enrollment completeness for non-checklist_step production surfaces; composes W1 structural validation; does not prove methodology effectiveness or checklist gate pass.";

/** Surfaces that require surface_ref when enrolling in Loop 3 PDSA. */
export const ENROLLMENT_REQUIRED_SURFACE_REF = [
  "gate_policy",
  "assurance_profile",
  "prompt_type_workflow",
] as const;

/** Leaf prompt types (excludes prompt-type-router). [REQ-PROMPT_TYPE_GLOBAL_SKILLS] [REQ-TIED_HARNESS_LANGCHAIN_PHASE3] */
export const PROMPT_TYPE_LEAF_IDS = [
  "add-feature",
  "refine-plan",
  "build-plan",
  "close-out",
  "debug",
  "question",
  "use-skill",
  "ammend-commit",
  "non-tied-plan",
  "non-tied-debug",
  "leap-ad-hoc",
  "leap-diff-promote",
  "citdp-record",
  "citdp-promote",
  "other",
  "harness-trace-review",
  "harness-trace-analyzer",
  "harness-trace-langsmith-compose",
  "external-service-comparison",
] as const;
