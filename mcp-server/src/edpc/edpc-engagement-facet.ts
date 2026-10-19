/**
 * [IMPL-TIED_EDPC_ENGAGEMENT_FACET] [ARCH-TIED_EDPC_ARTIFACT_MODEL] [REQ-TIED_EDPC_COMPREHENSION] [REQ-TIED_EASAR_RECOVERY]
 */

import type { BrownfieldValidationMode } from "../brownfield-intent-evidence/intent-elevation.js";

export const EDPC_FULL_ENGAGEMENT = "edpc_full" as const;
export const EASAR_FULL_ENGAGEMENT = "easar_full" as const;
export type EdpcEngagement = typeof EDPC_FULL_ENGAGEMENT;

const FULL_ENGAGEMENTS = new Set<string>([EDPC_FULL_ENGAGEMENT, EASAR_FULL_ENGAGEMENT]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readBrownfieldIntentElevation(tracker: unknown): { mode?: BrownfieldValidationMode; engagement?: string } | undefined {
  if (!isRecord(tracker)) return undefined;
  const section = tracker.brownfield_intent_elevation;
  if (!isRecord(section)) return undefined;
  return section as { mode?: BrownfieldValidationMode; engagement?: string };
}

function normalizeEngagement(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  return raw.trim();
}

// [IMPL-TIED_EDPC_ENGAGEMENT_FACET] [ARCH-TIED_EDPC_ARTIFACT_MODEL] [REQ-TIED_EDPC_COMPREHENSION] [REQ-TIED_EASAR_RECOVERY]
export function validateEdpcEngagementFacet(tracker: unknown): { ok: boolean; diagnostics: string[] } {
  const section = readBrownfieldIntentElevation(tracker);
  const diagnostics: string[] = [];
  if (!section?.engagement) return { ok: true, diagnostics: [] };

  const engagement = normalizeEngagement(section.engagement);
  if (!engagement || !FULL_ENGAGEMENTS.has(engagement)) {
    return { ok: false, diagnostics: [`invalid_brownfield_engagement:${engagement ?? ""}`] };
  }
  if (engagement === EASAR_FULL_ENGAGEMENT) {
    diagnostics.push("deprecated_engagement_alias:easar_full");
  }
  const mode: BrownfieldValidationMode = section.mode ?? "report_only";
  if (mode !== "pilot" && mode !== "strict") {
    const modeCode =
      engagement === EASAR_FULL_ENGAGEMENT
        ? "easar_full_requires_pilot_or_strict_mode"
        : "full_engagement_requires_pilot_or_strict_mode";
    return {
      ok: false,
      diagnostics: [...diagnostics, modeCode],
    };
  }
  return { ok: true, diagnostics };
}

export function edpcFullEngagementActive(tracker: unknown): boolean {
  const section = readBrownfieldIntentElevation(tracker);
  const engagement = normalizeEngagement(section?.engagement);
  return engagement === EDPC_FULL_ENGAGEMENT || engagement === EASAR_FULL_ENGAGEMENT;
}
