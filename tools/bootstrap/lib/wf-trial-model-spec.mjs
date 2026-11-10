/**
 * [REQ-WF_TRIAL_MODEL_SPEC_CLI] [REQ-WF_TRIAL_MODEL_CATALOG_RESOLVE] [REQ-WF_TRIAL_MODEL_COMPOSE]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import yaml from "js-yaml";
import {
  catalogSlugLookup,
  defaultWfTrialModelCatalogPath,
  loadWfTrialModelCatalog,
} from "./wf-trial-model-catalog.mjs";
import { composeCursorCatalogSlug, normalizeComposeEffort } from "./wf-trial-model-compose.mjs";
import { parseCursorCatalogSlug } from "./cursor-catalog-model-slug.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../../..");
const DEFAULT_REGISTRY_REL = "docs/demos/wf-trial-model-specs.yaml";

export const WF_TRIAL_MODEL_SPEC_SCHEMA = "wf-trial-model-spec.v1";
export const WF_TRIAL_MODEL_SPEC_SCHEMA_V2 = "wf-trial-model-spec.v2";
export const WF_TRIAL_MODEL_SPEC_SCHEMAS = [
  WF_TRIAL_MODEL_SPEC_SCHEMA,
  WF_TRIAL_MODEL_SPEC_SCHEMA_V2,
];

/**
 * @param {string} [repoRoot]
 */
export function defaultWfTrialModelSpecRegistryPath(repoRoot = REPO_ROOT) {
  return path.join(repoRoot, DEFAULT_REGISTRY_REL);
}

/**
 * @param {string} registryPath
 */
export function loadWfTrialModelSpecDocument(registryPath) {
  const raw = fs.readFileSync(registryPath, "utf8");
  const doc = yaml.load(raw);
  if (!doc || typeof doc !== "object") {
    throw new Error(`invalid registry: ${registryPath}`);
  }
  if (!WF_TRIAL_MODEL_SPEC_SCHEMAS.includes(doc.schema)) {
    throw new Error(
      `registry schema mismatch (expected ${WF_TRIAL_MODEL_SPEC_SCHEMAS.join("|")}, got ${doc.schema ?? "missing"})`,
    );
  }
  const specs = doc.specs;
  if (!specs || typeof specs !== "object") {
    throw new Error(`registry missing specs: ${registryPath}`);
  }
  const compose =
    doc.compose && typeof doc.compose === "object"
      ? /** @type {Record<string, import("./wf-trial-model-compose.mjs").WfTrialComposeFamily>} */ (doc.compose)
      : {};
  return { schema: doc.schema, specs, compose };
}

/**
 * @param {string} registryPath
 */
export function loadWfTrialModelSpecRegistry(registryPath) {
  return loadWfTrialModelSpecDocument(registryPath).specs;
}

/**
 * @typedef {{ model_config: string; cursor_slug?: string; claude_slug?: string }} WfTrialModelSpecEntry
 */

/**
 * @param {string} slug
 * @param {string} effort
 * @param {string} refHint
 */
export function assertCursorSlugEffortConsistency(slug, effort, refHint) {
  const e = normalizeComposeEffort(effort);
  if (e === "") {
    return;
  }
  const parsed = parseCursorCatalogSlug(slug);
  if (parsed.priorEffort === "") {
    return;
  }
  const prior = parsed.priorEffort;
  const matches = prior === e || (e === "xhigh" && prior === "extra-high");
  if (!matches) {
    const err = new Error(
      `tier mismatch for ${refHint}: slug has ${prior} but effort is ${e} (use e.g. workflow_trial_range cursor luna ${e} …)`,
    );
    err.code = "TIER_MISMATCH";
    throw err;
  }
}

/**
 * @param {string} harness
 * @param {string} configId
 * @param {string} [registryPath]
 */
export function resolveWfTrialModelSpec(harness, configId, registryPath) {
  const regPath = registryPath ?? defaultWfTrialModelSpecRegistryPath();
  const specs = loadWfTrialModelSpecRegistry(regPath);
  const id = String(configId).trim();
  const spec = specs[id];
  if (!spec) {
    const err = new Error(`unknown WF trial config id: ${id}`);
    err.code = "UNKNOWN_CONFIG_ID";
    throw err;
  }

  const h = String(harness).trim().toLowerCase();
  let modelSlug;
  if (h === "cursor") {
    modelSlug = spec.cursor_slug;
    if (!modelSlug) {
      const err = new Error(`config id ${id} does not support cursor harness`);
      err.code = "HARNESS_NOT_SUPPORTED";
      throw err;
    }
  } else if (h === "claude") {
    modelSlug = spec.claude_slug;
    if (!modelSlug) {
      const err = new Error(`config id ${id} does not support claude harness`);
      err.code = "HARNESS_NOT_SUPPORTED";
      throw err;
    }
  } else {
    const err = new Error(`invalid harness (expected cursor|claude): ${harness}`);
    err.code = "INVALID_HARNESS";
    throw err;
  }

  return {
    config_id: id,
    model_config: spec.model_config,
    model_slug: modelSlug,
  };
}

/**
 * @param {string} configId
 * @param {string} [registryPath]
 */
export function hasWfTrialModelSpecId(configId, registryPath) {
  try {
    const regPath = registryPath ?? defaultWfTrialModelSpecRegistryPath();
    const specs = loadWfTrialModelSpecRegistry(regPath);
    return Object.prototype.hasOwnProperty.call(specs, String(configId).trim());
  } catch {
    return false;
  }
}

/**
 * @param {Record<string, WfTrialModelSpecEntry>} specs
 * @param {string} harness
 * @param {string} slug
 */
function findMatrixSpecBySlug(specs, harness, slug) {
  const h = String(harness).trim().toLowerCase();
  for (const [configId, spec] of Object.entries(specs)) {
    if (h === "cursor" && spec.cursor_slug === slug) {
      return { config_id: configId, spec };
    }
    if (h === "claude" && spec.claude_slug === slug) {
      return { config_id: configId, spec };
    }
  }
  return null;
}

/**
 * @param {string} harness
 * @param {string} modelRef
 * @param {string} [registryPath]
 * @param {string} [catalogPath]
 * @param {string} [effort]
 */
export function resolveWfTrialModelRef(harness, modelRef, registryPath, catalogPath, effort = "-") {
  const regPath = registryPath ?? defaultWfTrialModelSpecRegistryPath();
  const catPath = catalogPath ?? defaultWfTrialModelCatalogPath();
  const { specs, compose } = loadWfTrialModelSpecDocument(regPath);
  const catalog = loadWfTrialModelCatalog(catPath);
  const h = String(harness).trim().toLowerCase();
  let ref = String(modelRef).trim();
  if (ref === "") {
    const err = new Error("model ref required");
    err.code = "INVALID_REF";
    throw err;
  }
  let aliasUsed = false;

  const harnessAliases = catalog.aliases[h] ?? {};
  if (harnessAliases[ref]) {
    ref = harnessAliases[ref];
    aliasUsed = true;
  }

  if (h === "cursor" && Object.prototype.hasOwnProperty.call(compose, ref)) {
    const composed = composeCursorCatalogSlug(ref, effort, compose[ref], catPath);
    return {
      config_id: undefined,
      model_config: composed.model_config,
      model_slug: composed.model_slug,
      resolution: "compose",
      model_ref: modelRef,
      compose_family: ref,
    };
  }

  if (Object.prototype.hasOwnProperty.call(specs, ref)) {
    const resolved = resolveWfTrialModelSpec(h, ref, regPath);
    assertCursorSlugEffortConsistency(resolved.model_slug, effort, ref);
    return {
      ...resolved,
      resolution: /** @type {"matrix"|"alias"|"catalog"|"compose"} */ (aliasUsed ? "alias" : "matrix"),
      model_ref: ref,
    };
  }

  const bySlug = findMatrixSpecBySlug(specs, h, ref);
  if (bySlug) {
    const resolved = resolveWfTrialModelSpec(h, bySlug.config_id, regPath);
    assertCursorSlugEffortConsistency(resolved.model_slug, effort, ref);
    return {
      ...resolved,
      resolution: "matrix",
      model_ref: ref,
    };
  }

  const catRow = catalogSlugLookup(h, ref, regPath, catPath);
  if (catRow) {
    assertCursorSlugEffortConsistency(catRow.slug, effort, ref);
    return {
      config_id: undefined,
      model_config: catRow.model_config,
      model_slug: catRow.slug,
      resolution: aliasUsed ? "alias" : "catalog",
      model_ref: ref,
    };
  }

  const err = new Error(
    `unknown model ref: ${ref} (see docs/demos/wf-trial-model-catalog.yaml; regen: node tools/bootstrap/sync-wf-trial-model-catalog.mjs)`,
  );
  err.code = "UNKNOWN_MODEL_REF";
  throw err;
}

/**
 * @param {string} harness
 * @param {string} modelRef
 * @param {string} [registryPath]
 * @param {string} [catalogPath]
 * @param {string} [effort]
 */
export function hasWfTrialModelRef(harness, modelRef, registryPath, catalogPath, effort = "-") {
  try {
    resolveWfTrialModelRef(harness, modelRef, registryPath, catalogPath, effort);
    return true;
  } catch (e) {
    if (
      e &&
      typeof e === "object" &&
      "code" in e &&
      (e.code === "UNKNOWN_MODEL_REF" ||
        e.code === "EFFORT_REQUIRED_FOR_COMPOSE" ||
        e.code === "TIER_MISMATCH")
    ) {
      return false;
    }
    return false;
  }
}

function cliMain(argv) {
  const registryPath = defaultWfTrialModelSpecRegistryPath();
  const [cmd, a, b, c] = argv;

  if (cmd === "resolve-ref") {
    if (!a || !b) {
      process.stderr.write("usage: wf-trial-model-spec.mjs resolve-ref <harness> <model_ref> [effort]\n");
      process.exit(2);
    }
    try {
      const result = resolveWfTrialModelRef(a, b, registryPath, undefined, c ?? "-");
      process.stdout.write(`${JSON.stringify(result)}\n`);
      process.exit(0);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      process.stderr.write(`ERROR: ${msg}\n`);
      process.exit(1);
    }
  }

  if (cmd === "has-ref") {
    if (!a || !b) {
      process.stderr.write("usage: wf-trial-model-spec.mjs has-ref <harness> <model_ref> [effort]\n");
      process.exit(2);
    }
    process.exit(hasWfTrialModelRef(a, b, registryPath, undefined, c ?? "-") ? 0 : 1);
  }

  if (cmd === "resolve") {
    if (!a || !b) {
      process.stderr.write("usage: wf-trial-model-spec.mjs resolve <harness> <config_id>\n");
      process.exit(2);
    }
    try {
      const result = resolveWfTrialModelSpec(a, b, registryPath);
      process.stdout.write(`${JSON.stringify(result)}\n`);
      process.exit(0);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      process.stderr.write(`ERROR: ${msg}\n`);
      process.exit(1);
    }
  }

  if (cmd === "has") {
    if (!a) {
      process.stderr.write("usage: wf-trial-model-spec.mjs has <config_id>\n");
      process.exit(2);
    }
    process.exit(hasWfTrialModelSpecId(a, registryPath) ? 0 : 1);
  }

  process.stderr.write("usage: wf-trial-model-spec.mjs resolve|resolve-ref|has|has-ref ...\n");
  process.exit(2);
}

if (pathToFileURL(process.argv[1] ?? "").href === import.meta.url) {
  cliMain(process.argv.slice(2));
}
