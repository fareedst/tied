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
  it("loadStoreFacilitatorSkills returns record-gf-trial and record-wf-trial", () => {
    const entries = loadStoreFacilitatorSkills(TIED_REPO_ROOT);
    assert.equal(entries.length, 2);
    const names = entries.map((e) => e.skillName).sort();
    assert.deepEqual(names, ["record-gf-trial", "record-wf-trial"]);
    for (const entry of entries) {
      assert.match(entry.storeDirRel, /bundled-record-/);
      assert.ok(fs.existsSync(entry.storeSkillMd));
    }
    const gf = entries.find((e) => e.skillName === "record-gf-trial");
    assert.match(gf.storeDirRel, /bundled-record-gf-trial-skill/);
    const wf = entries.find((e) => e.skillName === "record-wf-trial");
    assert.match(wf.storeDirRel, /bundled-record-wf-trial-skill/);
  });

  it("installStoreFacilitatorSkillsLinkedStub references store path", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "store-facilitator-"));
    const skillsDir = path.join(tmp, ".cursor", "skills");
    installStoreFacilitatorSkillsLinkedStub(TIED_REPO_ROOT, skillsDir);
    for (const skillName of ["record-gf-trial", "record-wf-trial"]) {
      const skillPath = path.join(skillsDir, skillName, "SKILL.md");
      assert.ok(fs.existsSync(skillPath), skillName);
      const body = fs.readFileSync(skillPath, "utf8");
      assert.match(body, new RegExp(`name: ${skillName}`));
      assert.match(body, /bundled-record-/);
    }
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it("isStoreSelfInstall compares resolved paths", () => {
    const a = path.join(TIED_REPO_ROOT, ".");
    assert.ok(isStoreSelfInstall(a, TIED_REPO_ROOT));
    assert.ok(!isStoreSelfInstall(os.tmpdir(), TIED_REPO_ROOT));
  });
});
