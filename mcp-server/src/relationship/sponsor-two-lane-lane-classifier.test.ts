// [IMPL-TIED_SPONSOR_TWO_LANE_DELIVERY] [ARCH-TIED_SPONSOR_TWO_LANE_DELIVERY] [REQ-TIED_SPONSOR_TWO_LANE_DELIVERY] — How: T-TLD-01, T-TLD-03, T-TLD-07 unit tests.
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  auditMidLaneSponsorDeferral,
  batchCharterCostlyChoices,
  classifySponsorDecisionLane,
  validateSelectionEvidence,
} from "./sponsor-decision-lane.js";

describe("classifySponsorDecisionLane [REQ-TIED_SPONSOR_TWO_LANE_DELIVERY] T-TLD-01", () => {
  it("returns charter for scope-fix without product evidence", () => {
    assert.equal(
      classifySponsorDecisionLane({ description: "Lock REQ scope for two-lane delivery" }),
      "charter",
    );
  });

  it("returns selection when requires_product_evidence", () => {
    assert.equal(
      classifySponsorDecisionLane({
        description: "Pick deployed UI variant",
        requires_product_evidence: true,
      }),
      "selection",
    );
  });

  it("returns mid_lane_defer when reversible default documented", () => {
    assert.equal(
      classifySponsorDecisionLane({
        description: "Use default glossary filename",
        reversible_default_documented: true,
        reversibility_evidence: "documented in PLAN",
      }),
      "mid_lane_defer",
    );
  });
});

describe("validateSelectionEvidence [REQ-TIED_SPONSOR_TWO_LANE_DELIVERY] T-TLD-03", () => {
  it("warn diagnostic when selection_evidence missing", () => {
    const result = validateSelectionEvidence({ default_or_option: "option-a" });
    assert.equal(result.ok, false);
    assert.ok(result.diagnostics.includes("selection_evidence_missing"));
  });

  it("ok when selection_evidence present", () => {
    const result = validateSelectionEvidence({
      selection_evidence: [{ kind: "test_id", path: "T-TLD-04" }],
    });
    assert.equal(result.ok, true);
  });
});

describe("auditMidLaneSponsorDeferral [REQ-TIED_SPONSOR_TWO_LANE_DELIVERY] T-TLD-07", () => {
  it("emits warn-only mid_lane diagnostic under advisory when backlog present", () => {
    const citdp = {
      change_definition: {
        sponsor_charter_backlog: [
          {
            decision_id: "d1",
            phase: "pre_implementation",
            lane: "charter",
            default_or_option: "default",
            consequence_rung: 2,
            disposition: "deferred",
          },
        ],
      },
    };
    const diagnostics = auditMidLaneSponsorDeferral(citdp, "advisory");
    assert.ok(diagnostics.some((d) => d.startsWith("mid_lane_sponsor_deferral:")));
  });
});

describe("batchCharterCostlyChoices [REQ-TIED_SPONSOR_TWO_LANE_DELIVERY]", () => {
  it("includes costly pending decisions in charter backlog", () => {
    const rows = batchCharterCostlyChoices({}, [
      { description: "Rename REQ token", affects_status: true },
    ]);
    assert.ok(rows.some((r) => r.lane === "charter" && r.consequence_rung >= 3));
  });
});
