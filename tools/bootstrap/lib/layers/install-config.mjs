/**
 * [IMPL-TIED_TWO_FOLDER_LAYOUT] [ARCH-TIED_PROJECT_CONFIG_OWNERSHIP] [REQ-TIED_TWO_FOLDER_LAYOUT]
 * How: LOAD/WRITE install config at tied-bundle/install.json (v2) with v1 manifest fallback.
 */
import fs from "node:fs";
import path from "node:path";
import { resolveTiedLayout } from "../layout.mjs";

export const INSTALL_CONFIG_SCHEMA_V2 = "tied-install.v2";
export const INSTALL_MANIFEST_SCHEMA_V1 = "tied-install.v1";

/** @type {readonly Set<string>} */
export const INSTALL_CONFIG_TOP_LEVEL_KEYS = new Set([
  "schema",
  "store",
  "store_methodology_version",
  "installed_at",
  "installer_version",
  "mode",
  "harness",
  "layers",
  "methodology_bundle",
  "materialization",
  "bundle_path",
  "applied_tool_profile",
  "mcp_env",
  "tool_profile",
  "tied_version",
  "timestamp",
]);

const LEGACY_MANIFEST_PATH_SEG = ["tied", ".tied-install.json"];

/**
 * @param {string} projectRoot
 */
export function installConfigPath(projectRoot) {
  return resolveTiedLayout(projectRoot).installConfigPath;
}

/**
 * @param {string} projectRoot
 */
export function legacyInstallManifestPath(projectRoot) {
  return path.join(projectRoot, ...LEGACY_MANIFEST_PATH_SEG);
}

/**
 * @param {object} v1
 */
function normalizeV1ManifestToV2(v1, projectRoot) {
  const layout = resolveTiedLayout(projectRoot);
  return {
    schema: INSTALL_CONFIG_SCHEMA_V2,
    store: v1.store,
    mode: v1.mode,
    harness: v1.harness,
    layers: v1.layers,
    methodology_bundle: v1.methodology_bundle,
    applied_tool_profile: v1.tool_profile ?? null,
    installer_version: v1.tied_version,
    installed_at: v1.timestamp,
    bundle_path: layout.bundleDir,
  };
}

/**
 * @param {Record<string, unknown>} record
 */
export function validateInstallConfigRecord(record) {
  if (record.schema === INSTALL_CONFIG_SCHEMA_V2) {
    for (const key of Object.keys(record)) {
      if (!INSTALL_CONFIG_TOP_LEVEL_KEYS.has(key)) {
        const err = new Error(`CONFIG_UNKNOWN_KEY:${key}`);
        err.code = "CONFIG_UNKNOWN_KEY";
        throw err;
      }
    }
    return;
  }
  if (record.schema === INSTALL_MANIFEST_SCHEMA_V1) {
    return;
  }
  const err = new Error("INSTALL_CONFIG_INVALID");
  err.code = "INSTALL_CONFIG_INVALID";
  throw err;
}

/**
 * @param {string} projectRoot
 * @returns {object|null}
 */
export function readInstallConfig(projectRoot) {
  const v2Path = installConfigPath(projectRoot);
  if (fs.existsSync(v2Path)) {
    try {
      const record = JSON.parse(fs.readFileSync(v2Path, "utf8"));
      validateInstallConfigRecord(record);
      return record;
    } catch {
      return null;
    }
  }
  const legacyPath = legacyInstallManifestPath(projectRoot);
  if (fs.existsSync(legacyPath)) {
    try {
      const v1 = JSON.parse(fs.readFileSync(legacyPath, "utf8"));
      return normalizeV1ManifestToV2(v1, projectRoot);
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * @param {string} projectRoot
 * @param {object} record
 */
export function writeInstallConfig(projectRoot, record) {
  const layout = resolveTiedLayout(projectRoot);
  fs.mkdirSync(layout.bundleDir, { recursive: true });
  const payload = {
    schema: INSTALL_CONFIG_SCHEMA_V2,
    bundle_path: layout.bundleDir,
    installed_at: record.installed_at ?? new Date().toISOString(),
    ...record,
  };
  validateInstallConfigRecord(payload);
  fs.writeFileSync(installConfigPath(projectRoot), `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return payload;
}
