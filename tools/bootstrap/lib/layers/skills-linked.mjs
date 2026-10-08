/**
 * [IMPL-TIED_LAYERED_CLIENT_INSTALL] [ARCH-TIED_LAYERED_CLIENT_INSTALL] [REQ-TIED_LAYERED_CLIENT_INSTALL]
 * How: WRITE_SKILL_STUB and WRITE_CLI_WRAPPERS for linked install mode.
 */
import fs from "node:fs";
import path from "node:path";
import { manifestPaths } from "../constants.mjs";
import { jsonSafeAbsolute, shellScriptRoot } from "../paths.mjs";
import { chmodExecutableRecursive, linkOrMaterializeCopy } from "../copy-managed.mjs";
import { sayWarn } from "../console.mjs";
import {
  installStandaloneSkillsCopy,
  installStandaloneSkillsLinkedStub,
} from "../client-skills-catalog.mjs";
import { buildSkillStubBody, writeSkillStub } from "../skill-stub.mjs";
import {
  installClaudeSkills,
  installTiedYamlSkill,
  installPromptTypeSkills,
} from "../skills.mjs";
import {
  buildSkillsBootstrapOptions,
  resolveSkillsInstallDir,
} from "../skills-reroot.mjs";
import { WINDOWS_COPY_PROVEN_IN_CI } from "../constants.mjs";

export {
  extractYamlFrontMatter,
  storeAbsPath,
  buildSkillStubBody,
  writeSkillStub,
} from "../skill-stub.mjs";

/**
 * @param {string} wrapperPath
 * @param {string} storeScriptPath
 * @param {string} storeRoot
 * @param {string} marker
 */
export function writeExecWrapper(wrapperPath, storeScriptPath, storeRoot, marker) {
  const root = shellScriptRoot(storeRoot);
  const script = jsonSafeAbsolute(storeScriptPath);
  const body = `#!/usr/bin/env bash
set -euo pipefail
_WRAPPER_ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
: "\${TIED_REPO_ROOT:=${marker}}"
export TIED_REPO_ROOT="\${TIED_REPO_ROOT:=${root}}"
: "\${TIED_METHOD_ROOT:=\${_WRAPPER_ROOT}/tied-bundle}"
export TIED_METHOD_ROOT
exec "${script}" "$@"
`;
  fs.mkdirSync(path.dirname(wrapperPath), { recursive: true });
  fs.writeFileSync(wrapperPath, body, "utf8");
  if (process.platform !== "win32") {
    fs.chmodSync(wrapperPath, 0o755);
  }
}

/**
 * @param {string} projectRoot
 * @param {{ storeRoot: string, harness: string, env?: NodeJS.ProcessEnv }} options
 */
export function installSkillsLinked(projectRoot, options) {
  const paths = manifestPaths();
  paths.tiedRepoRoot = options.storeRoot;
  const env = options.env ?? process.env;
  const skillsBootstrap = buildSkillsBootstrapOptions(env, options.storeRoot, WINDOWS_COPY_PROVEN_IN_CI);
  const harness = options.harness ?? "both";

  if (harness === "cursor" || harness === "both") {
    const cursorSkillsDir = resolveSkillsInstallDir(projectRoot, "cursor", skillsBootstrap);
    installLinkedPromptTypeSkills(projectRoot, paths, cursorSkillsDir, options.storeRoot);
    installLinkedTiedYamlSkill(projectRoot, paths, cursorSkillsDir, options.storeRoot);
    installStandaloneSkillsLinkedStub(options.storeRoot, cursorSkillsDir);
  }

  if (harness === "claude" || harness === "both") {
    const claudeSkillsDir = resolveSkillsInstallDir(projectRoot, "claude", skillsBootstrap);
    installLinkedPromptTypeSkills(projectRoot, paths, claudeSkillsDir, options.storeRoot);
    installLinkedTiedYamlSkill(projectRoot, paths, claudeSkillsDir, options.storeRoot);
    installStandaloneSkillsLinkedStub(options.storeRoot, claudeSkillsDir);
  }
}

/**
 * @param {string} projectRoot
 * @param {object} paths
 * @param {string} skillsInstallDir
 * @param {string} storeRoot
 */
function installLinkedPromptTypeSkills(projectRoot, paths, skillsInstallDir, storeRoot) {
  const { PROMPT_TYPE_SHARED_DIR, PROMPT_TYPE_SKILL_DIRS, promptTypeSkillsCanonical, marker } = paths;
  fs.mkdirSync(skillsInstallDir, { recursive: true });

  const sharedDest = path.join(skillsInstallDir, PROMPT_TYPE_SHARED_DIR);
  fs.mkdirSync(sharedDest, { recursive: true });
  for (const name of fs.readdirSync(path.join(promptTypeSkillsCanonical, PROMPT_TYPE_SHARED_DIR))) {
    const srcFile = path.join(promptTypeSkillsCanonical, PROMPT_TYPE_SHARED_DIR, name);
    if (!fs.statSync(srcFile).isFile()) continue;
    writeDocRedirectStub(
      path.join(sharedDest, name),
      path.join(storeRoot, "tools", "bundled-prompt-type-skills", PROMPT_TYPE_SHARED_DIR, name),
      name,
    );
  }

  for (const skillDir of PROMPT_TYPE_SKILL_DIRS) {
    const srcSkill = path.join(promptTypeSkillsCanonical, skillDir, "SKILL.md");
    const destSkill = path.join(skillsInstallDir, skillDir, "SKILL.md");
    const storeRel = path.join("tools", "bundled-prompt-type-skills", skillDir);
    const body = buildSkillStubBody({
      storeRoot,
      skillName: skillDir,
      storeSkillRel: storeRel,
      sharedHint: "`prompt-shared` lives at `" + path.join(storeRoot, "tools", "bundled-prompt-type-skills", "prompt-shared") + "`.",
    });
    writeSkillStub(destSkill, srcSkill, body);
  }
  chmodExecutableRecursive(skillsInstallDir);
  sayWarn(`Wrote linked prompt-type skill stubs into ${skillsInstallDir}.`);
}

function installLinkedTiedYamlSkill(projectRoot, paths, skillsInstallDir, storeRoot) {
  const { tiedYamlSkillCanonical, marker } = paths;
  const dest = path.join(skillsInstallDir, "tied-yaml");
  fs.mkdirSync(dest, { recursive: true });
  const srcSkill = path.join(tiedYamlSkillCanonical, "SKILL.md");
  const body = buildSkillStubBody({
    storeRoot,
    skillName: "tied-yaml",
    storeSkillRel: path.join("tools", "bundled-tied-yaml-skill"),
  });
  writeSkillStub(path.join(dest, "SKILL.md"), srcSkill, body);

  const scriptsDir = path.join(dest, "scripts");
  fs.mkdirSync(scriptsDir, { recursive: true });
  for (const scriptName of ["tied-cli.sh", "tied.sh", "feature-orchestrator.sh"]) {
    const storeScript = path.join(tiedYamlSkillCanonical, "scripts", scriptName);
    writeExecWrapper(
      path.join(scriptsDir, scriptName),
      storeScript,
      storeRoot,
      marker,
    );
  }
  sayWarn(`Wrote linked tied-yaml skill stubs into ${dest}.`);
}

/**
 * @param {string} dest
 * @param {string} storeTarget
 * @param {string} title
 */
export function writeDocRedirectStub(dest, storeTarget, title) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (dest.endsWith(".yaml") && fs.existsSync(storeTarget)) {
    linkOrMaterializeCopy(storeTarget, dest);
    return;
  }
  const heading = title.replace(/\.md$/, "");
  const body = `# ${heading}

This file is a **linked install stub**. Read the canonical content at:

\`${storeTarget}\`

If that path is missing, re-run \`tied-install.sh --refresh\` or use \`--mode full\`.
`;
  fs.writeFileSync(dest, body, "utf8");
}

/**
 * @param {string} projectRoot
 * @param {object} paths
 * @param {{ storeRoot: string, harness: string, env?: NodeJS.ProcessEnv }} options
 */
export function installSkillsFull(projectRoot, paths, options) {
  paths.tiedRepoRoot = options.storeRoot;
  const env = options.env ?? process.env;
  const skillsBootstrap = buildSkillsBootstrapOptions(env, options.storeRoot, WINDOWS_COPY_PROVEN_IN_CI);
  const harness = options.harness ?? "both";
  if (harness === "cursor" || harness === "both") {
    const cursorSkillsDir = resolveSkillsInstallDir(projectRoot, "cursor", skillsBootstrap);
    installTiedYamlSkill(projectRoot, paths, { skillsInstallDir: cursorSkillsDir });
    installStandaloneSkillsCopy(options.storeRoot, cursorSkillsDir);
    installPromptTypeSkills(projectRoot, paths, { skillsInstallDir: cursorSkillsDir });
  }
  if (harness === "claude" || harness === "both") {
    const claudeSkillsDir = resolveSkillsInstallDir(projectRoot, "claude", skillsBootstrap);
    installClaudeSkills(projectRoot, paths, {
      ...skillsBootstrap,
      skillsInstallDir: claudeSkillsDir,
      windows_copy_proven_in_ci: WINDOWS_COPY_PROVEN_IN_CI,
    });
  }
}
