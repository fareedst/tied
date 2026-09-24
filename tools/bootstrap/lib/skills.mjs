/**
 * [IMPL-TIED_FILES] [ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM] [REQ-TIED_SETUP]
 * [IMPL-TIED_CLAUDE_HARNESS] [ARCH-TIED_CLAUDE_HARNESS] [REQ-TIED_CLAUDE_HARNESS]
 * How: INSTALL_TIED_YAML_SKILL, prompt-type skills, TIED_REPO_ROOT patch; INSTALL_CLAUDE_SKILLS to .claude/skills/.
 */
import fs from "node:fs";
import path from "node:path";
import {
  copyTreeWithAttributes,
  copyFileWithAttributes,
  chmodExecutableRecursive,
  normalizeCopiedPathTimestamps,
} from "./copy-managed.mjs";
import { shellScriptRoot } from "./paths.mjs";
import { sayWarn, sayErr } from "./console.mjs";

function skillIsComplete(src) {
  return fs.existsSync(path.join(src, "scripts", "tied-cli.sh"));
}

function promptTypeSkillsIsComplete(src, sharedDir, skillDirs) {
  return (
    fs.existsSync(path.join(src, sharedDir)) &&
    fs.existsSync(path.join(src, skillDirs[0], "SKILL.md")) &&
    fs.existsSync(path.join(src, "prompt-type-router", "SKILL.md"))
  );
}

export function patchTiedRepoRoot(cliPath, tiedSourceRoot, marker) {
  if (!fs.existsSync(cliPath)) return { patched: false, skipped: true };
  const root = shellScriptRoot(tiedSourceRoot);
  const oldLine = `: "\${TIED_REPO_ROOT:=${marker}}"`;
  const newLine = `: "\${TIED_REPO_ROOT:=${root}}"`;
  let text = fs.readFileSync(cliPath, "utf8");
  if (!text.includes(oldLine)) {
    sayWarn(`${path.basename(cliPath)} at ${cliPath} has no TIED_REPO_ROOT placeholder; skipped baking TIED source path.`);
    return { patched: false, skipped: true, missingMarker: true };
  }
  text = text.replace(oldLine, newLine);
  fs.writeFileSync(cliPath, text, "utf8");
  return { patched: true };
}

function installTiedYamlSkillFrom(projectRoot, src, tiedRepoRoot, marker, skillsInstallDir) {
  const dest = path.join(skillsInstallDir, "tied-yaml");
  fs.mkdirSync(skillsInstallDir, { recursive: true });
  copyTreeWithAttributes(src, dest);
  chmodExecutableRecursive(dest);
  for (const scriptName of ["tied-cli.sh", "tied.sh", "feature-orchestrator.sh"]) {
    const cli = path.join(dest, "scripts", scriptName);
    const sourceCli = path.join(src, "scripts", scriptName);
    if (fs.existsSync(cli) && fs.existsSync(sourceCli)) {
      if (process.platform !== "win32" && fs.existsSync(cli)) {
        fs.chmodSync(cli, fs.statSync(cli).mode | 0o111);
      }
      const result = patchTiedRepoRoot(cli, tiedRepoRoot, marker);
      if (result.patched) {
        normalizeCopiedPathTimestamps(sourceCli, cli);
      } else if (result.missingMarker && result.patched === false) {
        // non-fatal skip already warned
      }
    }
  }
  sayWarn(`Copied tied-yaml Cursor skill into ${dest} (from ${src}).`);
}

export function installTiedYamlSkill(projectRoot, paths, options = {}) {
  const { tiedYamlSkillCanonical, tiedYamlSkillDevFallback, marker } = paths;
  const tiedRepoRoot = paths.tiedRepoRoot ?? paths.TIED_REPO_ROOT;
  const skillsInstallDir =
    options.skillsInstallDir ?? path.join(projectRoot, ".cursor", "skills");
  if (skillIsComplete(tiedYamlSkillCanonical)) {
    installTiedYamlSkillFrom(projectRoot, tiedYamlSkillCanonical, tiedRepoRoot, marker, skillsInstallDir);
    return;
  }
  if (skillIsComplete(tiedYamlSkillDevFallback)) {
    sayWarn(
      `Bundled tied-yaml missing or incomplete at ${tiedYamlSkillCanonical}; using non-canonical ${tiedYamlSkillDevFallback}.`
    );
    installTiedYamlSkillFrom(projectRoot, tiedYamlSkillDevFallback, tiedRepoRoot, marker, skillsInstallDir);
    return;
  }
  sayErr("ERROR: tied-yaml skill not found or incomplete. Need scripts/tied-cli.sh in one of:");
  sayErr(`  ${tiedYamlSkillCanonical}  (canonical bundled copy; use a complete TIED repository checkout)`);
  sayErr(`  ${tiedYamlSkillDevFallback}  (dev fallback; copy bundled into .cursor/skills/ if needed)`);
  sayErr("Recovery: re-run this script from a TIED tree that includes tools/bundled-tied-yaml-skill/, or");
  sayErr("  cp -pR <TIED_repo>/tools/bundled-tied-yaml-skill .cursor/skills/tied-yaml");
  throw new Error("SKILL_INSTALL_FAILED");
}

export function installPromptTypeSkills(projectRoot, paths, options = {}) {
  const src = paths.promptTypeSkillsCanonical;
  const dest = options.skillsInstallDir ?? path.join(projectRoot, ".cursor", "skills");
  const { PROMPT_TYPE_SHARED_DIR, PROMPT_TYPE_SKILL_DIRS } = paths;
  if (!promptTypeSkillsIsComplete(src, PROMPT_TYPE_SHARED_DIR, PROMPT_TYPE_SKILL_DIRS)) {
    sayErr(`ERROR: prompt-type skill bundle not found or incomplete at ${src}.`);
    throw new Error("SKILL_INSTALL_FAILED");
  }
  fs.mkdirSync(dest, { recursive: true });
  copyTreeWithAttributes(path.join(src, PROMPT_TYPE_SHARED_DIR), path.join(dest, PROMPT_TYPE_SHARED_DIR));
  for (const skillDir of PROMPT_TYPE_SKILL_DIRS) {
    copyTreeWithAttributes(path.join(src, skillDir), path.join(dest, skillDir));
  }
  chmodExecutableRecursive(path.join(dest, PROMPT_TYPE_SHARED_DIR));
  for (const skillDir of PROMPT_TYPE_SKILL_DIRS) {
    chmodExecutableRecursive(path.join(dest, skillDir));
  }
  sayWarn(`Copied prompt-type Cursor skills into ${dest} (from ${src}).`);
}

function installClaudeTiedYamlSkillFrom(projectRoot, src, tiedRepoRoot, marker, skillsInstallDir) {
  const dest = path.join(skillsInstallDir, "tied-yaml");
  fs.mkdirSync(skillsInstallDir, { recursive: true });
  copyTreeWithAttributes(src, dest);
  chmodExecutableRecursive(dest);
  for (const scriptName of ["tied-cli.sh", "tied.sh", "feature-orchestrator.sh"]) {
    const cli = path.join(dest, "scripts", scriptName);
    const sourceCli = path.join(src, "scripts", scriptName);
    if (fs.existsSync(cli) && fs.existsSync(sourceCli)) {
      if (process.platform !== "win32") {
        fs.chmodSync(cli, fs.statSync(cli).mode | 0o111);
      }
      patchTiedRepoRoot(cli, tiedRepoRoot, marker);
      normalizeCopiedPathTimestamps(sourceCli, cli);
    }
  }
}

function installClaudePromptTypeSkillsFrom(projectRoot, src, paths, skillsInstallDir) {
  const dest = skillsInstallDir;
  const { PROMPT_TYPE_SHARED_DIR, PROMPT_TYPE_SKILL_DIRS } = paths;
  fs.mkdirSync(dest, { recursive: true });
  copyTreeWithAttributes(path.join(src, PROMPT_TYPE_SHARED_DIR), path.join(dest, PROMPT_TYPE_SHARED_DIR));
  for (const skillDir of PROMPT_TYPE_SKILL_DIRS) {
    copyTreeWithAttributes(path.join(src, skillDir), path.join(dest, skillDir));
  }
  chmodExecutableRecursive(path.join(dest, PROMPT_TYPE_SHARED_DIR));
  for (const skillDir of PROMPT_TYPE_SKILL_DIRS) {
    chmodExecutableRecursive(path.join(dest, skillDir));
  }
}

function symlinkClaudePromptTypeSkillsFrom(projectRoot, src, paths, skillsInstallDir) {
  const dest = skillsInstallDir;
  const { PROMPT_TYPE_SHARED_DIR, PROMPT_TYPE_SKILL_DIRS } = paths;
  fs.mkdirSync(dest, { recursive: true });
  const linkEntry = (name) => {
    const target = path.join(dest, name);
    if (fs.existsSync(target)) {
      fs.rmSync(target, { recursive: true, force: true });
    }
    fs.symlinkSync(path.join(src, name), target, "dir");
  };
  linkEntry(PROMPT_TYPE_SHARED_DIR);
  for (const skillDir of PROMPT_TYPE_SKILL_DIRS) {
    linkEntry(skillDir);
  }
}

/**
 * [IMPL-TIED_CLAUDE_HARNESS] [ARCH-TIED_CLAUDE_HARNESS] [REQ-TIED_CLAUDE_HARNESS] [REQ-PROMPT_TYPE_GLOBAL_SKILLS]
 * [IMPL-TIED_CLAUDE_BOOTSTRAP_OPS] [ARCH-TIED_CLAUDE_BOOTSTRAP_OPS] [REQ-TIED_CLAUDE_BOOTSTRAP_OPS]
 * [IMPL-TIED_CLAUDE_SKILLS_REROOT] [ARCH-TIED_CLAUDE_SKILLS_REROOT] [REQ-TIED_CLAUDE_SKILLS_REROOT]
 * How: INSTALL_CLAUDE_SKILLS — copy-default bundled skills (Unix symlink opt-in gated by GATE_SYMLINK_ON_WINDOWS_PROOF); destination from options.skillsInstallDir.
 */
export function installClaudeSkills(projectRoot, paths, options = {}) {
  if (options.symlink_unix_opt_in && !options.windows_copy_proven_in_ci) {
    throw new Error("SYMLINK_WITHOUT_CI_WINDOWS_PROOF");
  }
  const tiedRepoRoot = paths.tiedRepoRoot ?? paths.TIED_REPO_ROOT;
  const { tiedYamlSkillCanonical, tiedYamlSkillDevFallback, marker, promptTypeSkillsCanonical } = paths;
  const { PROMPT_TYPE_SHARED_DIR, PROMPT_TYPE_SKILL_DIRS } = paths;
  const skillsInstallDir =
    options.skillsInstallDir ?? path.join(projectRoot, ".claude", "skills");
  const installedPaths = [];
  const useUnixSymlink =
    options.symlink_unix_opt_in &&
    options.windows_copy_proven_in_ci &&
    process.platform !== "win32";

  if (!promptTypeSkillsIsComplete(promptTypeSkillsCanonical, PROMPT_TYPE_SHARED_DIR, PROMPT_TYPE_SKILL_DIRS)) {
    sayErr(`ERROR: prompt-type skill bundle not found or incomplete at ${promptTypeSkillsCanonical}.`);
    throw new Error("SKILL_INSTALL_FAILED");
  }
  if (useUnixSymlink) {
    symlinkClaudePromptTypeSkillsFrom(projectRoot, promptTypeSkillsCanonical, paths, skillsInstallDir);
  } else {
    installClaudePromptTypeSkillsFrom(projectRoot, promptTypeSkillsCanonical, paths, skillsInstallDir);
  }
  installedPaths.push(skillsInstallDir);

  if (skillIsComplete(tiedYamlSkillCanonical)) {
    installClaudeTiedYamlSkillFrom(projectRoot, tiedYamlSkillCanonical, tiedRepoRoot, marker, skillsInstallDir);
  } else if (skillIsComplete(tiedYamlSkillDevFallback)) {
    sayWarn(
      `Bundled tied-yaml missing or incomplete at ${tiedYamlSkillCanonical}; using non-canonical ${tiedYamlSkillDevFallback}.`
    );
    installClaudeTiedYamlSkillFrom(projectRoot, tiedYamlSkillDevFallback, tiedRepoRoot, marker, skillsInstallDir);
  } else {
    sayErr("ERROR: tied-yaml skill not found or incomplete for Claude install.");
    throw new Error("SKILL_INSTALL_FAILED");
  }
  installedPaths.push(path.join(skillsInstallDir, "tied-yaml"));
  if (useUnixSymlink) {
    sayWarn(
      `Symlinked Claude prompt-type skills into ${skillsInstallDir} (tied-yaml copied for TIED_REPO_ROOT patch).`
    );
  } else {
    sayWarn(`Copied Claude skills into ${skillsInstallDir} (copy default).`);
  }
  return { installedPaths };
}

export function copyHooks(projectRoot, hooksSource, tiedRepoRoot) {
  if (!fs.existsSync(hooksSource)) return;
  const cursorDir = path.join(projectRoot, ".cursor");
  const dest = path.join(cursorDir, "hooks.json");
  fs.mkdirSync(cursorDir, { recursive: true });
  copyFileWithAttributes(hooksSource, dest);
  let text = fs.readFileSync(dest, "utf8");
  const sourceLogs = path.join(tiedRepoRoot, ".cursor", "logs").split(path.sep).join("/");
  const destLogs = path.join(projectRoot, ".cursor", "logs").split(path.sep).join("/");
  text = text.split(sourceLogs).join(destLogs);
  text = text.split(path.join(tiedRepoRoot, ".cursor", "logs")).join(path.join(projectRoot, ".cursor", "logs"));
  fs.writeFileSync(dest, text, "utf8");
  normalizeCopiedPathTimestamps(hooksSource, dest);
}
