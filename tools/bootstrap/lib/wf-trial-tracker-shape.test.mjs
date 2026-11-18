import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import {
  isSlimTrackerShape,
  parseSessionIdFromText,
  parseSessionIdFromStdout,
} from "./wf-trial-tracker-shape.mjs";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const INCIDENT_STDERR_FIXTURE = path.join(
  REPO_ROOT,
  "tied-project/working/REQ-WF_TRIAL_INTERLEAVED_RESUME_CAPTURE/evidence/fixture-process-stderr-1794973656-excerpt.log",
);
const SLIM_TEMPLATE = path.join(
  REPO_ROOT,
  "tied-bundle/templates/wf-trial-minimal-checklist-tracker.yaml",
);
const LEGACY_FIXTURE = path.join(
  REPO_ROOT,
  "tied-project/working/REQ-WF_TRIAL_SLIM_TRACKER_INTER_TURN/evidence/fixture-legacy-tracker-1794971027.yaml",
);

describe("wf-trial-tracker-shape.mjs [REQ-WF_TRIAL_SLIM_TRACKER_INTER_TURN]", () => {
  it("legacy wrapper fixture is not slim [SC-WF-IST-02]", () => {
    const text = fs.readFileSync(LEGACY_FIXTURE, "utf8");
    assert.equal(isSlimTrackerShape(text), false);
  });

  it("slim template is slim [SC-WF-IST-02]", () => {
    const text = fs.readFileSync(SLIM_TEMPLATE, "utf8");
    assert.equal(isSlimTrackerShape(text), true);
  });

  it("parseSessionIdFromStdout [SC-WF-IST-01]", () => {
    const out = "turn 1/1\nsession_id=abc-uuid\n";
    assert.equal(parseSessionIdFromStdout(out), "abc-uuid");
    assert.equal(parseSessionIdFromStdout("no id\n"), "");
  });

  it("parseSessionIdFromText incident stderr fixture [SC-WF-IRC-02]", () => {
    const text = fs.readFileSync(INCIDENT_STDERR_FIXTURE, "utf8");
    assert.equal(parseSessionIdFromText(text), "28a60a53-d520-4b09-8bd0-3358224cb67b");
  });

  it("parseSessionIdFromText prefers first session_id line [SC-WF-IRC-02]", () => {
    const text = "session_id=first\nsession_id=second\n";
    assert.equal(parseSessionIdFromText(text), "first");
  });
});