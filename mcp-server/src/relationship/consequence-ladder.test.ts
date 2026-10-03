// [IMPL-TIED_SPONSOR_AGENT_RELATIONSHIP] [REQ-TIED_SPONSOR_AGENT_RELATIONSHIP]
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  classifyDecisionConsequence,
  routeSponsorTiedDisagreement,
} from "./consequence-ladder.js";

describe("CLASSIFY_DECISION_CONSEQUENCE [REQ-TIED_SPONSOR_AGENT_RELATIONSHIP]", () => {
  it("returns rung 1 for reversible documented defaults", () => {
    assert.equal(
      classifyDecisionConsequence({ description: "Use default glossary filename" }),
      1,
    );
  });

  it("returns rung 2 when reversibility evidence is recorded", () => {
    assert.equal(
      classifyDecisionConsequence({
        description: "Promote templates",
        reversibility_evidence: "tied-install.sh refresh",
      }),
      2,
    );
  });

  it("returns rung 4 when status or clients are affected", () => {
    assert.equal(
      classifyDecisionConsequence({ description: "Rename REQ token", affects_status: true }),
      4,
    );
  });
});

describe("ROUTE_SPONSOR_TIED_DISAGREEMENT [REQ-TIED_SPONSOR_AGENT_RELATIONSHIP]", () => {
  it("never returns a contradiction finding route", () => {
    const route = routeSponsorTiedDisagreement({
      sponsor_statement: "Change intent",
      conflicting_tokens: ["REQ-TIED_SETUP"],
      rung: 1,
    });
    assert.ok(route === "LEAP" || route === "SPONSOR_QUESTION");
    assert.notEqual(route, "CONTRADICTION_FINDING" as typeof route);
  });

  it("routes rung 3+ to sponsor question", () => {
    assert.equal(
      routeSponsorTiedDisagreement({
        sponsor_statement: "Disagree with IMPL",
        conflicting_tokens: ["IMPL-TIED_SETUP"],
        rung: 3,
      }),
      "SPONSOR_QUESTION",
    );
  });
});
