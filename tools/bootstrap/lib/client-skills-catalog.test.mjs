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
  loadStandaloneClientSkills,
  installStandaloneSkillsCopy,
  installStandaloneSkillsLinkedStub,
  assertStandaloneSkillsInventory,
} from "./client-skills-catalog.mjs";

describe("client-skills-catalog [REQ-TIED_CLIENT_BOOTSTRAP_SKILLS]", () => {
  it("loadStandaloneClientSkills returns xlate, unblock, handoff, clear-workspace", () => {
    const entries = loadStandaloneClientSkills(TIED_REPO_ROOT);
    assert.equal(entries.length, 4);
    const names = entries.map((e) => e.skillName).sort();
    assert.deepEqual(names, ["clear-workspace", "handoff", "unblock", "xlate"]);
  });

  it("installStandaloneSkillsCopy places SKILL.md files", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "standalone-copy-"));
    const skillsDir = path.join(tmp, ".cursor", "skills");
    installStandaloneSkillsCopy(TIED_REPO_ROOT, skillsDir);
    for (const name of ["xlate", "unblock", "handoff", "clear-workspace"]) {
      const skillPath = path.join(skillsDir, name, "SKILL.md");
      assert.ok(fs.existsSync(skillPath), name);
    }
    const handoff = fs.readFileSync(path.join(skillsDir, "handoff", "SKILL.md"), "utf8");
    assert.match(handoff, /\/handoff/);
    const clearWs = fs.readFileSync(path.join(skillsDir, "clear-workspace", "SKILL.md"), "utf8");
    assert.match(clearWs, /\/clear-workspace/);
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it("installStandaloneSkillsLinkedStub references store paths", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "standalone-stub-"));
    const skillsDir = path.join(tmp, ".claude", "skills");
    installStandaloneSkillsLinkedStub(TIED_REPO_ROOT, skillsDir);
    const unblock = fs.readFileSync(path.join(skillsDir, "unblock", "SKILL.md"), "utf8");
    assert.match(unblock, /bundled-unblock-skill/);
    assert.match(unblock, /name: unblock/);
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it("assertStandaloneSkillsInventory false when skill missing", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "standalone-inv-"));
    assert.equal(assertStandaloneSkillsInventory(tmp), false);
    fs.rmSync(tmp, { recursive: true, force: true });
  });
});
