/**
 * [REQ-METHODOLOGY-KAIZEN-EXPERIMENT-BRIDGE] [ARCH-METHODOLOGY-KAIZEN-EXPERIMENT-BRIDGE]
 * [IMPL-METHODOLOGY-KAIZEN-EXPERIMENT-BRIDGE]
 */

import { METHODOLOGY_LEARNING_EXPERIMENT_SCHEMA_VERSION } from "../methodology-learning-experiment/constants.js";

export { METHODOLOGY_LEARNING_EXPERIMENT_SCHEMA_VERSION };

export const BRIDGE_REPORT_SCHEMA_VERSION = "methodology-kaizen-experiment-bridge.v1" as const;

export const BRIDGE_PROOF_BOUNDARY =
  "Bridge draft and eligibility only; does not prove hypothesis truth, methodology effectiveness, or persist experiments.";

export const DEFAULT_BRIDGE_PRIVACY_TIER = "operator_local" as const;

export const DEFAULT_BRIDGE_PRODUCTION_SYSTEM_SURFACE = "checklist_step" as const;
