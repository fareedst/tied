import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import {
  installStandaloneSkillsCopy,
  loadStandaloneClientSkills,
} from "../../../tools/bootstrap/lib/client-skills-catalog.mjs";

const repoRoot = path.resolve(import.meta.dirname, "../../..");

// [IMPL-TIED_WORKFLOW_VISUALIZATION_SKILL] [ARCH-TIED_WORKFLOW_VISUALIZATION_SKILL_BOUNDARY] [REQ-TIED_WORKFLOW_VISUALIZATION_SKILL]
describe("workflow-visualization skill install [REQ-TIED_WORKFLOW_VISUALIZATION_SKILL]", () => {
  it("loadStandaloneClientSkills includes workflow-visualization", () => {
    const entries = loadStandaloneClientSkills(repoRoot);
    const names = entries.map((e) => e.skillName).sort();
    assert.ok(names.includes("workflow-visualization"), names.join(","));
  });

  it("installStandaloneSkillsCopy places workflow-visualization SKILL.md with contract markers", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "wviz-skill-"));
    const skillsDir = path.join(tmp, ".cursor", "skills");
    installStandaloneSkillsCopy(repoRoot, skillsDir);
    const skillPath = path.join(skillsDir, "workflow-visualization", "SKILL.md");
    assert.ok(fs.existsSync(skillPath));
    const text = fs.readFileSync(skillPath, "utf8");
    assert.match(text, /\/workflow-visualization/);
    assert.match(text, /Verification gaps/i);
    assert.match(text, /workflow inventory/i);
    assert.match(text, /never invent services/i);
    assert.match(text, /no TIED/i);
    assert.match(text, /do not edit `src\//i);
    const refPath = path.join(repoRoot, "tools/bundled-workflow-visualization-skill/reference.md");
    const ref = fs.readFileSync(refPath, "utf8");
    assert.match(ref, /Visualization catalog/i);
    assert.match(ref, /Foundation \(A\)/i);
    assert.match(ref, /Integration \(D\)/i);
    assert.match(ref, /critical domain/i);
    const bundled = fs.readFileSync(
      path.join(repoRoot, "tools/bundled-workflow-visualization-skill/SKILL.md"),
      "utf8",
    );
    assert.match(bundled, /name: workflow-visualization/);
    assert.equal(bundled.match(/disable-model-invocation:\s*true/)?.length, 1);
    fs.rmSync(tmp, { recursive: true, force: true });
  });
});
