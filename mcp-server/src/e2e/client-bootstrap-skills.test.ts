import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { installClaudeSkills } from "../../../tools/bootstrap/lib/skills.mjs";
import { installStandaloneSkillsCopy } from "../../../tools/bootstrap/lib/client-skills-catalog.mjs";
import { manifestPaths } from "../../../tools/bootstrap/lib/constants.mjs";
import { claudeManagedInventoryComplete } from "../../../tools/bootstrap/lib/assert-windows-bootstrap-claude.mjs";

const repoRoot = path.resolve(import.meta.dirname, "../../..");

// [IMPL-TIED_CLIENT_BOOTSTRAP_SKILLS] [REQ-TIED_CLIENT_BOOTSTRAP_SKILLS]
describe("client bootstrap standalone skills [REQ-TIED_CLIENT_BOOTSTRAP_SKILLS]", () => {
  it("installStandaloneSkillsCopy installs xlate and unblock under Cursor skills dir", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "cbs-cursor-"));
    const skillsDir = path.join(tmp, ".cursor", "skills");
    installStandaloneSkillsCopy(repoRoot, skillsDir);
    const xlate = fs.readFileSync(path.join(skillsDir, "xlate", "SKILL.md"), "utf8");
    const unblock = fs.readFileSync(path.join(skillsDir, "unblock", "SKILL.md"), "utf8");
    assert.match(xlate, /\/xlate/);
    assert.match(unblock, /\/unblock/);
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it("installClaudeSkills includes standalone skills under Claude skills dir", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "cbs-claude-"));
    const paths = manifestPaths();
    paths.tiedRepoRoot = repoRoot;
    const skillsDir = path.join(tmp, ".claude", "skills");
    installClaudeSkills(tmp, paths, {
      skillsInstallDir: skillsDir,
      windows_copy_proven_in_ci: true,
    });
    assert.ok(fs.existsSync(path.join(skillsDir, "unblock", "SKILL.md")));
    assert.ok(fs.existsSync(path.join(skillsDir, "xlate", "SKILL.md")));
    assert.ok(claudeManagedInventoryComplete(tmp, skillsDir));
    fs.rmSync(tmp, { recursive: true, force: true });
  });
});
