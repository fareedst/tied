/**
 * [REQ-WF_TRIAL_MODEL_EFFORT] [IMPL-WF_TRIAL_MODEL_EFFORT]
 * Canonicalize Cursor agent catalog model slugs (Grok vendor prefix by minor version).
 *
 * Grok 4.5 / 4.6: cursor-grok-{version}-…
 * Grok 4.7+:       grok-{version}-… (no cursor- prefix)
 * Composer 2.5:    unchanged (composer-2.5, composer-2.5-fast)
 */
import { pathToFileURL } from "node:url";

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

/** @param {string} slug */
export function stripLegacyBracketModel(slug) {
  const m = slug.trim().match(LEGACY_BRACKET_TAIL);
  return m ? m[1].trim() : slug.trim();
}

/**
 * @param {string} a
 * @param {string} b
 */
function compareDottedVersion(a, b) {
  const pa = a.split(".").map((x) => Number.parseInt(x, 10) || 0);
  const pb = b.split(".").map((x) => Number.parseInt(x, 10) || 0);
  const n = Math.max(pa.length, pb.length);
  for (let i = 0; i < n; i++) {
    const da = pa[i] ?? 0;
    const db = pb[i] ?? 0;
    if (da !== db) {
      return da < db ? -1 : 1;
    }
  }
  return 0;
}

/**
 * @param {string} base
 */
export function canonicalizeGrokCatalogBase(base) {
  const trimmed = base.trim();
  if (trimmed === "") {
    return base;
  }
  const lower = trimmed.toLowerCase();
  let rest = lower;
  if (rest.startsWith("cursor-")) {
    rest = rest.slice("cursor-".length);
  }
  const m = rest.match(/^grok-(4\.\d+)$/);
  if (!m) {
    return trimmed;
  }
  const version = m[1];
  if (compareDottedVersion(version, "4.7") < 0) {
    return `cursor-grok-${version}`;
  }
  return `grok-${version}`;
}

/**
 * @param {string} slug
 * @returns {{ base: string; middleMods: string[]; priorEffort: string; hasFast: boolean }}
 */
export function parseCursorCatalogSlug(slug) {
  const bare = stripLegacyBracketModel(slug);
  const parts = bare.split("-").filter((p) => p !== "");
  let hasFast = false;
  if (parts.length > 0 && parts[parts.length - 1] === "fast") {
    hasFast = true;
    parts.pop();
  }
  const middleMods = [];
  let priorEffort = "";
  while (parts.length > 0) {
    const last = parts[parts.length - 1];
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

/**
 * @param {string} base
 * @param {string[]} middleMods
 * @param {string} effortTier
 * @param {boolean} hasFast
 */
function buildCursorCatalogSlug(base, middleMods, effortTier, hasFast) {
  const segs = [base, ...middleMods, effortTier].filter((s) => s !== "");
  if (hasFast) {
    segs.push("fast");
  }
  return segs.join("-");
}

/**
 * @param {string} slug
 */
export function canonicalizeCursorAgentModelSlug(slug) {
  const trimmed = slug.trim();
  if (trimmed === "") {
    return trimmed;
  }
  const lower = trimmed.toLowerCase();
  if (lower === "auto") {
    return trimmed;
  }
  const bare = stripLegacyBracketModel(trimmed);
  const parsed = parseCursorCatalogSlug(bare);
  if (parsed.base === "") {
    return bare;
  }
  const canonBase = canonicalizeGrokCatalogBase(parsed.base);
  if (canonBase === parsed.base) {
    return bare;
  }
  return buildCursorCatalogSlug(
    canonBase,
    parsed.middleMods,
    parsed.priorEffort,
    parsed.hasFast,
  );
}

function cliMain(argv) {
  const [cmd, slugArg] = argv;
  if (cmd === "canonicalize") {
    if (!slugArg) {
      process.stderr.write("usage: cursor-catalog-model-slug.mjs canonicalize <slug>\n");
      process.exit(2);
    }
    process.stdout.write(`${canonicalizeCursorAgentModelSlug(slugArg)}\n`);
    process.exit(0);
  }
  process.stderr.write("usage: cursor-catalog-model-slug.mjs canonicalize <slug>\n");
  process.exit(2);
}

if (pathToFileURL(process.argv[1] ?? "").href === import.meta.url) {
  cliMain(process.argv.slice(2));
}
