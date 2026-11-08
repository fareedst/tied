/**
 * [REQ-TIED_INSTALL_JSON_REFRESH_SEMVER] [IMPL-TIED_INSTALL_JSON_REFRESH_SEMVER]
 * [ARCH-TIED_INSTALL_JSON_REFRESH_SEMVER] [REQ-TIED_LAYERED_CLIENT_INSTALL]
 * Read store methodology semver from VERSION then AGENTS.md.
 */
import fs from "node:fs";
import path from "node:path";

const SEMVER_RE = /^\d+\.\d+\.\d+$/;
const AGENTS_VERSION_LINE = /^\*\*TIED Methodology Version\*\*:\s*(.+)\s*$/m;

/**
 * @param {string} agentsPath
 * @returns {string | null}
 */
export function readAgentsSemverFromFile(agentsPath) {
  try {
    if (!fs.existsSync(agentsPath)) return null;
    const match = fs.readFileSync(agentsPath, "utf8").match(AGENTS_VERSION_LINE);
    const version = match?.[1]?.trim();
    if (version && SEMVER_RE.test(version)) {
      return version;
    }
  } catch {
    /* fall through */
  }
  return null;
}

/**
 * PRE: storeRoot is absolute path to TIED store checkout.
 * POST: semver string or "unknown" when no valid source on store.
 * EFFECTS: read-only
 * @param {string} storeRoot
 * @returns {string}
 */
export function readStoreMethodologySemver(storeRoot) {
  const root = path.resolve(storeRoot);
  const versionPath = path.join(root, "VERSION");
  try {
    if (fs.existsSync(versionPath)) {
      const version = fs.readFileSync(versionPath, "utf8").trim();
      if (SEMVER_RE.test(version)) {
        return version;
      }
    }
  } catch {
    /* fall through */
  }
  const fromAgents = readAgentsSemverFromFile(path.join(root, "AGENTS.md"));
  if (fromAgents) {
    return fromAgents;
  }
  return "unknown";
}
