/**
 * [IMPL-TIED_TWO_FOLDER_LAYOUT] [ARCH-TIED_PROJECT_CONFIG_OWNERSHIP] [REQ-TIED_TWO_FOLDER_LAYOUT]
 * How: LOAD_PROJECT_CONFIG — project config at layout.projectConfigPath with legacy tied-project/config.yaml fallback.
 */
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { resolveTiedLayout } from "./layout.mjs";

export const PROJECT_CONFIG_SCHEMA_V1 = "tied-project-config.v1";

/** @type {readonly Set<string>} */
export const PROJECT_CONFIG_TOP_LEVEL_KEYS = new Set([
  "schema",
  "yaml",
  "jev",
  "dae",
  "bbce",
  "tool_safety",
  "citdp",
  "methodology",
  "install_defaults",
  "working",
]);

/** Legacy root file keys that belong in project config (not install). */
export const LEGACY_ROOT_PROJECT_KEYS = new Set([
  "scalar_style",
  "client_formatter",
  "jev",
  "dae",
  "bbce",
  "tool_safety",
  "citdp",
  "methodology",
  "install_defaults",
  "working",
]);

/**
 * @param {string} projectRoot
 * @returns {{ path: string, source: "project-config-v1"|"legacy-root-yaml" } | null}
 */
export function resolveProjectConfigPath(projectRoot) {
  const root = path.resolve(projectRoot);
  const layout = resolveTiedLayout(root);
  if (fs.existsSync(layout.projectConfigPath)) {
    return { path: layout.projectConfigPath, source: "project-config-v1" };
  }
  const legacyRoot = path.join(root, ".tied-yaml.yaml");
  if (fs.existsSync(legacyRoot)) {
    return { path: legacyRoot, source: "legacy-root-yaml" };
  }
  return null;
}

/**
 * @param {unknown} value
 * @returns {value is Record<string, unknown>}
 */
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * @param {Record<string, unknown>} raw
 * @returns {Record<string, unknown>}
 */
export function normalizeLegacyRootYamlToProjectRecord(raw) {
  const next = { schema: PROJECT_CONFIG_SCHEMA_V1, yaml: {} };
  const yamlSection = /** @type {Record<string, unknown>} */ (next.yaml);
  if (raw.scalar_style !== undefined) {
    yamlSection.scalar_style = raw.scalar_style;
  }
  if (raw.client_formatter !== undefined) {
    yamlSection.client_formatter = raw.client_formatter;
  }
  for (const key of ["jev", "dae", "bbce", "tool_safety", "citdp", "methodology", "install_defaults", "working"]) {
    if (raw[key] !== undefined) {
      next[key] = raw[key];
    }
  }
  return next;
}

/**
 * @param {Record<string, unknown>} record
 * @param {"project-config-v1"|"legacy-root-yaml"} source
 */
export function validateProjectConfigRecord(record, source) {
  if (!isRecord(record)) {
    const err = new Error("PROJECT_CONFIG_INVALID");
    err.code = "PROJECT_CONFIG_INVALID";
    throw err;
  }
  if (source === "project-config-v1") {
    if (record.schema !== PROJECT_CONFIG_SCHEMA_V1) {
      const err = new Error("PROJECT_CONFIG_INVALID");
      err.code = "PROJECT_CONFIG_INVALID";
      throw err;
    }
    for (const key of Object.keys(record)) {
      if (!PROJECT_CONFIG_TOP_LEVEL_KEYS.has(key)) {
        const err = new Error(`CONFIG_UNKNOWN_KEY:${key}`);
        err.code = "CONFIG_UNKNOWN_KEY";
        throw err;
      }
    }
  } else {
    for (const key of Object.keys(record)) {
      if (!LEGACY_ROOT_PROJECT_KEYS.has(key)) {
        const err = new Error(`CONFIG_UNKNOWN_KEY:${key}`);
        err.code = "CONFIG_UNKNOWN_KEY";
        throw err;
      }
    }
  }
}

/**
 * @param {string} projectRoot
 * @returns {{ record: Record<string, unknown>, configPath: string, source: "project-config-v1"|"legacy-root-yaml" } | null}
 */
export function loadProjectConfig(projectRoot) {
  const resolved = resolveProjectConfigPath(projectRoot);
  if (!resolved) {
    return null;
  }
  let raw;
  try {
    raw = yaml.load(fs.readFileSync(resolved.path, "utf8"));
  } catch {
    const err = new Error("PROJECT_CONFIG_INVALID");
    err.code = "PROJECT_CONFIG_INVALID";
    throw err;
  }
  if (!isRecord(raw)) {
    const err = new Error("PROJECT_CONFIG_INVALID");
    err.code = "PROJECT_CONFIG_INVALID";
    throw err;
  }
  validateProjectConfigRecord(raw, resolved.source);
  const record =
    resolved.source === "legacy-root-yaml" ? normalizeLegacyRootYamlToProjectRecord(raw) : raw;
  return { record, configPath: resolved.path, source: resolved.source };
}

/**
 * Flat view for legacy readers (scalar_style at top level when needed).
 * @param {Record<string, unknown>} normalizedRecord
 */
export function projectConfigToLegacyFlatView(normalizedRecord) {
  const yamlSection = isRecord(normalizedRecord.yaml) ? normalizedRecord.yaml : {};
  const flat = { ...normalizedRecord };
  if (yamlSection.scalar_style !== undefined) {
    flat.scalar_style = yamlSection.scalar_style;
  }
  if (yamlSection.client_formatter !== undefined) {
    flat.client_formatter = yamlSection.client_formatter;
  }
  delete flat.schema;
  delete flat.yaml;
  return flat;
}

/**
 * @param {string} projectRoot
 * @param {Record<string, unknown>} partial
 */
export function writeProjectConfig(projectRoot, partial) {
  const layout = resolveTiedLayout(projectRoot);
  fs.mkdirSync(layout.tiedDir, { recursive: true });
  const existing = loadProjectConfig(projectRoot);
  const base = existing?.record ?? { schema: PROJECT_CONFIG_SCHEMA_V1, yaml: { scalar_style: "unwrapped" } };
  const merged = { ...base, ...partial, schema: PROJECT_CONFIG_SCHEMA_V1 };
  validateProjectConfigRecord(merged, "project-config-v1");
  fs.writeFileSync(
    layout.projectConfigPath,
    yaml.dump(merged, { lineWidth: -1, noRefs: true }),
    "utf8",
  );
  return { configPath: layout.projectConfigPath, record: merged };
}
