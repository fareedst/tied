/**
 * [REQ-TIED_CLIENT_BOOTSTRAP_SKILLS] [IMPL-TIED_CLIENT_BOOTSTRAP_SKILLS]
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { TIED_REPO_ROOT } from "./constants.mjs";
import {
  loadStoreFacilitatorSkills,
  installStoreFacilitatorSkillsLinkedStub,
  isStoreSelfInstall,
} from "./store-facilitator-skills.mjs";

describe("store-facilitator-skills [REQ-TIED_CLIENT_BOOTSTRAP_SKILLS]", () => {
  it("loadStoreFacilitatorSkills returns record-gf-trial", () => {
    const entries = loadStoreFacilitatorSkills(TIED_REPO_ROOT);
    assert.equal(entries.length, 1);
    assert.equal(entries[0].skillName, "record-gf-trial");
    assert.match(entries[0].storeDirRel, /bundled-record-gf-trial-skill/);
    assert.ok(fs.existsSync(entries[0].storeSkillMd));
  });

  it("installStoreFacilitatorSkillsLinkedStub references store path", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "store-facilitator-"));
    const skillsDir = path.join(tmp, ".cursor", "skills");
    installStoreFacilitatorSkillsLinkedStub(TIED_REPO_ROOT, skillsDir);
    const skillPath = path.join(skillsDir, "record-gf-trial", "SKILL.md");
    assert.ok(fs.existsSync(skillPath));
    const body = fs.readFileSync(skillPath, "utf8");
    assert.match(body, /name: record-gf-trial/);
    assert.match(body, /bundled-record-gf-trial-skill/);
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it("isStoreSelfInstall compares resolved paths", () => {
    const a = path.join(TIED_REPO_ROOT, ".");
    assert.ok(isStoreSelfInstall(a, TIED_REPO_ROOT));
    assert.ok(!isStoreSelfInstall(os.tmpdir(), TIED_REPO_ROOT));
  });
});
