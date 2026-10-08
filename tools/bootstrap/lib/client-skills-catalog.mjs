/**
 * [IMPL-TIED_CLIENT_BOOTSTRAP_SKILLS] [ARCH-TIED_CLIENT_BOOTSTRAP_SKILLS] [REQ-TIED_CLIENT_BOOTSTRAP_SKILLS]
 * How: manifest-driven standalone client skill catalog and install helpers.
 */
import fs from "node:fs";
import path from "node:path";
import { loadManifest } from "./constants.mjs";
import { copyTreeWithAttributes } from "./copy-managed.mjs";
import { buildSkillStubBody, writeSkillStub } from "./skill-stub.mjs";
import { sayWarn } from "./console.mjs";

/**
 * @param {string} storeRoot absolute TIED store / repo root
 * @returns {{ skillName: string, storeDir: string, storeSkillMd: string }[]}
 */
export function loadStandaloneClientSkills(storeRoot) {
  const manifest = loadManifest();
  const entries = manifest.BUNDLED_STANDALONE_CLIENT_SKILLS;
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new Error("STANDALONE_CLIENT_SKILLS_MANIFEST_EMPTY");
  }
  return entries.map((entry) => {
    const skillName = entry?.skillName;
    const storeDirRel = entry?.storeDir;
    if (!skillName || !storeDirRel) {
      throw new Error("STANDALONE_CLIENT_SKILLS_MANIFEST_INVALID");
    }
    const storeDir = path.join(storeRoot, storeDirRel);
    const storeSkillMd = path.join(storeDir, "SKILL.md");
    if (!fs.existsSync(storeSkillMd)) {
      const err = new Error("STANDALONE_CLIENT_SKILL_MISSING");
      err.skillName = skillName;
      err.storeSkillMd = storeSkillMd;
      throw err;
    }
    return { skillName, storeDir, storeSkillMd, storeDirRel };
  });
}

/**
 * @param {string} storeRoot
 * @param {string} skillsInstallDir
 */
export function installStandaloneSkillsCopy(storeRoot, skillsInstallDir) {
  fs.mkdirSync(skillsInstallDir, { recursive: true });
  const installed = [];
  for (const entry of loadStandaloneClientSkills(storeRoot)) {
    const dest = path.join(skillsInstallDir, entry.skillName);
    copyTreeWithAttributes(entry.storeDir, dest);
    sayWarn(`Copied standalone skill ${entry.skillName} into ${dest}.`);
    installed.push(dest);
  }
  return installed;
}

/**
 * @param {string} storeRoot
 * @param {string} skillsInstallDir
 */
export function installStandaloneSkillsLinkedStub(storeRoot, skillsInstallDir) {
  fs.mkdirSync(skillsInstallDir, { recursive: true });
  const installed = [];
  for (const entry of loadStandaloneClientSkills(storeRoot)) {
    const dest = path.join(skillsInstallDir, entry.skillName);
    fs.mkdirSync(dest, { recursive: true });
    const body = buildSkillStubBody({
      storeRoot,
      skillName: entry.skillName,
      storeSkillRel: entry.storeDirRel,
    });
    writeSkillStub(path.join(dest, "SKILL.md"), entry.storeSkillMd, body);
    sayWarn(`Wrote linked standalone skill stub ${entry.skillName} into ${dest}.`);
    installed.push(dest);
  }
  return installed;
}

/**
 * @param {string} skillsRoot
 * @param {string} [storeRoot] when set, validate against manifest; otherwise only check paths exist
 */
export function assertStandaloneSkillsInventory(skillsRoot, storeRoot) {
  const entries = storeRoot
    ? loadStandaloneClientSkills(storeRoot)
    : loadManifest().BUNDLED_STANDALONE_CLIENT_SKILLS.map((e) => ({
        skillName: e.skillName,
      }));
  for (const entry of entries) {
    const skillPath = path.join(skillsRoot, entry.skillName, "SKILL.md");
    if (!fs.existsSync(skillPath)) {
      return false;
    }
  }
  return true;
}
