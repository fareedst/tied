/**
 * [REQ-TIED_DURABLE_CHECKLIST_CONTROLLER] [REQ-TIED_INTENT_CONTROL_PLANE] Wave 4 — resume from tracker.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  deriveChecklistResumePlan,
  parseSessionIdFromStateHistory,
  type ChecklistResumeTurn,
} from "./checklist-controller-resume.js";

function turn(stub: string): ChecklistResumeTurn {
  return { stepStub: stub, chainFromPrevious: stub !== "" };
}

describe("checklist-controller-resume [REQ-TIED_DURABLE_CHECKLIST_CONTROLLER]", () => {
  it("derives first_turn at first pending stubbed step", () => {
    const turns = [turn("session-bootstrap"), turn("unit-test-red"), turn("unit-test-green")];
    const plan = deriveChecklistResumePlan({
      turns,
      stepDispositions: new Map([
        ["session-bootstrap", "completed"],
        ["unit-test-red", "pending"],
        ["unit-test-green", "pending"],
      ]),
    });
    assert.deepEqual(plan, {
      ok: true,
      first_turn: 2,
      next_step_slug: "unit-test-red",
      skipped_completed_count: 1,
    });
  });

  it("skips waived and not_applicable steps", () => {
    const turns = [turn("a"), turn("b"), turn("c")];
    const plan = deriveChecklistResumePlan({
      turns,
      stepDispositions: new Map([
        ["a", "completed"],
        ["b", "not_applicable"],
        ["c", "pending"],
      ]),
    });
    assert.equal(plan.ok, true);
    if (plan.ok) {
      assert.equal(plan.first_turn, 3);
      assert.equal(plan.next_step_slug, "c");
    }
  });

  it("fails closed when all stubbed steps are terminal", () => {
    const turns = [turn("a"), turn("b")];
    const plan = deriveChecklistResumePlan({
      turns,
      stepDispositions: new Map([
        ["a", "completed"],
        ["b", "waived"],
      ]),
    });
    assert.deepEqual(plan, { ok: false, error: "all_steps_terminal" });
  });

  it("fails when a turn stub is missing from tracker inventory", () => {
    const plan = deriveChecklistResumePlan({
      turns: [turn("missing-slug")],
      stepDispositions: new Map([["other", "pending"]]),
    });
    assert.deepEqual(plan, { ok: false, error: "stub_not_in_tracker", slug: "missing-slug" });
  });

  it("parses session id from latest state_history turn_identity", () => {
    const session = parseSessionIdFromStateHistory([
      { turn_identity: "turn=1:stub=a:session=sess-old", receipt_hash: "h1" },
      { turn_identity: "turn=5:stub=b:session=sess-new", receipt_hash: "h2" },
    ]);
    assert.equal(session, "sess-new");
  });
});
