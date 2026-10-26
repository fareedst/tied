/**
 * change-impact-profile.v1 — plumb opt-in path legs (Wave 3).
 * Proof boundary: path/glob touch only — not semantic or REQ satisfaction.
 *
 * [IMPL-TIED_CHANGE_IMPACT_PROFILE] [ARCH-TIED_CHANGE_IMPACT_PROFILE] [REQ-TIED_OPEN_ONTOLOGIES_WAVE3]
 */

import fs from "node:fs";
import yaml from "js-yaml";
import { z } from "zod";

import { matchPathAgainstGlobs } from "./change-locality-pilot.js";

export const CHANGE_IMPACT_PROFILE_SCHEMA_VERSION = "change-impact-profile.v1";

const ImpactLegDefSchema = z.object({
  leg_id: z.string().min(1),
  label: z.string().min(1),
  path_globs: z.array(z.string().min(1)).min(1),
  related_tokens: z.array(z.string()).optional(),
});

export const ChangeImpactProfileSchema = z.object({
  schema_version: z.literal(CHANGE_IMPACT_PROFILE_SCHEMA_VERSION),
  proof_boundary: z.string().min(1),
  legs: z.array(ImpactLegDefSchema).min(1),
});

export type ChangeImpactProfileV1 = z.infer<typeof ChangeImpactProfileSchema>;

export type ImpactLegReportRow = {
  leg_id: string;
  label: string;
  path_globs: string[];
  matched_touched_paths: string[];
  matched_count: number;
  related_tokens?: string[];
  semantics: "not_measured";
};

export type LoadChangeImpactProfileResult =
  | { ok: true; profile: ChangeImpactProfileV1; source_path: string }
  | { ok: false; diagnostics: string[]; source_path: string };

function formatZodIssues(error: z.ZodError): string[] {
  return error.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`);
}

/** [IMPL-TIED_CHANGE_IMPACT_PROFILE] [ARCH-TIED_CHANGE_IMPACT_PROFILE] [REQ-TIED_OPEN_ONTOLOGIES_WAVE3] */
export function parseChangeImpactProfile(raw: unknown): ChangeImpactProfileV1 {
  return ChangeImpactProfileSchema.parse(raw);
}

/** [IMPL-TIED_CHANGE_IMPACT_PROFILE] [ARCH-TIED_CHANGE_IMPACT_PROFILE] [REQ-TIED_OPEN_ONTOLOGIES_WAVE3] */
export function loadChangeImpactProfile(sourcePathAbs: string): LoadChangeImpactProfileResult {
  const source_path = sourcePathAbs;
  if (!fs.existsSync(sourcePathAbs)) {
    return {
      ok: false,
      source_path,
      diagnostics: [`Profile file not found: ${sourcePathAbs}`],
    };
  }
  let raw: unknown;
  try {
    const text = fs.readFileSync(sourcePathAbs, "utf8");
    raw = yaml.load(text);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, source_path, diagnostics: [`YAML parse error: ${msg}`] };
  }
  const parsed = ChangeImpactProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, source_path, diagnostics: formatZodIssues(parsed.error) };
  }
  return { ok: true, source_path, profile: parsed.data };
}

/** [IMPL-TIED_CHANGE_IMPACT_PROFILE] [ARCH-TIED_CHANGE_IMPACT_PROFILE] [REQ-TIED_OPEN_ONTOLOGIES_WAVE3] */
export function computeImpactLegs(
  profile: ChangeImpactProfileV1,
  touchedPaths: string[]
): ImpactLegReportRow[] {
  const normalizedTouched = [...new Set(touchedPaths.map((p) => p.split("\\").join("/")))].sort();
  const legsSorted = [...profile.legs].sort((a, b) => a.leg_id.localeCompare(b.leg_id));
  return legsSorted.map((leg) => {
    const matched = normalizedTouched.filter((p) => matchPathAgainstGlobs(p, leg.path_globs)).sort();
    return {
      leg_id: leg.leg_id,
      label: leg.label,
      path_globs: leg.path_globs,
      matched_touched_paths: matched,
      matched_count: matched.length,
      related_tokens: leg.related_tokens,
      semantics: "not_measured" as const,
    };
  });
}
