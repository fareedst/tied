import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isValidWorkingRequestToken } from "./working-request-token.js";

describe("isValidWorkingRequestToken [REQ-REQUEST_EVIDENCE_ENVELOPE]", () => {
  it("accepts REQ-* product tokens", () => {
    assert.equal(isValidWorkingRequestToken("REQ-FEAT_TASK_EXECUTION_RECOVERY"), true);
  });

  it("accepts PLAN-* analysis working-folder tokens", () => {
    assert.equal(isValidWorkingRequestToken("PLAN-TIED-RESIDUALITY-ANALYSIS"), true);
  });

  it("rejects invalid prefixes", () => {
    assert.equal(isValidWorkingRequestToken("CITDP-FOO"), false);
    assert.equal(isValidWorkingRequestToken("REQ"), false);
  });
});
