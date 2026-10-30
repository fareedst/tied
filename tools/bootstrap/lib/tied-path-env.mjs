/**
 * [IMPL-TIED_CLIENT_PATH_ENV_MIGRATION] [ARCH-TIED_CLIENT_PATH_ENV_MIGRATION] [REQ-TIED_CLIENT_PATH_ENV_MIGRATION]
 * Canonical client path env names; keep in sync with mcp-server/src/tied-path-env.ts.
 */

/** @type {const} */
export const ENV_CLIENT_PROJECT_PATH = "TIED_CLIENT_PROJECT_PATH";

/** @type {const} */
export const ENV_CLIENT_BUNDLE_PATH = "TIED_CLIENT_BUNDLE_PATH";

/** @type {const} */
export const LEGACY_ENV_CLIENT_PROJECT_PATH = "TIED_BASE_PATH";

/** @type {const} */
export const LEGACY_ENV_CLIENT_BUNDLE_PATH = "TIED_METHODOLOGY_BUNDLE_PATH";

/**
 * @param {NodeJS.ProcessEnv | Record<string, string | undefined>} env
 * @returns {string | undefined}
 */
export function pickClientProjectPath(env) {
  const canonical = env[ENV_CLIENT_PROJECT_PATH]?.trim();
  if (canonical) return canonical;
  const legacy = env[LEGACY_ENV_CLIENT_PROJECT_PATH]?.trim();
  return legacy || undefined;
}

/**
 * @param {NodeJS.ProcessEnv | Record<string, string | undefined>} env
 * @returns {string | undefined}
 */
export function pickClientBundlePath(env) {
  const canonical = env[ENV_CLIENT_BUNDLE_PATH]?.trim();
  if (canonical) return canonical;
  const legacy = env[LEGACY_ENV_CLIENT_BUNDLE_PATH]?.trim();
  return legacy || undefined;
}

/**
 * @param {Record<string, string | undefined>} env
 * @returns {boolean}
 */
export function mcpEnvHasClientProjectPath(env) {
  return Boolean(pickClientProjectPath(env));
}

/**
 * @param {Record<string, string>} env
 * @returns {Record<string, string>}
 */
export function stripLegacyClientPathEnv(env) {
  /** @type {Record<string, string>} */
  const out = { ...env };
  delete out[LEGACY_ENV_CLIENT_PROJECT_PATH];
  delete out[LEGACY_ENV_CLIENT_BUNDLE_PATH];
  return out;
}

/**
 * @param {{ projectPath: string; bundlePath?: string; storeRoot?: string }} params
 * @returns {Record<string, string>}
 */
export function buildCanonicalPathEnv({ projectPath, bundlePath, storeRoot }) {
  /** @type {Record<string, string>} */
  const env = {
    [ENV_CLIENT_PROJECT_PATH]: projectPath,
  };
  if (bundlePath) {
    env[ENV_CLIENT_BUNDLE_PATH] = bundlePath;
  }
  if (storeRoot) {
    env.TIED_STORE_ROOT = storeRoot;
  }
  return env;
}
