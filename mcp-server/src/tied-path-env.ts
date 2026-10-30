/**
 * [IMPL-TIED_CLIENT_PATH_ENV_MIGRATION] [ARCH-TIED_CLIENT_PATH_ENV_MIGRATION] [REQ-TIED_CLIENT_PATH_ENV_MIGRATION]
 * Canonical client path env names; keep in sync with tools/bootstrap/lib/tied-path-env.mjs.
 */

export const ENV_CLIENT_PROJECT_PATH = "TIED_CLIENT_PROJECT_PATH" as const;
export const ENV_CLIENT_BUNDLE_PATH = "TIED_CLIENT_BUNDLE_PATH" as const;
export const LEGACY_ENV_CLIENT_PROJECT_PATH = "TIED_BASE_PATH" as const;
export const LEGACY_ENV_CLIENT_BUNDLE_PATH = "TIED_METHODOLOGY_BUNDLE_PATH" as const;

export function pickClientProjectPath(
  env: NodeJS.ProcessEnv | Record<string, string | undefined>,
): string | undefined {
  const canonical = env[ENV_CLIENT_PROJECT_PATH]?.trim();
  if (canonical) return canonical;
  const legacy = env[LEGACY_ENV_CLIENT_PROJECT_PATH]?.trim();
  return legacy || undefined;
}

export function pickClientBundlePath(
  env: NodeJS.ProcessEnv | Record<string, string | undefined>,
): string | undefined {
  const canonical = env[ENV_CLIENT_BUNDLE_PATH]?.trim();
  if (canonical) return canonical;
  const legacy = env[LEGACY_ENV_CLIENT_BUNDLE_PATH]?.trim();
  return legacy || undefined;
}

export function stripLegacyClientPathEnv(env: Record<string, string>): Record<string, string> {
  const out = { ...env };
  delete out[LEGACY_ENV_CLIENT_PROJECT_PATH];
  delete out[LEGACY_ENV_CLIENT_BUNDLE_PATH];
  return out;
}
