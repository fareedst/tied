/**
 * [IMPL-TIED_CLIENT_BOOTSTRAP_SKILLS] [ARCH-TIED_CLIENT_BOOTSTRAP_SKILLS] [REQ-TIED_CLIENT_BOOTSTRAP_SKILLS]
 * How: manifest-driven store-only facilitator skill catalog (not installed on disposable clients).
 */
import fs from "node:fs";
import path from "node:path";
import { loadManifest } from "./constants.mjs";
import { copyTreeWithAttributes } from "./copy-managed.mjs";
import { buildSkillStubBody, writeSkillStub } from "./skill-stub.mjs";
import { sayWarn } from "./console.mjs";

/**
 * @param {string} storeRoot absolute TIED store / repo root
 * @returns {{ skillName: string, storeDir: string, storeSkillMd: string, storeDirRel: string }[]}
 */
export function loadStoreFacilitatorSkills(storeRoot) {
  const manifest = loadManifest();
  const entries = manifest.STORE_FACILITATOR_SKILLS ?? [];
  if (!Array.isArray(entries)) {
    throw new Error("STORE_FACILITATOR_SKILLS_MANIFEST_INVALID");
  }
  return entries.map((entry) => {
    const skillName = entry?.skillName;
    const storeDirRel = entry?.storeDir;
    if (!skillName || !storeDirRel) {
      throw new Error("STORE_FACILITATOR_SKILLS_MANIFEST_INVALID");
    }
    const storeDir = path.join(storeRoot, storeDirRel);
    const storeSkillMd = path.join(storeDir, "SKILL.md");
    if (!fs.existsSync(storeSkillMd)) {
      const err = new Error("STORE_FACILITATOR_SKILL_MISSING");
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
export function installStoreFacilitatorSkillsLinkedStub(storeRoot, skillsInstallDir) {
  fs.mkdirSync(skillsInstallDir, { recursive: true });
  const installed = [];
  for (const entry of loadStoreFacilitatorSkills(storeRoot)) {
    const dest = path.join(skillsInstallDir, entry.skillName);
    fs.mkdirSync(dest, { recursive: true });
    const body = buildSkillStubBody({
      storeRoot,
      skillName: entry.skillName,
      storeSkillRel: entry.storeDirRel,
    });
    writeSkillStub(path.join(dest, "SKILL.md"), entry.storeSkillMd, body);
    sayWarn(`Wrote linked store facilitator skill stub ${entry.skillName} into ${dest}.`);
    installed.push(dest);
  }
  return installed;
}

/**
 * @param {string} storeRoot
 * @param {string} skillsInstallDir
 */
export function installStoreFacilitatorSkillsCopy(storeRoot, skillsInstallDir) {
  fs.mkdirSync(skillsInstallDir, { recursive: true });
  const installed = [];
  for (const entry of loadStoreFacilitatorSkills(storeRoot)) {
    const dest = path.join(skillsInstallDir, entry.skillName);
    copyTreeWithAttributes(entry.storeDir, dest);
    sayWarn(`Copied store facilitator skill ${entry.skillName} into ${dest}.`);
    installed.push(dest);
  }
  return installed;
}

/**
 * @param {string} projectRoot
 * @param {string} storeRoot
 */
export function isStoreSelfInstall(projectRoot, storeRoot) {
  return path.resolve(projectRoot) === path.resolve(storeRoot);
}
