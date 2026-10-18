/**
 * [REQ-TIED_CONTEXT_ADAPTIVE_ENGINEERING] [IMPL-TIED_CONTEXT_ADAPTIVE_REASSESS]
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { loadPracticeLibraryV1 } from "./contracts.js";
import { FIXTURE_PRACTICES } from "./fixtures.js";
import { validateContextProfileV1 } from "./profile.js";
import { reassessContextV1 } from "./reassess.js";
import { selectPracticesDeterministicV1 } from "./selector.js";
import { CONTEXT_PROFILE_SCHEMA } from "./constants.js";

describe("context-adaptive reassess [IMPL-TIED_CONTEXT_ADAPTIVE_REASSESS]", () => {
  it("unchanged when dimensions match", () => {
    const library = loadPracticeLibraryV1(FIXTURE_PRACTICES);
    const profile = validateContextProfileV1({
      schema_version: CONTEXT_PROFILE_SCHEMA,
      dimensions: { criticality: "HIGH" },
    }).profile!;
    const receipt = selectPracticesDeterministicV1({ library: library.library!, profile });
    const result = reassessContextV1({
      prior_profile: profile,
      prior_receipt: receipt,
      revised_profile: profile,
    });
    assert.equal(result.action, "unchanged");
  });

  it("loop_back when risk increases", () => {
    const library = loadPracticeLibraryV1(FIXTURE_PRACTICES);
    const prior = validateContextProfileV1({
      schema_version: CONTEXT_PROFILE_SCHEMA,
      dimensions: { criticality: "LOW" },
    }).profile!;
    const revised = validateContextProfileV1({
      schema_version: CONTEXT_PROFILE_SCHEMA,
      dimensions: { criticality: "HIGH" },
    }).profile!;
    const receipt = selectPracticesDeterministicV1({ library: library.library!, profile: prior });
    const result = reassessContextV1({ prior_profile: prior, prior_receipt: receipt, revised_profile: revised });
    assert.equal(result.action, "loop_back");
  });
});
