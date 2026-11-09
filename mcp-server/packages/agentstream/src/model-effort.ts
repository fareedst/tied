/**
 * [IMPL-WF_TRIAL_MODEL_EFFORT] [ARCH-WF_TRIAL_MODEL_EFFORT] [REQ-WF_TRIAL_MODEL_EFFORT]
 * Operator model effort levels (Anthropic Messages output_config.effort).
 */
export const MODEL_EFFORT_LEVELS = [
  "low",
  "medium",
  "high",
  "xhigh",
  "max",
] as const;

export type ModelEffortLevel = (typeof MODEL_EFFORT_LEVELS)[number];

const EFFORT_TIER_TOKENS = new Set([
  "none",
  "minimal",
  "low",
  "medium",
  "high",
  "xhigh",
  "max",
  "extra-high",
]);

const MIDDLE_MODIFIER_TOKENS = new Set(["thinking"]);

const LEGACY_BRACKET_TAIL = /^(.+?)\[([^\]]+)\]$/;

export function normalizeModelEffort(raw: string): string {
  const t = raw.trim().toLowerCase();
  if (t === "" || t === "-") {
    return "";
  }
  return t;
}

export function isAllowedModelEffort(level: string): level is ModelEffortLevel {
  return (MODEL_EFFORT_LEVELS as readonly string[]).includes(level);
}

export function resolveModelEffort(cliValue: string, envValue: string): string {
  const fromCli = normalizeModelEffort(cliValue);
  if (fromCli !== "") {
    return fromCli;
  }
  return normalizeModelEffort(envValue);
}

/** Opt-out: plain --model slug (no tier rewrite). Env name retained from phase 2. */
export function cursorModelBracketEffortDisabled(): boolean {
  const v = process.env.AGENTSTREAM_CURSOR_MODEL_BRACKET_EFFORT?.trim();
  return v === "0" || v === "false";
}

/** Cursor catalog has no effort tiers for Composer 2.5 family. */
export function cursorSlugEffortRewriteBlocked(modelSlug: string): boolean {
  const slug = stripLegacyBracketModel(modelSlug).trim().toLowerCase();
  return slug === "composer-2.5" || slug.startsWith("composer-2.5-");
}

function stripLegacyBracketModel(slug: string): string {
  const m = slug.trim().match(LEGACY_BRACKET_TAIL);
  return m ? m[1]!.trim() : slug.trim();
}

function effortTierForCatalog(base: string, effort: string): string {
  const b = base.toLowerCase();
  if (effort === "xhigh" && (b.startsWith("gpt-5.5") || b.includes("gpt-5.5"))) {
    return "extra-high";
  }
  return effort;
}

type ParsedCursorSlug = {
  base: string;
  middleMods: string[];
  priorEffort: string;
  hasFast: boolean;
};

function parseCursorCatalogSlug(slug: string): ParsedCursorSlug {
  const bare = stripLegacyBracketModel(slug);
  const parts = bare.split("-").filter((p) => p !== "");
  let hasFast = false;
  if (parts.length > 0 && parts[parts.length - 1] === "fast") {
    hasFast = true;
    parts.pop();
  }
  const middleMods: string[] = [];
  let priorEffort = "";
  while (parts.length > 0) {
    const last = parts[parts.length - 1]!;
    if (EFFORT_TIER_TOKENS.has(last)) {
      priorEffort = last;
      parts.pop();
      continue;
    }
    if (MIDDLE_MODIFIER_TOKENS.has(last)) {
      middleMods.unshift(last);
      parts.pop();
      continue;
    }
    break;
  }
  const base = parts.join("-");
  return { base, middleMods, priorEffort, hasFast };
}

function buildCursorCatalogSlug(
  base: string,
  middleMods: string[],
  effortTier: string,
  hasFast: boolean,
): string {
  const segs = [base, ...middleMods, effortTier].filter((s) => s !== "");
  if (hasFast) {
    segs.push("fast");
  }
  return segs.join("-");
}

/** Format --model for Cursor agent: hyphen catalog tier (not bracket effort). */
export function applyCursorModelForAgent(
  baseModel: string,
  modelEffort: string,
): string {
  const trimmed = baseModel.trim();
  if (trimmed === "") {
    return "Auto";
  }
  const lower = trimmed.toLowerCase();
  if (lower === "auto") {
    return trimmed;
  }
  const effort = normalizeModelEffort(modelEffort);
  if (effort === "" || cursorModelBracketEffortDisabled()) {
    return stripLegacyBracketModel(trimmed);
  }
  const normalizedBase = stripLegacyBracketModel(trimmed);
  if (cursorSlugEffortRewriteBlocked(normalizedBase)) {
    return normalizedBase;
  }

  const parsed = parseCursorCatalogSlug(normalizedBase);
  if (parsed.base === "") {
    return normalizedBase;
  }
  const tier = effortTierForCatalog(parsed.base, effort);
  const rebuilt = buildCursorCatalogSlug(
    parsed.base,
    parsed.middleMods,
    tier,
    parsed.hasFast,
  );
  if (rebuilt === normalizedBase) {
    return normalizedBase;
  }
  return rebuilt;
}

/** Cursor encodes depth in slug; emit diagnostic when effort is set but slug lacks a tier hint. */
export function cursorSlugMayMismatchEffort(
  modelSlug: string,
  effort: string,
): boolean {
  const e = normalizeModelEffort(effort);
  if (e === "") {
    return false;
  }
  const slug = stripLegacyBracketModel(modelSlug).toLowerCase();
  if (slug === "" || slug === "auto") {
    return true;
  }
  if (cursorSlugEffortRewriteBlocked(modelSlug)) {
    return true;
  }
  const parsed = parseCursorCatalogSlug(slug);
  if (parsed.priorEffort !== "") {
    const tier = effortTierForCatalog(parsed.base, e);
    return parsed.priorEffort !== tier;
  }
  const tokens = [
    "low",
    "med",
    "medium",
    "high",
    "xhigh",
    "max",
    "lunalow",
    "lunamed",
    "lunahigh",
    "thinking",
  ];
  for (const tok of tokens) {
    if (slug.includes(tok)) {
      return false;
    }
  }
  return true;
}
