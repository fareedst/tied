/**
 * [REQ-TIED_CONTEXT_ADAPTIVE_ENGINEERING] [IMPL-TIED_CONTEXT_ADAPTIVE_PROFILE]
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { applicabilityMatches, validateContextProfileV1 } from "./profile.js";
import { CONTEXT_PROFILE_SCHEMA } from "./constants.js";

describe("context-adaptive profile [IMPL-TIED_CONTEXT_ADAPTIVE_PROFILE]", () => {
  it("UNKNOWN does not match LOW-only applicability", () => {
    assert.equal(applicabilityMatches(["LOW"], "UNKNOWN"), false);
  });

  it("UNKNOWN matches when UNKNOWN allowed", () => {
    assert.equal(applicabilityMatches(["UNKNOWN", "HIGH"], "UNKNOWN"), true);
  });

  it("validates context-profile.v1", () => {
    const result = validateContextProfileV1({
      schema_version: CONTEXT_PROFILE_SCHEMA,
      dimensions: { criticality: "UNKNOWN", security: "HIGH" },
    });
    assert.equal(result.ok, true);
  });

  it("rejects unsupported dimension", () => {
    const result = validateContextProfileV1({
      schema_version: CONTEXT_PROFILE_SCHEMA,
      dimensions: { not_a_dimension: "LOW" },
    });
    assert.equal(result.ok, false);
  });
});
