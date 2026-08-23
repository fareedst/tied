/**
 * Shared TIED project identity resolver.
 * - [IMPL-TIED_PROJECT_IDENTITY] [ARCH-TIED_PROJECT_IDENTITY] [REQ-MCP_USAGE_METRICS] [REQ-EVIDENCE_CHAIN_PROFILE]
 */

import crypto from "node:crypto";
import path from "node:path";

export type IdentitySource = "configured" | "path_fallback";

export type ProjectIdentity = {
  project_id: string;
  identity_source: IdentitySource;
};

const MAX_CONFIGURED_ID_LENGTH = 128;

function hashToProjectId(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex").slice(0, 16);
}

export function isValidConfiguredProjectId(candidate: string): boolean {
  if (candidate.length > MAX_CONFIGURED_ID_LENGTH) return false;
  if (/[\n\r/\\]/.test(candidate)) return false;
  return true;
}

export function pathFallbackProjectId(tiedBasePath: string): string {
  return hashToProjectId(path.resolve(tiedBasePath || "unknown"));
}

/** @deprecated Use resolveProjectIdentity for identity_source; returns project_id only. */
export function anonymizedProjectId(tiedBasePath: string, env: NodeJS.ProcessEnv = process.env): string {
  return resolveProjectIdentity(tiedBasePath, env).project_id;
}

export function resolveProjectIdentity(
  tiedBasePath: string,
  env: NodeJS.ProcessEnv = process.env,
): ProjectIdentity {
  const configuredRaw = env.TIED_MCP_PROJECT_ID;
  if (configuredRaw != null) {
    const trimmed = configuredRaw.trim();
    if (trimmed !== "" && isValidConfiguredProjectId(trimmed)) {
      return {
        project_id: hashToProjectId(trimmed),
        identity_source: "configured",
      };
    }
  }
  return {
    project_id: pathFallbackProjectId(tiedBasePath),
    identity_source: "path_fallback",
  };
}
