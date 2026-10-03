/**
 * [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] Wave 7 gate helper regression tests.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  RUN_IDS,
  resolveWave7GatePhase,
  runIdForPhase,
} from "./run-wave7-gates-lib.mjs";

describe("run-wave7-gates-lib [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]", () => {
  it("defaults to pre_implementation", () => {
    assert.equal(resolveWave7GatePhase([]), "pre_implementation");
    assert.equal(runIdForPhase("pre_implementation"), RUN_IDS.pre_implementation);
  });

  it("maps --verification to wave5 verification run_id", () => {
    assert.equal(resolveWave7GatePhase(["--verification"]), "verification");
    assert.equal(runIdForPhase("verification"), "wave5-verify-20260910");
  });

  it("maps --close-out to wave7 close_out run_id", () => {
    assert.equal(resolveWave7GatePhase(["--close-out"]), "close_out");
    assert.equal(runIdForPhase("close_out"), "wave7-closeout-20260911");
  });

  it("prefers --close-out over --verification", () => {
    assert.equal(resolveWave7GatePhase(["--verification", "--close-out"]), "close_out");
  });
});
