/**
 * [REQ-CITDP_ORDERED_LIST_KEYS] [IMPL-CITDP_ORDERED_KEY_VALIDATE]
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import {
  transformCitdpOrderedListKeys,
  validateCitdpOrderedListKeys,
} from "./citdp-ordered-keys.js";

describe("validateCitdpOrderedListKeys", () => {
  it("accepts evidence.command_seq", () => {
    const r = validateCitdpOrderedListKeys({
      evidence: { command_seq: ["b", "a"] },
    });
    assert.equal(r.ok, true);
  });

  it("rejects evidence.commands", () => {
    const r = validateCitdpOrderedListKeys({
      evidence: { commands: ["x"] },
    });
    assert.equal(r.ok, false);
    assert.deepEqual(r.diagnostics, ["deprecated_citdp_key:evidence.commands"]);
  });

  it("rejects test_strategy.commands", () => {
    const r = validateCitdpOrderedListKeys({
      test_strategy: { commands: ["x"] },
    });
    assert.equal(r.ok, false);
    assert.deepEqual(r.diagnostics, ["deprecated_citdp_key:test_strategy.commands"]);
  });

  it("accepts test_strategy.verification_command_seq", () => {
    const r = validateCitdpOrderedListKeys({
      test_strategy: { verification_command_seq: ["a"] },
    });
    assert.equal(r.ok, true);
  });

  it("rejects test_strategy.verification_commands", () => {
    const r = validateCitdpOrderedListKeys({
      test_strategy: { verification_commands: ["a"] },
    });
    assert.equal(r.ok, false);
    assert.deepEqual(r.diagnostics, ["deprecated_citdp_key:test_strategy.verification_commands"]);
  });
});

describe("transformCitdpOrderedListKeys", () => {
  it("renames evidence.commands to command_seq", () => {
    const out = transformCitdpOrderedListKeys({
      evidence: { commands: ["a", "b"], proof_boundaries: ["x"] },
    });
    assert.deepEqual(out.evidence, {
      command_seq: ["a", "b"],
      proof_boundaries: ["x"],
    });
  });

  it("is idempotent", () => {
    const once = transformCitdpOrderedListKeys({
      evidence: { commands: ["a"] },
      test_strategy: { verification_commands: ["v"] },
    });
    const twice = transformCitdpOrderedListKeys(once);
    assert.deepEqual(twice, once);
  });
});
