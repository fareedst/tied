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

/** Opt-out restores phase-1 plain --model behavior. */
export function cursorModelBracketEffortDisabled(): boolean {
  const v = process.env.AGENTSTREAM_CURSOR_MODEL_BRACKET_EFFORT?.trim();
  return v === "0" || v === "false";
}

const BRACKET_TAIL = /^(.+?)\[([^\]]+)\]$/;

function parseBracketPairs(inner: string): Map<string, string> {
  const pairs = new Map<string, string>();
  for (const part of inner.split(",")) {
    const trimmed = part.trim();
    if (trimmed === "") {
      continue;
    }
    const eq = trimmed.indexOf("=");
    if (eq <= 0) {
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (key !== "") {
      pairs.set(key, val);
    }
  }
  return pairs;
}

function formatBracketPairs(pairs: Map<string, string>): string {
  const parts: string[] = [];
  for (const [k, v] of pairs) {
    parts.push(`${k}=${v}`);
  }
  return parts.join(",");
}

export function mergeCursorModelOverrideEnv(pairs: Map<string, string>): void {
  const raw = process.env.AGENTSTREAM_CURSOR_MODEL_OVERRIDES?.trim() ?? "";
  if (raw === "") {
    return;
  }
  for (const part of raw.split(",")) {
    const trimmed = part.trim();
    if (trimmed === "") {
      continue;
    }
    const eq = trimmed.indexOf("=");
    if (eq <= 0) {
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (key !== "") {
      pairs.set(key, val);
    }
  }
}

/** Format --model for Cursor agent including bracket effort and optional overrides. */
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
    return trimmed;
  }

  let name = trimmed;
  const pairs = new Map<string, string>();
  const m = trimmed.match(BRACKET_TAIL);
  if (m) {
    name = m[1]!.trim();
    for (const [k, v] of parseBracketPairs(m[2]!)) {
      pairs.set(k, v);
    }
  }
  pairs.set("effort", effort);
  mergeCursorModelOverrideEnv(pairs);
  return `${name}[${formatBracketPairs(pairs)}]`;
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
  const slug = modelSlug.trim().toLowerCase();
  if (slug === "" || slug === "auto") {
    return true;
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
