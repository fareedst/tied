/**
 * On-disk TIED runtime configuration (store yaml + client mcp.json).
 * Global paths must not be taken from operator shell env.
 */
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { jsonSafeAbsolute } from "./paths.mjs";
import {
  MCP_REL_PATHS,
  resolveProjectRootFromCwd,
  validateTiedProjectLayout,
} from "./mcp-base-path.mjs";
import {
  mcpEnvHasClientProjectPath,
  pickClientBundlePath,
  pickClientProjectPath,
} from "./tied-path-env.mjs";

export const RUNTIME_DIAGNOSTIC_PREFIX = "DIAGNOSTIC: TIED_RUNTIME_CONFIG";
export const RUNTIME_DIAGNOSTIC_MISSING = `${RUNTIME_DIAGNOSTIC_PREFIX}_MISSING`;
export const STORE_YAML_REL = ".tied/store.yaml";
export const STORE_LOCAL_YAML_REL = ".tied/store.local.yaml";

const DEFAULT_MCP_DIST_REL = "mcp-server/dist/index.js";

/**
 * @param {string} a
 * @param {string} b
 */
export function pathsSameResolved(a, b) {
  const normalize = (p) => {
    try {
      return fs.realpathSync.native(p);
    } catch {
      return path.resolve(p);
    }
  };
  const stripPrivate = (p) => p.replace(/^\/private(?=\/)/, "");
  const na = stripPrivate(normalize(a));
  const nb = stripPrivate(normalize(b));
  return na === nb;
}

/**
 * @param {string} mcpDistPath
 * @returns {string}
 */
export function deriveStoreRootFromMcpDist(mcpDistPath) {
  const resolved = path.resolve(mcpDistPath);
  return path.resolve(path.dirname(resolved), "..", "..");
}

/**
 * @param {string} storeRoot
 * @param {string} mcpDistPath
 */
export function assertMcpDistUnderStoreRoot(storeRoot, mcpDistPath) {
  if (pathsSameResolved(deriveStoreRootFromMcpDist(mcpDistPath), storeRoot)) {
    return;
  }
  const root = (() => {
    try {
      return fs.realpathSync.native(storeRoot);
    } catch {
      return path.resolve(storeRoot);
    }
  })();
  const dist = (() => {
    try {
      return fs.realpathSync.native(mcpDistPath);
    } catch {
      return path.resolve(mcpDistPath);
    }
  })();
  const rel = path.relative(root, dist);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    const err = new Error(
      `${RUNTIME_DIAGNOSTIC_PREFIX}: MCP dist escapes store root (${dist} not under ${root})`,
    );
    err.code = "TIED_RUNTIME_CONFIG_PATH_ESCAPE";
    throw err;
  }
}

/**
 * @param {string} projectRoot
 * @returns {{ relPath: string; entry: Record<string, unknown>; env: Record<string, string> } | null}
 */
export function readTiedYamlServerEntryFromProject(projectRoot) {
  const root = path.resolve(projectRoot);
  for (const rel of MCP_REL_PATHS) {
    const mcpPath = path.join(root, rel);
    if (!fs.existsSync(mcpPath)) {
      continue;
    }
    let cfg;
    try {
      cfg = JSON.parse(fs.readFileSync(mcpPath, "utf8"));
    } catch {
      continue;
    }
    const entry = cfg?.mcpServers?.["tied-yaml"];
    if (!entry || typeof entry !== "object") {
      continue;
    }
    const envRaw = entry.env;
    if (!envRaw || typeof envRaw !== "object" || Array.isArray(envRaw)) {
      continue;
    }
    if (!mcpEnvHasClientProjectPath(/** @type {Record<string, string>} */ (envRaw))) {
      continue;
    }
    /** @type {Record<string, string>} */
    const env = {};
    for (const [key, value] of Object.entries(envRaw)) {
      if (typeof value === "string" && value.trim()) {
        env[key] = value.trim();
      }
    }
    return { relPath: rel, entry: /** @type {Record<string, unknown>} */ (entry), env };
  }
  return null;
}

/**
 * @param {string} storeRoot
 * @returns {Record<string, unknown>}
 */
export function loadMergedStoreYaml(storeRoot) {
  const root = path.resolve(storeRoot);
  const tiedDir = path.join(root, ".tied");
  /** @type {Record<string, unknown>} */
  let merged = {};
  const basePath = path.join(tiedDir, "store.yaml");
  const localPath = path.join(tiedDir, "store.local.yaml");
  if (fs.existsSync(basePath)) {
    merged = { ...merged, ...yaml.load(fs.readFileSync(basePath, "utf8")) };
  }
  if (fs.existsSync(localPath)) {
    merged = { ...merged, ...yaml.load(fs.readFileSync(localPath, "utf8")) };
  }
  return merged;
}

/**
 * @param {Record<string, unknown>} doc
 * @param {string} storeRoot
 * @returns {string | null}
 */
export function resolveMcpDistFromStoreYaml(doc, storeRoot) {
  const rootFromDoc =
    typeof doc.store_root === "string" && doc.store_root.trim()
      ? path.resolve(doc.store_root.trim())
      : path.resolve(storeRoot);
  const mcpServer = doc.mcp_server;
  if (!mcpServer || typeof mcpServer !== "object" || Array.isArray(mcpServer)) {
    return null;
  }
  const distRel = /** @type {{ dist?: string }} */ (mcpServer).dist?.trim();
  if (!distRel) {
    return null;
  }
  const distPath = path.isAbsolute(distRel) ? distRel : path.join(rootFromDoc, distRel);
  return path.resolve(distPath);
}

/**
 * @param {string} startDir
 * @returns {string | null}
 */
export function findStoreRootWithTiedConfig(startDir) {
  let dir = path.resolve(startDir);
  for (;;) {
    if (fs.existsSync(path.join(dir, STORE_YAML_REL))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      break;
    }
    dir = parent;
  }
  return null;
}

/**
 * @param {string} projectRoot
 * @param {{ relPath: string; entry: Record<string, unknown>; env: Record<string, string> }} mcp
 * @param {{ requireDistExists?: boolean }} [opts]
 */
export function resolveRuntimeFromMcpEntry(projectRoot, mcp, opts = {}) {
  const args = mcp.entry.args;
  const arg0 = Array.isArray(args) && typeof args[0] === "string" ? args[0].trim() : "";
  if (!arg0) {
    throw new Error(
      `${RUNTIME_DIAGNOSTIC_PREFIX}: tied-yaml mcp.json missing args[0] (path to mcp-server/dist/index.js). Run ./tied-install.sh`,
    );
  }
  const mcpDistPath = path.isAbsolute(arg0)
    ? path.resolve(arg0)
    : path.resolve(projectRoot, arg0);
  if (opts.requireDistExists && !fs.existsSync(mcpDistPath)) {
    throw new Error(
      `${RUNTIME_DIAGNOSTIC_PREFIX}: MCP server binary missing at ${mcpDistPath}. Build mcp-server and run ./tied-install.sh --refresh`,
    );
  }
  const derivedStore = deriveStoreRootFromMcpDist(mcpDistPath);
  const explicitStore = mcp.env.TIED_STORE_ROOT?.trim();
  const storeRoot = explicitStore ? path.resolve(jsonSafeAbsolute(explicitStore)) : derivedStore;
  if (explicitStore && !pathsSameResolved(explicitStore, derivedStore)) {
    throw new Error(
      `${RUNTIME_DIAGNOSTIC_PREFIX}_MISMATCH: TIED_STORE_ROOT in mcp.json (${explicitStore}) disagrees with dist-derived store root (${derivedStore})`,
    );
  }
  assertMcpDistUnderStoreRoot(storeRoot, mcpDistPath);
  const clientRaw = pickClientProjectPath(mcp.env);
  if (!clientRaw?.trim()) {
    throw new Error(`${RUNTIME_DIAGNOSTIC_PREFIX}: missing client project path in ${mcp.relPath}`);
  }
  const clientProjectPath = validateTiedProjectLayout(jsonSafeAbsolute(clientRaw.trim()));
  /** @type {string[]} */
  const sources = [`mcp:${mcp.relPath}`];
  const storeYamlRoot = findStoreRootWithTiedConfig(storeRoot);
  if (storeYamlRoot && fs.existsSync(path.join(storeYamlRoot, STORE_YAML_REL))) {
    sources.push(`store:${STORE_YAML_REL}`);
  }
  const bundle = pickClientBundlePath(mcp.env);
  return {
    projectRoot: path.resolve(projectRoot),
    storeRoot: path.resolve(storeRoot),
    mcpDistPath,
    clientProjectPath,
    clientBundlePath: bundle ? jsonSafeAbsolute(bundle) : undefined,
    sources,
  };
}

/**
 * @param {string} storeRoot
 * @param {{ requireDistExists?: boolean }} [opts]
 */
export function resolveRuntimeFromStoreYaml(storeRoot, opts = {}) {
  const root = path.resolve(storeRoot);
  if (!fs.existsSync(path.join(root, STORE_YAML_REL))) {
    throw new Error(
      `${RUNTIME_DIAGNOSTIC_MISSING}: missing ${STORE_YAML_REL} under ${root}. Run ./tied-install.sh`,
    );
  }
  const doc = loadMergedStoreYaml(root);
  const mcpDistPath = resolveMcpDistFromStoreYaml(doc, root);
  if (!mcpDistPath) {
    throw new Error(
      `${RUNTIME_DIAGNOSTIC_PREFIX}: invalid ${STORE_YAML_REL} (mcp_server.dist required)`,
    );
  }
  if (opts.requireDistExists && !fs.existsSync(mcpDistPath)) {
    throw new Error(
      `${RUNTIME_DIAGNOSTIC_PREFIX}: MCP server binary missing at ${mcpDistPath}. Build mcp-server.`,
    );
  }
  const resolvedStore =
    typeof doc.store_root === "string" && doc.store_root.trim()
      ? path.resolve(doc.store_root.trim())
      : root;
  assertMcpDistUnderStoreRoot(resolvedStore, mcpDistPath);
  return {
    projectRoot: root,
    storeRoot: resolvedStore,
    mcpDistPath,
    clientProjectPath: undefined,
    clientBundlePath: undefined,
    sources: [`store:${STORE_YAML_REL}`],
  };
}

/**
 * @param {{ cwd?: string; mode?: "auto" | "client" | "store"; requireDistExists?: boolean; processEnv?: NodeJS.ProcessEnv }} params
 */
export function resolveTiedRuntimeConfig(params = {}) {
  const cwd = params.cwd ?? process.cwd();
  const mode = params.mode ?? "auto";
  const requireDistExists = params.requireDistExists ?? false;
  const projectRoot = resolveProjectRootFromCwd(cwd, params.processEnv ?? process.env);
  const mcp = readTiedYamlServerEntryFromProject(projectRoot);

  if (mode === "client") {
    if (!mcp) {
      throw new Error(
        `${RUNTIME_DIAGNOSTIC_MISSING}: no tied-yaml MCP config under ${projectRoot}. Run ./tied-install.sh`,
      );
    }
    return resolveRuntimeFromMcpEntry(projectRoot, mcp, { requireDistExists });
  }

  if (mode === "store") {
    const storeRoot = findStoreRootWithTiedConfig(cwd) ?? findStoreRootWithTiedConfig(projectRoot);
    if (!storeRoot) {
      throw new Error(`${RUNTIME_DIAGNOSTIC_MISSING}: no ${STORE_YAML_REL} found from ${cwd}`);
    }
    return resolveRuntimeFromStoreYaml(storeRoot, { requireDistExists });
  }

  if (mcp) {
    return resolveRuntimeFromMcpEntry(projectRoot, mcp, { requireDistExists });
  }

  const storeRoot = findStoreRootWithTiedConfig(cwd) ?? findStoreRootWithTiedConfig(projectRoot);
  if (storeRoot) {
    return resolveRuntimeFromStoreYaml(storeRoot, { requireDistExists });
  }

  throw new Error(
    `${RUNTIME_DIAGNOSTIC_MISSING}: no client mcp.json or ${STORE_YAML_REL} under ${projectRoot}. Run ./tied-install.sh`,
  );
}

/**
 * @param {string} storeRoot
 * @param {{ mcpDistPath: string; templatePath?: string }} params
 */
export function refreshStoreRuntimeConfig(storeRoot, { mcpDistPath, templatePath }) {
  const root = path.resolve(storeRoot);
  const tiedDir = path.join(root, ".tied");
  fs.mkdirSync(tiedDir, { recursive: true });
  const storeYaml = path.join(tiedDir, "store.yaml");
  if (!fs.existsSync(storeYaml)) {
    const tpl =
      templatePath && fs.existsSync(templatePath)
        ? fs.readFileSync(templatePath, "utf8")
        : `schema: tied-store-config.v1\nmcp_server:\n  dist: ${DEFAULT_MCP_DIST_REL}\nmethodology:\n  bundle: tied-bundle\n`;
    fs.writeFileSync(storeYaml, tpl.endsWith("\n") ? tpl : `${tpl}\n`, "utf8");
  }
  const localPath = path.join(tiedDir, "store.local.yaml");
  const payload = {
    schema: "tied-store-config.v1",
    store_root: jsonSafeAbsolute(root),
    mcp_server: { dist: jsonSafeAbsolute(mcpDistPath) },
  };
  fs.writeFileSync(localPath, yaml.dump(payload), "utf8");
}
