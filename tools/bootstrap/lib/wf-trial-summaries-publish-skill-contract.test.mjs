/**
 * [REQ-WF_TRIAL_SUMMARIES_PUBLISH] SC-WF-PSP-01..02
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import { TIED_REPO_ROOT } from "./constants.mjs";
import { loadStoreFacilitatorSkills } from "./store-facilitator-skills.mjs";

const SKILL_DIR = path.join(
  TIED_REPO_ROOT,
  "tools/bundled-publish-wf-trial-summaries-skill",
);

describe("publish-wf-trial-summaries skill contract", () => {
  it("SC-WF-PSP-01 manifest lists publish-wf-trial-summaries", () => {
    const entries = loadStoreFacilitatorSkills(TIED_REPO_ROOT);
    const hit = entries.find((e) => e.skillName === "publish-wf-trial-summaries");
    assert.ok(hit);
    assert.match(hit.storeDirRel, /bundled-publish-wf-trial-summaries-skill/);
  });

  it("SC-WF-PSP-02 reference documents no required inputs and publish artifacts", () => {
    const skill = fs.readFileSync(path.join(SKILL_DIR, "SKILL.md"), "utf8");
    const ref = fs.readFileSync(path.join(SKILL_DIR, "reference.md"), "utf8");
    assert.match(skill, /no positional remainder required/i);
    assert.match(ref, /traditional-workflow-trial-runs-registry/);
    assert.match(ref, /comparison-table/);
    assert.match(ref, /wf-trial-summaries-publish\.mjs/);
  });
});
