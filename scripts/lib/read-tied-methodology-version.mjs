/**
 * [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_SETUP] [REQ-TIED_CLIENT_OPERATOR_TOOLING]
 * Read repo methodology semver for W7 CLI defaults.
 */
import fs from "node:fs";
import path from "node:path";

const SEMVER_RE = /^\d+\.\d+\.\d+$/;
const AGENTS_VERSION_LINE = /^\*\*TIED Methodology Version\*\*:\s*(.+)\s*$/m;

function findVersionPath(startDir) {
  let dir = path.resolve(startDir);
  for (let i = 0; i < 12; i += 1) {
    const candidate = path.join(dir, "VERSION");
    if (fs.existsSync(candidate)) {
      const version = fs.readFileSync(candidate, "utf8").trim();
      if (!SEMVER_RE.test(version)) {
        throw new Error(`Invalid VERSION semver at ${candidate}`);
      }
      return version;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return undefined;
}

function readInstallConfigVersion(projectRoot) {
  const configPath = path.join(projectRoot, "tied-bundle", "install.json");
  if (!fs.existsSync(configPath)) return undefined;
  try {
    const parsed = JSON.parse(fs.readFileSync(configPath, "utf8"));
    const raw = parsed.store_methodology_version ?? parsed.tied_version;
    if (typeof raw !== "string") return undefined;
    const version = raw.trim();
    return SEMVER_RE.test(version) ? version : undefined;
  } catch {
    return undefined;
  }
}

function readAgentsMdVersion(projectRoot) {
  const agentsPath = path.join(projectRoot, "AGENTS.md");
  if (!fs.existsSync(agentsPath)) return undefined;
  const match = fs.readFileSync(agentsPath, "utf8").match(AGENTS_VERSION_LINE);
  const version = match?.[1]?.trim();
  return version && SEMVER_RE.test(version) ? version : undefined;
}

/**
 * @param {string} projectRoot
 * @returns {string}
 */
export function readTiedMethodologyVersionFromProjectRoot(projectRoot) {
  const root = path.resolve(projectRoot);
  const fromFile = findVersionPath(root);
  if (fromFile) return fromFile;
  const fromInstall = readInstallConfigVersion(root);
  if (fromInstall) return fromInstall;
  const fromAgents = readAgentsMdVersion(root);
  if (fromAgents) return fromAgents;
  throw new Error(
    `Methodology semver not found from ${root} (checked VERSION walk, install.json, AGENTS.md)`,
  );
}
