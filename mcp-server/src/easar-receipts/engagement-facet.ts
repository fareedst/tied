/**
 * [IMPL-TIED_EASAR_RECEIPTS] [ARCH-TIED_EASAR_ARTIFACT_MODEL] [REQ-TIED_EASAR_RECOVERY]
 * Tracker facet: brownfield_intent_elevation.engagement easar_full (Mode C).
 */

import type { BrownfieldValidationMode } from "../brownfield-intent-evidence/intent-elevation.js";
import { edpcFullEngagementActive, validateEdpcEngagementFacet } from "../edpc/edpc-engagement-facet.js";

export const EASAR_FULL_ENGAGEMENT = "easar_full" as const;
export type EasarEngagement = typeof EASAR_FULL_ENGAGEMENT;

const VALID_ENGAGEMENTS = new Set<string>([EASAR_FULL_ENGAGEMENT, "edpc_full"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export type BrownfieldIntentElevationTracker = {
  mode?: BrownfieldValidationMode;
  engagement?: string;
  entry_points?: Record<string, string>;
};

export function readBrownfieldIntentElevation(tracker: unknown): BrownfieldIntentElevationTracker | undefined {
  if (!isRecord(tracker)) return undefined;
  const section = tracker.brownfield_intent_elevation;
  if (!isRecord(section)) return undefined;
  return section as BrownfieldIntentElevationTracker;
}

// [IMPL-TIED_EASAR_RECEIPTS] [REQ-TIED_EASAR_RECOVERY] — How: easar_full requires pilot or strict mode; report_only stays Mode B only.
export function validateEasarEngagementFacet(tracker: unknown): { ok: boolean; diagnostics: string[] } {
  // [IMPL-TIED_EDPC_ENGAGEMENT_FACET] [REQ-TIED_EDPC_COMPREHENSION] — How: edpc_full primary; easar_full deprecated alias.
  return validateEdpcEngagementFacet(tracker);
}

export function easarFullEngagementActive(tracker: unknown): boolean {
  return edpcFullEngagementActive(tracker);
}
