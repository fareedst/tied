/**
 * [IMPL-TIED_CLAUDE_SKILLS_REROOT] [ARCH-TIED_CLAUDE_SKILLS_REROOT] [REQ-TIED_CLAUDE_SKILLS_REROOT]
 * How: CONFIG_SKILLS_REROOT — resolve managed skills install directory (default harness paths vs repo-root skills/).
 */
import fs from "node:fs";
import path from "node:path";

/** Env flag pinned in tests: set to 1 to enable repo-root skills/ re-root. */
export const SKILLS_REROOT_ENV = "TIED_SKILLS_REROOT";

const ARCH_SKILLS_REROOT_REL = path.join(
  "tied",
  "architecture-decisions",
  "ARCH-TIED_CLAUDE_SKILLS_REROOT.yaml",
);

/**
 * @param {NodeJS.ProcessEnv} [env]
 */
export function skillsRerootEnabledFromEnv(env = process.env) {
  const raw = env[SKILLS_REROOT_ENV];
  if (raw == null || raw === "") return false;
  const normalized = String(raw).trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
}

/**
 * @param {"cursor" | "claude"} harnessProfile
 */
export function defaultSkillsDir(projectRoot, harnessProfile) {
  if (harnessProfile === "claude") {
    return path.join(projectRoot, ".claude", "skills");
  }
  return path.join(projectRoot, ".cursor", "skills");
}

export function archSkillsRerootPresent(tiedRepoRoot) {
  if (!tiedRepoRoot) return false;
  return fs.existsSync(path.join(tiedRepoRoot, ARCH_SKILLS_REROOT_REL));
}

/**
 * @param {string} projectRoot
 * @param {"cursor" | "claude"} harnessProfile
 * @param {{
 *   skills_reroot_enabled?: boolean,
 *   windows_copy_proven_in_ci?: boolean,
 *   tiedRepoRoot?: string,
 *   skills_root?: string,
 * }} options
 */
export function resolveSkillsInstallDir(projectRoot, harnessProfile, options = {}) {
  if (!options.skills_reroot_enabled) {
    return defaultSkillsDir(projectRoot, harnessProfile);
  }
  if (!options.windows_copy_proven_in_ci) {
    throw new Error("REROOT_WITHOUT_WINDOWS_PROOF");
  }
  if (!archSkillsRerootPresent(options.tiedRepoRoot)) {
    throw new Error("REROOT_WITHOUT_ARCH");
  }
  if (options.skills_root) {
    return path.resolve(options.skills_root);
  }
  return path.join(projectRoot, "skills");
}

/**
 * @param {NodeJS.ProcessEnv} env
 * @param {string} tiedRepoRoot
 * @param {boolean} windowsCopyProvenInCi
 */
export function buildSkillsBootstrapOptions(env, tiedRepoRoot, windowsCopyProvenInCi) {
  return {
    skills_reroot_enabled: skillsRerootEnabledFromEnv(env),
    windows_copy_proven_in_ci: windowsCopyProvenInCi,
    tiedRepoRoot,
  };
}
