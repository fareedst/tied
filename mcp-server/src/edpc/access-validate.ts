/**
 * [IMPL-TIED_EDPC_ACCESS] [ARCH-TIED_EDPC_ARTIFACT_MODEL] [REQ-TIED_EDPC_COMPREHENSION]
 */

import type { CapabilityFlags, EdpcEngagementTracker, EvidenceAccessMatrix, EvidenceAccessTier, ProductionTouch } from "./types.js";
import { EVIDENCE_ACCESS_TIERS } from "./types.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function readEdpcEngagement(tracker: unknown): EdpcEngagementTracker | undefined {
  if (!isRecord(tracker)) return undefined;
  const section = tracker.edpc_engagement;
  if (!isRecord(section)) return undefined;
  return section as EdpcEngagementTracker;
}

// [IMPL-TIED_EDPC_ACCESS] [REQ-TIED_EDPC_COMPREHENSION] — How: source_static forbids compile, test, execute, source_write; toolchain_readonly forbids source_write only.
export function forbiddenFlagsForTier(tier: EvidenceAccessTier, flags: CapabilityFlags): string[] {
  const violations: string[] = [];
  const cap = flags ?? {};
  if (tier === "source_static") {
    for (const flag of ["compile", "test", "execute", "source_write"] as const) {
      if (cap[flag] === true) violations.push(`forbidden_capability:${flag}:source_static`);
    }
  }
  if (tier === "toolchain_readonly" && cap.source_write === true) {
    violations.push("forbidden_capability:source_write:toolchain_readonly");
  }
  return violations;
}

function tierRank(tier: EvidenceAccessTier): number {
  if (tier === "source_static") return 0;
  if (tier === "toolchain_readonly") return 1;
  return 2;
}

function assertProductionTouchRules(
  matrix: EvidenceAccessMatrix,
  trackerEngagement?: EdpcEngagementTracker,
): string[] {
  const diagnostics: string[] = [];
  const touch: ProductionTouch =
    matrix.production_touch ?? trackerEngagement?.production_touch ?? "none";
  if (touch === "none") return diagnostics;
  if (tierRank(matrix.evidence_access_tier) < tierRank("toolchain_readonly")) {
    diagnostics.push("production_touch_requires_toolchain");
  }
  return diagnostics;
}

// [IMPL-TIED_EDPC_ACCESS] [ARCH-TIED_EDPC_ARTIFACT_MODEL] [REQ-TIED_EDPC_COMPREHENSION]
export function validateEdpcAccessMatrix(
  matrix: unknown,
  trackerEngagement?: EdpcEngagementTracker,
): { ok: boolean; diagnostics: string[] } {
  const diagnostics: string[] = [];
  if (!isRecord(matrix)) {
    return { ok: false, diagnostics: ["invalid_access_matrix"] };
  }
  const tier = matrix.evidence_access_tier;
  if (typeof tier !== "string" || !EVIDENCE_ACCESS_TIERS.includes(tier as EvidenceAccessTier)) {
    diagnostics.push("unknown_tier");
    return { ok: false, diagnostics };
  }
  const typedTier = tier as EvidenceAccessTier;
  const capabilities = (matrix.capabilities ?? {}) as CapabilityFlags;
  diagnostics.push(...forbiddenFlagsForTier(typedTier, capabilities));
  diagnostics.push(...assertProductionTouchRules(matrix as EvidenceAccessMatrix, trackerEngagement));

  if (trackerEngagement?.charter_path && trackerEngagement?.access_matrix_path) {
    if (
      typeof matrix.charter_path === "string" &&
      matrix.charter_path !== trackerEngagement.charter_path
    ) {
      diagnostics.push("path_mismatch:charter_path");
    }
    if (
      typeof matrix.access_matrix_path === "string" &&
      matrix.access_matrix_path !== trackerEngagement.access_matrix_path
    ) {
      diagnostics.push("path_mismatch:access_matrix_path");
    }
  }

  return { ok: diagnostics.length === 0, diagnostics };
}
