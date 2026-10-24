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

const SPONSOR_CONTRACT =
  "i am the sponsor and i witnessed this call from a TIED client that received an error response. treat this report as feedback to the TIED system that must be treated as a trigger for self-improvement by quality-maturity measures. existing TIED processes will ingest this reported event and continue on their initiative.";

// [IMPL-TIED_FEEDBACK_REPORT_SKILL] [ARCH-TIED_FEEDBACK_REPORT_SKILL_BOUNDARY] [REQ-TIED_FEEDBACK_REPORT_SKILL] — How: bootstrap installs bundled feedback skill.
describe("feedback skill install [REQ-TIED_FEEDBACK_REPORT_SKILL]", () => {
  it("loadStandaloneClientSkills includes feedback", () => {
    const entries = loadStandaloneClientSkills(repoRoot);
    const names = entries.map((e) => e.skillName).sort();
    assert.deepEqual(names, ["clear-workspace", "feedback", "handoff", "unblock", "xlate"]);
  });

  it("installStandaloneSkillsCopy places feedback SKILL.md with contract and capture tool", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "feedback-skill-"));
    const skillsDir = path.join(tmp, ".cursor", "skills");
    installStandaloneSkillsCopy(repoRoot, skillsDir);
    const skillPath = path.join(skillsDir, "feedback", "SKILL.md");
    assert.ok(fs.existsSync(skillPath));
    const text = fs.readFileSync(skillPath, "utf8");
    assert.match(text, /\/feedback/);
    assert.match(text, /tied_feedback_capture_observation/);
    assert.match(text, /tied_config_get_base_path/);
    assert.match(text, /receipt/i);
    assert.match(text, /receipt.*notification/i);
    assert.match(text, new RegExp(SPONSOR_CONTRACT.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.match(text, /Intake gate/i);
    const bundled = fs.readFileSync(
      path.join(repoRoot, "tools/bundled-feedback-skill/SKILL.md"),
      "utf8",
    );
    assert.match(bundled, /name: feedback/);
    fs.rmSync(tmp, { recursive: true, force: true });
  });
});
