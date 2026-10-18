/**
 * [IMPL-TIED_CONTEXT_ADAPTIVE_PROFILE] [ARCH-TIED_CONTEXT_ADAPTIVE_ENGINEERING]
 * [REQ-TIED_CONTEXT_ADAPTIVE_ENGINEERING]
 */

import {
  CONTEXT_PROFILE_SCHEMA,
  PROFILE_DIMENSIONS,
  type DimensionLevel,
  DIMENSION_LEVELS,
} from "./constants.js";
import type { ValidationDiagnostic } from "./contracts.js";

export type ContextProfileV1 = {
  schema_version: typeof CONTEXT_PROFILE_SCHEMA;
  objective?: string;
  dimensions: Partial<Record<(typeof PROFILE_DIMENSIONS)[number], DimensionLevel>>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** [IMPL-TIED_CONTEXT_ADAPTIVE_PROFILE] VALIDATE_CONTEXT_PROFILE_V1 */
export function validateContextProfileV1(input: unknown): {
  ok: boolean;
  profile?: ContextProfileV1;
  diagnostics: ValidationDiagnostic[];
} {
  const diagnostics: ValidationDiagnostic[] = [];
  if (!isRecord(input)) {
    return {
      ok: false,
      diagnostics: [{ code: "INVALID_ROOT", message: "profile must be an object", path: "$" }],
    };
  }
  if (input.schema_version !== CONTEXT_PROFILE_SCHEMA) {
    diagnostics.push({
      code: "WRONG_SCHEMA",
      message: `schema_version must be ${CONTEXT_PROFILE_SCHEMA}`,
      path: "schema_version",
    });
  }
  if (!isRecord(input.dimensions)) {
    diagnostics.push({ code: "MISSING_FIELD", message: "dimensions required", path: "dimensions" });
    return { ok: false, diagnostics };
  }
  const normalized: ContextProfileV1["dimensions"] = {};
  for (const [key, value] of Object.entries(input.dimensions)) {
    if (!PROFILE_DIMENSIONS.includes(key as (typeof PROFILE_DIMENSIONS)[number])) {
      diagnostics.push({ code: "UNSUPPORTED_DIMENSION", message: `unsupported dimension ${key}`, path: `dimensions.${key}` });
      continue;
    }
    if (typeof value !== "string" || !DIMENSION_LEVELS.includes(value as DimensionLevel)) {
      diagnostics.push({ code: "INVALID_ENUM", message: "invalid dimension level", path: `dimensions.${key}` });
      continue;
    }
    normalized[key as (typeof PROFILE_DIMENSIONS)[number]] = value as DimensionLevel;
  }
  if (diagnostics.length > 0) {
    return { ok: false, diagnostics };
  }
  return {
    ok: true,
    profile: {
      schema_version: CONTEXT_PROFILE_SCHEMA,
      objective: typeof input.objective === "string" ? input.objective : undefined,
      dimensions: normalized,
    },
    diagnostics: [],
  };
}

/** Returns false when rule expects LOW but profile has UNKNOWN (conservative). */
export function applicabilityMatches(
  allowed: DimensionLevel[] | undefined,
  actual: DimensionLevel | undefined,
): boolean {
  if (!allowed || allowed.length === 0) return true;
  if (actual === undefined) return false;
  if (actual === "UNKNOWN") {
    return allowed.includes("UNKNOWN");
  }
  return allowed.includes(actual);
}
