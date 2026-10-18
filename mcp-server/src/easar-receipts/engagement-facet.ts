/**
 * [IMPL-TIED_EASAR_RECEIPTS] [ARCH-TIED_EASAR_ARTIFACT_MODEL] [REQ-TIED_EASAR_RECOVERY]
 * Tracker facet: brownfield_intent_elevation.engagement easar_full (Mode C).
 */

import type { BrownfieldValidationMode } from "../brownfield-intent-evidence/intent-elevation.js";

export const EASAR_FULL_ENGAGEMENT = "easar_full" as const;
export type EasarEngagement = typeof EASAR_FULL_ENGAGEMENT;

const VALID_ENGAGEMENTS = new Set<string>([EASAR_FULL_ENGAGEMENT]);

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
  const section = readBrownfieldIntentElevation(tracker);
  if (!section?.engagement) return { ok: true, diagnostics: [] };
  const engagement = section.engagement.trim();
  if (!VALID_ENGAGEMENTS.has(engagement)) {
    return { ok: false, diagnostics: [`invalid_brownfield_engagement:${engagement}`] };
  }
  const mode = section.mode ?? "report_only";
  if (engagement === EASAR_FULL_ENGAGEMENT && mode !== "pilot" && mode !== "strict") {
    return {
      ok: false,
      diagnostics: ["easar_full_requires_pilot_or_strict_mode"],
    };
  }
  return { ok: true, diagnostics: [] };
}

export function easarFullEngagementActive(tracker: unknown): boolean {
  const section = readBrownfieldIntentElevation(tracker);
  return section?.engagement === EASAR_FULL_ENGAGEMENT;
}
