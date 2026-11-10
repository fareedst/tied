/**
 * [REQ-WF_TRIAL_MODEL_CATALOG_RESOLVE] [IMPL-WF_TRIAL_MODEL_CATALOG_RESOLVE]
 * WF trial model catalog snapshot (Cursor agent models + Claude API ids).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import {
  canonicalizeCursorAgentModelSlug,
  parseCursorCatalogSlug,
} from "./cursor-catalog-model-slug.mjs";
import { loadWfTrialModelSpecRegistry } from "./wf-trial-model-spec.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../../..");
export const WF_TRIAL_MODEL_CATALOG_SCHEMA = "wf-trial-model-catalog.v1";
const DEFAULT_CATALOG_REL = "docs/demos/wf-trial-model-catalog.yaml";

/**
 * @param {string} [repoRoot]
 */
export function defaultWfTrialModelCatalogPath(repoRoot = REPO_ROOT) {
  return path.join(repoRoot, DEFAULT_CATALOG_REL);
}

/**
 * @param {Record<string, { model_config: string; cursor_slug?: string; claude_slug?: string }>} specs
 * @param {string} slug
 */
function matrixModelConfigForCursorSlug(specs, slug) {
  for (const spec of Object.values(specs)) {
    if (spec.cursor_slug === slug) {
      return spec.model_config;
    }
  }
  return undefined;
}

/**
 * @param {string} slug
 * @param {Record<string, { model_config: string; cursor_slug?: string }>} [matrixSpecs]
 */
export function deriveCursorModelConfig(slug, matrixSpecs) {
  const canonSlug = canonicalizeCursorAgentModelSlug(slug);
  if (matrixSpecs) {
    const fromMatrix = matrixModelConfigForCursorSlug(matrixSpecs, canonSlug);
    if (fromMatrix) {
      return fromMatrix;
    }
    const fromMatrixRaw = matrixModelConfigForCursorSlug(matrixSpecs, slug.trim());
    if (fromMatrixRaw) {
      return fromMatrixRaw;
    }
  }
  const parsed = parseCursorCatalogSlug(canonSlug);
  const base = parsed.base;
  if (base === "") {
    return canonSlug;
  }
  const luna = base.match(/^gpt-5\.6-luna-(.+)$/);
  if (luna) {
    return `luna-${luna[1]}`;
  }
  const sol = base.match(/^gpt-5\.6-sol-(.+)$/);
  if (sol) {
    return `sol-${sol[1]}`;
  }
  const grok47 = base.match(/^grok-4\.7-(.+)$/);
  if (grok47) {
    const tier = grok47[1];
    return tier === "medium" ? "grok47-med" : `grok47-${tier}`;
  }
  const grok46 = base.match(/^cursor-grok-4\.6-(.+)$/);
  if (grok46) {
    const tier = grok46[1];
    return tier === "medium" ? "grok47-med" : `grok46-${tier}`;
  }
  if (base === "composer-2.5" || base.startsWith("composer-2.5")) {
    return "composer-2.5";
  }
  return base;
}

/**
 * @param {string} catalogPath
 */
export function loadWfTrialModelCatalog(catalogPath) {
  const raw = fs.readFileSync(catalogPath, "utf8");
  const doc = yaml.load(raw);
  if (!doc || typeof doc !== "object") {
    throw new Error(`invalid catalog: ${catalogPath}`);
  }
  if (doc.schema !== WF_TRIAL_MODEL_CATALOG_SCHEMA) {
    throw new Error(
      `catalog schema mismatch (expected ${WF_TRIAL_MODEL_CATALOG_SCHEMA}, got ${doc.schema ?? "missing"})`,
    );
  }
  const aliases = doc.aliases && typeof doc.aliases === "object" ? doc.aliases : {};
  const cursor = Array.isArray(doc.cursor) ? doc.cursor : [];
  const claude = Array.isArray(doc.claude) ? doc.claude : [];
  /** @type {Map<string, { slug: string; model_config: string }>} */
  const cursorBySlug = new Map();
  for (const row of cursor) {
    if (row && typeof row.slug === "string") {
      cursorBySlug.set(row.slug, {
        slug: row.slug,
        model_config: String(row.model_config ?? row.slug),
      });
    }
  }
  /** @type {Map<string, { slug: string; model_config: string }>} */
  const claudeBySlug = new Map();
  for (const row of claude) {
    if (row && typeof row.slug === "string") {
      claudeBySlug.set(row.slug, {
        slug: row.slug,
        model_config: String(row.model_config ?? row.slug),
      });
    }
  }
  return {
    aliases: /** @type {Record<string, Record<string, string>>} */ (aliases),
    cursorBySlug,
    claudeBySlug,
    raw: doc,
  };
}

/**
 * @param {string} text
 */
export function parseAgentModelsStdout(text) {
  const slugs = [];
  for (const line of text.split("\n")) {
    const m = line.match(/^([a-z0-9][a-z0-9.+-]*) - /);
    if (m) {
      slugs.push(m[1]);
    }
  }
  return slugs;
}

/**
 * @param {unknown} json
 */
export function parseClaudeModelsJson(json) {
  if (!json || typeof json !== "object") {
    throw new Error("invalid Claude models JSON");
  }
  const data = /** @type {{ data?: Array<{ id?: string }> }} */ (json).data;
  if (!Array.isArray(data)) {
    throw new Error("Claude models JSON missing data array");
  }
  return data
    .map((row) => (row && typeof row.id === "string" ? row.id.trim() : ""))
    .filter((id) => id !== "");
}

/**
 * @param {{ slug: string; model_config: string }[]} cursor
 * @param {string[]} claudeIds
 * @param {Record<string, Record<string, string>>} aliases
 */
export function buildCatalogDocument(cursor, claudeIds, aliases) {
  return {
    schema: WF_TRIAL_MODEL_CATALOG_SCHEMA,
    generated_at: new Date().toISOString(),
    cursor_source: "agent models",
    claude_source: "GET /v1/models",
    aliases,
    cursor: cursor.map((row) => ({ slug: row.slug, model_config: row.model_config })),
    claude: claudeIds.map((id) => ({ slug: id, model_config: id })),
  };
}

/**
 * @param {string} [matrixRegistryPath]
 * @param {string} [catalogPath]
 */
export function catalogSlugLookup(harness, slug, matrixRegistryPath, catalogPath) {
  const h = String(harness).trim().toLowerCase();
  const catalog = loadWfTrialModelCatalog(catalogPath ?? defaultWfTrialModelCatalogPath());
  if (h === "cursor") {
    return catalog.cursorBySlug.get(slug) ?? null;
  }
  if (h === "claude") {
    return catalog.claudeBySlug.get(slug) ?? null;
  }
  return null;
}
