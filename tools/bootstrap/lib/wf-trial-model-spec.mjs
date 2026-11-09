/**
 * [REQ-WF_TRIAL_MODEL_SPEC_CLI] [IMPL-WF_TRIAL_MODEL_SPEC_CLI] [ARCH-WF_TRIAL_MODEL_SPEC_CLI]
 * Resolve WF trial catalog config ids to MODEL_CONFIG + harness-specific MODEL_SLUG.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import yaml from "js-yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../../..");
const DEFAULT_REGISTRY_REL = "docs/demos/wf-trial-model-specs.yaml";

export const WF_TRIAL_MODEL_SPEC_SCHEMA = "wf-trial-model-spec.v1";

/**
 * @param {string} [repoRoot]
 */
export function defaultWfTrialModelSpecRegistryPath(repoRoot = REPO_ROOT) {
  return path.join(repoRoot, DEFAULT_REGISTRY_REL);
}

/**
 * @param {string} registryPath
 */
export function loadWfTrialModelSpecRegistry(registryPath) {
  const raw = fs.readFileSync(registryPath, "utf8");
  const doc = yaml.load(raw);
  if (!doc || typeof doc !== "object") {
    throw new Error(`invalid registry: ${registryPath}`);
  }
  if (doc.schema !== WF_TRIAL_MODEL_SPEC_SCHEMA) {
    throw new Error(
      `registry schema mismatch (expected ${WF_TRIAL_MODEL_SPEC_SCHEMA}, got ${doc.schema ?? "missing"})`,
    );
  }
  const specs = doc.specs;
  if (!specs || typeof specs !== "object") {
    throw new Error(`registry missing specs: ${registryPath}`);
  }
  return /** @type {Record<string, WfTrialModelSpecEntry>} */ (specs);
}

/**
 * @typedef {{ model_config: string; cursor_slug?: string; claude_slug?: string }} WfTrialModelSpecEntry
 */

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

function cliMain(argv) {
  const registryPath = defaultWfTrialModelSpecRegistryPath();
  const [cmd, a, b] = argv;

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

  process.stderr.write("usage: wf-trial-model-spec.mjs resolve|has ...\n");
  process.exit(2);
}

if (pathToFileURL(process.argv[1] ?? "").href === import.meta.url) {
  cliMain(process.argv.slice(2));
}
