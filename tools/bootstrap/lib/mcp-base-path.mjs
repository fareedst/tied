/**
 * [IMPL-TIED_CLI_MCP_JSON_BASE_PATH] [ARCH-TIED_CLI_MCP_JSON_BASE_PATH] [REQ-TIED_CLI_MCP_JSON_BASE_PATH]
 * [IMPL-TIED_CLIENT_PATH_ENV_MIGRATION] [REQ-TIED_CLIENT_PATH_ENV_MIGRATION]
 * How: READ_TIED_YAML_ENV_FROM_PROJECT_MCP, RESOLVE_PROJECT_ROOT_FROM_CWD, RESOLVE_TIED_CLI_ENV.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { childProcessSpawnOptions } from "./child-process-win.mjs";
import { jsonSafeAbsolute } from "./paths.mjs";
import {
  ENV_CLIENT_BUNDLE_PATH,
  ENV_CLIENT_PROJECT_PATH,
  mcpEnvHasClientProjectPath,
  pickClientBundlePath,
  pickClientProjectPath,
} from "./tied-path-env.mjs";

export const MCP_REL_PATHS = [".cursor/mcp.json", ".mcp.json"];

export const DIAGNOSTIC_PREFIX = "DIAGNOSTIC: TIED_CLI_MCP_BASE_PATH";

/**
 * @param {string} projectRoot
 * @returns {Record<string, string>}
 */
export function readTiedYamlEnvFromProjectMcp(projectRoot) {
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
    const env = cfg?.mcpServers?.["tied-yaml"]?.env;
    if (!env || typeof env !== "object") {
      continue;
    }
    if (!mcpEnvHasClientProjectPath(env)) {
      continue;
    }
    /** @type {Record<string, string>} */
    const out = {};
    for (const [key, value] of Object.entries(env)) {
      if (typeof value === "string" && value.trim()) {
        out[key] = value.trim();
      }
    }
    return out;
  }
  return {};
}

/**
 * @param {string} projectRoot
 * @returns {string | null}
 */
export function readTiedBasePathFromProjectMcp(projectRoot) {
  const env = readTiedYamlEnvFromProjectMcp(projectRoot);
  const raw = pickClientProjectPath(env);
  return raw ? jsonSafeAbsolute(raw) : null;
}

/**
 * @param {string} cwd
 * @param {NodeJS.ProcessEnv} [processEnv]
 * @returns {string}
 */
export function resolveProjectRootFromCwd(cwd, processEnv = process.env) {
  const start = path.resolve(cwd);
  const gitTop = tryGitToplevel(start, processEnv);
  if (gitTop) {
    return gitTop;
  }
  let dir = start;
  for (;;) {
    if (hasMcpSentinel(dir)) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      break;
    }
    dir = parent;
  }
  return start;
}

/**
 * @param {string} dir
 */
function hasMcpSentinel(dir) {
  return MCP_REL_PATHS.some((rel) => fs.existsSync(path.join(dir, rel)));
}

/**
 * @param {string} cwd
 * @param {NodeJS.ProcessEnv} env
 * @returns {string | null}
 */
function tryGitToplevel(cwd, env) {
  const result = spawnSync(
    "git",
    ["rev-parse", "--show-toplevel"],
    childProcessSpawnOptions({
      cwd,
      encoding: "utf8",
      env,
      stdio: "pipe",
    }),
  );
  if (result.status !== 0) {
    return null;
  }
  const top = (result.stdout ?? "").trim();
  return top ? path.resolve(top) : null;
}

/**
 * @param {string} basePath
 */
export function validateTiedProjectLayout(basePath) {
  const resolved = path.resolve(basePath);
  const sentinel = path.join(resolved, "requirements.yaml");
  if (!fs.existsSync(sentinel)) {
    const err = new Error("TIED_CLI_LAYOUT_INVALID");
    err.basePath = resolved;
    throw err;
  }
  return resolved;
}

/**
 * @param {string} projectRoot
 * @returns {never}
 */
export function failClosedMissingMcp(projectRoot) {
  const err = new Error(
    `${DIAGNOSTIC_PREFIX}: missing tied-yaml ${ENV_CLIENT_PROJECT_PATH} (or legacy TIED_BASE_PATH) in .cursor/mcp.json or .mcp.json under ${projectRoot}. Run ./tied-install.sh in the client project.`,
  );
  err.code = "TIED_CLI_MCP_BASE_PATH_MISSING";
  throw err;
}

/**
 * @param {string} cwd
 * @param {NodeJS.ProcessEnv} [processEnv]
 * @returns {{ projectRoot: string, TIED_CLIENT_PROJECT_PATH: string, TIED_CLIENT_BUNDLE_PATH?: string }}
 */
export function resolveTiedCliEnvFromCwd(cwd, processEnv = process.env) {
  const envOverride = pickClientProjectPath(processEnv);
  if (envOverride) {
    const basePath = validateTiedProjectLayout(jsonSafeAbsolute(envOverride));
    /** @type {{ projectRoot: string, TIED_CLIENT_PROJECT_PATH: string, TIED_CLIENT_BUNDLE_PATH?: string }} */
    const out = {
      projectRoot: path.dirname(basePath),
      TIED_CLIENT_PROJECT_PATH: basePath,
    };
    const bundle = pickClientBundlePath(processEnv);
    if (bundle) {
      out.TIED_CLIENT_BUNDLE_PATH = jsonSafeAbsolute(bundle);
    }
    return out;
  }

  const projectRoot = resolveProjectRootFromCwd(cwd, processEnv);
  const mcpEnv = readTiedYamlEnvFromProjectMcp(projectRoot);
  const fromMcp = pickClientProjectPath(mcpEnv);
  if (!fromMcp?.trim()) {
    failClosedMissingMcp(projectRoot);
  }
  const basePath = validateTiedProjectLayout(jsonSafeAbsolute(fromMcp.trim()));
  const out = {
    projectRoot,
    TIED_CLIENT_PROJECT_PATH: basePath,
  };
  const bundle = pickClientBundlePath(mcpEnv);
  if (bundle) {
    out.TIED_CLIENT_BUNDLE_PATH = jsonSafeAbsolute(bundle);
  }
  return out;
}
