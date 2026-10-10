/**
 * [REQ-METHODOLOGY-LEARNING-EXPERIMENT] [ARCH-METHODOLOGY-LEARNING-EXPERIMENT]
 * [IMPL-METHODOLOGY-LEARNING-EXPERIMENT]
 */

export const METHODOLOGY_LEARNING_EXPERIMENT_SCHEMA_VERSION =
  "methodology-learning-experiment.v1" as const;

export const VALIDATOR_SCHEMA_VERSION = "methodology-learning-experiment-validator.v1" as const;

export const VALIDATOR_PROOF_BOUNDARY =
  "Structural validation and persistence lifecycle only; does not prove methodology effectiveness.";

export const PRODUCTION_SYSTEM_SURFACES = [
  "checklist_step",
  "gate_policy",
  "assurance_profile",
  "prompt_type_workflow",
] as const;

export const OUTCOME_OBSERVATION_VALUES = [
  "improved",
  "unchanged",
  "regressed",
  "inconclusive",
  "not_measured",
] as const;

export const METHODOLOGY_EXPERIMENTS_FILENAME = "methodology-experiments.yaml";
