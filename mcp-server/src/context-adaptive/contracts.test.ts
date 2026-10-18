/**
 * [REQ-TIED_CONTEXT_ADAPTIVE_ENGINEERING] [IMPL-TIED_CONTEXT_ADAPTIVE_CONTRACTS]
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { loadPracticeLibraryV1, validatePracticeContractV1 } from "./contracts.js";
import { FIXTURE_PRACTICES } from "./fixtures.js";
import { PRACTICE_CONTRACT_SCHEMA } from "./constants.js";

describe("context-adaptive contracts [IMPL-TIED_CONTEXT_ADAPTIVE_CONTRACTS]", () => {
  it("accepts valid practice-contract.v1", () => {
    const result = validatePracticeContractV1(FIXTURE_PRACTICES[0]);
    assert.equal(result.ok, true);
  });

  it("rejects wrong schema_version", () => {
    const result = validatePracticeContractV1({ schema_version: "x", id: "P" });
    assert.equal(result.ok, false);
  });

  it("loads library with deterministic sort order", () => {
    const shuffled = [...FIXTURE_PRACTICES].reverse();
    const loaded = loadPracticeLibraryV1(shuffled);
    assert.equal(loaded.ok, true);
    assert.deepEqual(
      loaded.library?.contracts.map((c) => c.id),
      ["PRACTICE-INTEGRATED-INQUIRY", "PRACTICE-LOW-ONLY", "PRACTICE-STRICT-TDD"],
    );
  });

  it("rejects duplicate ids", () => {
    const dup = { ...FIXTURE_PRACTICES[0], id: "PRACTICE-STRICT-TDD" };
    const loaded = loadPracticeLibraryV1([dup, dup]);
    assert.equal(loaded.ok, false);
  });

  it("rejects missing prerequisite target", () => {
    const bad = {
      schema_version: PRACTICE_CONTRACT_SCHEMA,
      id: "PRACTICE-ORPHAN",
      name: "orphan",
      prerequisites: ["PRACTICE-MISSING"],
    };
    const loaded = loadPracticeLibraryV1([bad]);
    assert.equal(loaded.ok, false);
  });
});
