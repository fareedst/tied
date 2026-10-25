import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { extractSponsorQuestions } from "./sponsor-questions.js";

// [IMPL-TIED_SPONSOR_QUESTIONS] [ARCH-TIED_SPONSOR_QUESTIONS_BOUNDARY] [REQ-TIED_SPONSOR_QUESTIONS] — How: costly-choice and hinge extraction unit tests.
describe("extractSponsorQuestions [REQ-TIED_SPONSOR_QUESTIONS]", () => {
  it("emits costly decision when rung >= 3", () => {
    const result = extractSponsorQuestions({
      project_root: process.cwd(),
      pending_decisions: [
        { description: "Ship breaking API change", affects_clients: true },
      ],
    });
    assert.ok(result.questions.some((q) => q.kind === "costly_decision" && q.rung === 4));
  });

  it("includes lane metadata for CITDP backlog hints [REQ-TIED_SPONSOR_TWO_LANE_DELIVERY] T-TLD-02", () => {
    const result = extractSponsorQuestions({
      project_root: process.cwd(),
      citdp: {
        change_definition: {
          sponsor_selection_backlog: [
            {
              decision_id: "sel-1",
              phase: "verification",
              lane: "selection",
              default_or_option: "Option A",
              consequence_rung: 3,
              disposition: "pending",
              selection_evidence: [{ kind: "test_id", path: "T-TLD-04" }],
            },
          ],
        },
      },
      phase: "verification",
    });
    assert.ok(result.questions.some((q) => q.lane === "selection" && q.phase === "verification"));
  });

  it("reports hinge diagnostics for incomplete CITDP", () => {
    const result = extractSponsorQuestions({
      project_root: process.cwd(),
      citdp: {
        "CITDP-TEST": {
          completion_criteria: { strict_approval: { reviewer: "~" } },
        },
      },
    });
    assert.ok(result.hinge_diagnostics.length > 0 || result.questions.some((q) => q.kind === "hinge_gap"));
  });
});
