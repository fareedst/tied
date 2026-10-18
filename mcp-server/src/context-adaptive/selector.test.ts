/**
 * [REQ-TIED_CONTEXT_ADAPTIVE_ENGINEERING] [IMPL-TIED_CONTEXT_ADAPTIVE_SELECTOR]
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { loadPracticeLibraryV1 } from "./contracts.js";
import { FIXTURE_PRACTICES } from "./fixtures.js";
import { validateContextProfileV1 } from "./profile.js";
import { selectPracticesDeterministicV1, selectionReceiptHash } from "./selector.js";
import { CONTEXT_PROFILE_SCHEMA } from "./constants.js";

describe("context-adaptive selector [IMPL-TIED_CONTEXT_ADAPTIVE_SELECTOR]", () => {
  const library = loadPracticeLibraryV1(FIXTURE_PRACTICES);
  assert.equal(library.ok, true);

  it("produces stable receipt hash for identical inputs", () => {
    const profile = validateContextProfileV1({
      schema_version: CONTEXT_PROFILE_SCHEMA,
      dimensions: { criticality: "UNKNOWN" },
    }).profile!;
    const a = selectPracticesDeterministicV1({ library: library.library!, profile });
    const b = selectPracticesDeterministicV1({ library: library.library!, profile });
    assert.equal(selectionReceiptHash(a), selectionReceiptHash(b));
  });

  it("selects inquiry path for UNKNOWN criticality without LOW-only practice", () => {
    const profile = validateContextProfileV1({
      schema_version: CONTEXT_PROFILE_SCHEMA,
      dimensions: { criticality: "UNKNOWN" },
    }).profile!;
    const receipt = selectPracticesDeterministicV1({ library: library.library!, profile });
    assert.ok(receipt.selected_practice_ids.includes("PRACTICE-STRICT-TDD"));
    assert.ok(receipt.selected_practice_ids.includes("PRACTICE-INTEGRATED-INQUIRY"));
    assert.ok(!receipt.selected_practice_ids.includes("PRACTICE-LOW-ONLY"));
  });

  it("hard constraint rejects practice", () => {
    const profile = validateContextProfileV1({
      schema_version: CONTEXT_PROFILE_SCHEMA,
      dimensions: { criticality: "HIGH" },
    }).profile!;
    const receipt = selectPracticesDeterministicV1({
      library: library.library!,
      profile,
      hard_constraints: [{ id: "hc-1", reject_practice_ids: ["PRACTICE-STRICT-TDD"] }],
    });
    assert.ok(receipt.rejected_practice_ids.some((r) => r.id === "PRACTICE-STRICT-TDD"));
  });
});
