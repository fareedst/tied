import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { analyzeBindingEvidence } from "./binding-analysis.js";

describe("ANALYZE_BINDING_EVIDENCE REQ-TIED_FIDELITY_RESEARCH", () => {
  // [IMPL-TIED_FIDELITY_RESEARCH] [ARCH-TIED_FIDELITY_RESEARCH] [REQ-TIED_FIDELITY_RESEARCH]
  // Separates binding/composition behavior from isolated unit behavior.
  it("accepts UI-free evidence when every binding field is observed", () => {
    const result = analyzeBindingEvidence({
      binding: {
        trigger: "finding observed",
        channel: "research-ledger",
        callee: "appendCandidateFinding",
        arguments: "candidate finding",
        effect: "append observation",
        ordering: "after snapshot",
        failureBehavior: "return duplicate link",
      },
      evidence: {
        triggerFired: true,
        channelUsed: true,
        calleeCalled: true,
        argumentsValid: true,
        effectObserved: true,
        orderingCorrect: true,
        failureCovered: true,
        uiFree: true,
      },
    });

    assert.deepEqual(result, {
      kind: "composition-evidence",
      proofBoundary: "UI-free binding evidence only; not unit behavior proof.",
    });
  });

  it("reports a binding finding when UI-free evidence is absent", () => {
    const result = analyzeBindingEvidence({
      binding: {
        trigger: "finding observed",
        channel: "research-ledger",
        callee: "appendCandidateFinding",
        arguments: "candidate finding",
        effect: "append observation",
        ordering: "after snapshot",
        failureBehavior: "return duplicate link",
      },
      evidence: {
        triggerFired: true,
        channelUsed: true,
        calleeCalled: true,
        argumentsValid: true,
        effectObserved: true,
        orderingCorrect: true,
        failureCovered: false,
        uiFree: false,
      },
    });

    assert.equal(result.kind, "binding-finding");
  });
});
