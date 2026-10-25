/**
 * [IMPL-TIED_CLIENT_FEEDBACK_CAPTURE] [ARCH-TIED_CLIENT_FEEDBACK_CAPTURE] [REQ-TIED_CLIENT_FEEDBACK_CAPTURE]
 * How: contract tests lock SC-CAPTURE-RECEIPT and SC-NO-NARRATIVE-POST prose in canonical store paths.
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const repoRoot = path.resolve(import.meta.dirname, "../../..");
const promptShared = path.join(repoRoot, "tools/bundled-prompt-type-skills/prompt-shared");
const feedbackSkill = path.join(repoRoot, "tools/bundled-feedback-skill/SKILL.md");
const gfTrialSkill = path.join(repoRoot, "tools/bundled-record-gf-trial-skill/SKILL.md");
const gfTrialRef = path.join(repoRoot, "tools/bundled-record-gf-trial-skill/reference.md");

describe("client feedback capture contracts [REQ-TIED_CLIENT_FEEDBACK_CAPTURE]", () => {
  it("traceable-commit-close-out documents upstream feedback capture outcome [SC-CAPTURE-RECEIPT]", () => {
    const text = fs.readFileSync(path.join(promptShared, "traceable-commit-close-out.md"), "utf8");
    assert.match(text, /Upstream feedback capture outcome/i);
    assert.match(text, /receipt.*\bid\b/is);
    assert.match(text, /N\/A/i);
  });

  it("completion-signals-handoff notes capture outcome is not implied by machine close_out alone", () => {
    const text = fs.readFileSync(path.join(promptShared, "completion-signals-handoff.md"), "utf8");
    assert.match(text, /Upstream feedback capture/i);
    assert.match(text, /machine close-out/i);
  });

  it("bundled feedback skill forbids narrative upstream post without receipt in client sessions [SC-NO-NARRATIVE-POST]", () => {
    const text = fs.readFileSync(feedbackSkill, "utf8");
    assert.match(text, /must not assert.*upstream.*without.*receipt/is);
    assert.match(text, /\/feedback/);
  });

  it("tied-close-out-process cross-links narrative-post prohibition", () => {
    const text = fs.readFileSync(path.join(promptShared, "tied-close-out-process.md"), "utf8");
    assert.match(text, /upstream feedback capture/i);
    assert.match(text, /receipt/i);
  });

  it("record-gf-trial documents client-originated vs proxy vs skip ingest [SC-GF-INGEST]", () => {
    const skill = fs.readFileSync(gfTrialSkill, "utf8");
    const ref = fs.readFileSync(gfTrialRef, "utf8");
    assert.match(skill, /skip-feedback-ingest/i);
    assert.match(ref, /client-originated/i);
    assert.match(ref, /proxy/i);
    assert.match(ref, /fb-mvnyr5n2-aaeg1j/);
  });
});
