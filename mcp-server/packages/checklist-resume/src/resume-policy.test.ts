/**
 * [REQ-TIED_DURABLE_CHECKLIST_CONTROLLER] resume_from_tracker config policy
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { resolveResumeFromTrackerPolicy } from "./resume-policy.js";

describe("resume-policy [REQ-TIED_DURABLE_CHECKLIST_CONTROLLER]", () => {
  it("defaults to cli_only when checklist section absent", () => {
    assert.equal(resolveResumeFromTrackerPolicy({}), "cli_only");
    assert.equal(resolveResumeFromTrackerPolicy(undefined), "cli_only");
  });

  it("maps true and false explicitly", () => {
    assert.equal(
      resolveResumeFromTrackerPolicy({ checklist: { resume_from_tracker: true } }),
      "auto",
    );
    assert.equal(
      resolveResumeFromTrackerPolicy({ checklist: { resume_from_tracker: false } }),
      "disabled",
    );
  });
});
