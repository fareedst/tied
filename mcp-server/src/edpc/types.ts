/**
 * [IMPL-TIED_EDPC_ACCESS] [ARCH-TIED_EDPC_ARTIFACT_MODEL] [REQ-TIED_EDPC_COMPREHENSION]
 */

export const EVIDENCE_ACCESS_TIERS = ["source_static", "toolchain_readonly", "source_change"] as const;
export type EvidenceAccessTier = (typeof EVIDENCE_ACCESS_TIERS)[number];

export type CapabilityFlags = {
  compile?: boolean;
  test?: boolean;
  execute?: boolean;
  source_write?: boolean;
};

export type ProductionTouch = "none" | "read_only" | "approved_execute";

export type EvidenceAccessMatrix = {
  schema_version?: string;
  evidence_access_tier: EvidenceAccessTier;
  capabilities?: CapabilityFlags;
  production_touch?: ProductionTouch;
};

export type EdpcEngagementTracker = {
  evidence_access_tier?: EvidenceAccessTier;
  target_repository_root?: string;
  production_touch?: ProductionTouch;
  charter_path?: string;
  access_matrix_path?: string;
};
