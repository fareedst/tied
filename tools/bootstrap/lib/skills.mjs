/**
 * [IMPL-TIED_FILES] [ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM] [REQ-TIED_SETUP]
 * How: INSTALL_TIED_YAML_SKILL, prompt-type skills, TIED_REPO_ROOT patch.
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

function installTiedYamlSkillFrom(projectRoot, src, tiedRepoRoot, marker) {
  const dest = path.join(projectRoot, ".cursor", "skills", "tied-yaml");
  fs.mkdirSync(path.join(projectRoot, ".cursor", "skills"), { recursive: true });
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

export function installTiedYamlSkill(projectRoot, paths) {
  const { tiedYamlSkillCanonical, tiedYamlSkillDevFallback, marker } = paths;
  const tiedRepoRoot = paths.tiedRepoRoot ?? paths.TIED_REPO_ROOT;
  if (skillIsComplete(tiedYamlSkillCanonical)) {
    installTiedYamlSkillFrom(projectRoot, tiedYamlSkillCanonical, tiedRepoRoot, marker);
    return;
  }
  if (skillIsComplete(tiedYamlSkillDevFallback)) {
    sayWarn(
      `Bundled tied-yaml missing or incomplete at ${tiedYamlSkillCanonical}; using non-canonical ${tiedYamlSkillDevFallback}.`
    );
    installTiedYamlSkillFrom(projectRoot, tiedYamlSkillDevFallback, tiedRepoRoot, marker);
    return;
  }
  sayErr("ERROR: tied-yaml skill not found or incomplete. Need scripts/tied-cli.sh in one of:");
  sayErr(`  ${tiedYamlSkillCanonical}  (canonical bundled copy; use a complete TIED repository checkout)`);
  sayErr(`  ${tiedYamlSkillDevFallback}  (dev fallback; copy bundled into .cursor/skills/ if needed)`);
  sayErr("Recovery: re-run this script from a TIED tree that includes tools/bundled-tied-yaml-skill/, or");
  sayErr("  cp -pR <TIED_repo>/tools/bundled-tied-yaml-skill .cursor/skills/tied-yaml");
  throw new Error("SKILL_INSTALL_FAILED");
}

export function installPromptTypeSkills(projectRoot, paths) {
  const src = paths.promptTypeSkillsCanonical;
  const dest = path.join(projectRoot, ".cursor", "skills");
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
