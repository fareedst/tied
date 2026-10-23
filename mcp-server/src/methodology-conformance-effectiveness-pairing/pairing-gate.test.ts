import assert from "node:assert/strict";
import { before, describe, it } from "node:test";
import path from "node:path";

import { validateChecklistGate } from "../checklist-validator.js";
import {
  ensureMethodologyPairingDemoGateReceipt,
  METHODOLOGY_PAIRING_DEMO_GATE_RECEIPT_PATH,
} from "./pairing-demo-fixture.js";

const projectRoot = path.resolve(import.meta.dirname, "../../../");
const tiedBase = path.join(projectRoot, "tied-project");

before(() => {
  ensureMethodologyPairingDemoGateReceipt(projectRoot);
});

// [REQ-METHODOLOGY-CONFORMANCE-EFFECTIVENESS-PAIRING] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
describe("methodology surface pairing gate", () => {
  it("blocks close_out on conformance_only_trap when CITDP declares experiment link", () => {
    const result = validateChecklistGate({
      phase: "close_out",
      tracker: { steps: [{ slug: "traceable-commit", disposition: "completed" }] },
      citdp: {
        risk_analysis: {
          adversarial_inquiry: {
            depth_tier: "minimal",
            counterexamples: ["trap passes close_out"],
            falsification_questions: ["Does pairing block trap?"],
            disconfirming_observations: ["gate rejects trap"],
            evidence_references: ["pairing-gate.test.ts"],
          },
        },
        methodology_surface_experiment_link: {
          experiment_id: "mle-trap-fixture-nonexistent",
          conformance_evidence_refs: [
            { kind: "gate_receipt", path: "working/REQ/evidence/pre_implementation-gate-result.json" },
          ],
        },
      },
      evidence: { methodologyPairingBasePath: tiedBase },
    });
    assert.equal(result.allowed, false);
    assert.ok(result.diagnostics.some((d) => d.startsWith("methodology_pairing_blocked")));
  });

  it("allows close_out for paired demo experiment with conformance refs", () => {
    const result = validateChecklistGate({
      phase: "close_out",
      tracker: { steps: [{ slug: "traceable-commit", disposition: "completed" }] },
      citdp: {
        risk_analysis: {
          adversarial_inquiry: {
            depth_tier: "minimal",
            counterexamples: ["paired demo blocked incorrectly"],
            falsification_questions: ["Does inconclusive pair?"],
            disconfirming_observations: ["inconclusive pairs"],
            evidence_references: ["pairing-gate.test.ts"],
          },
        },
        methodology_surface_experiment_link: {
          experiment_id: "mle-demo-20261010-001",
          conformance_evidence_refs: [
            {
              kind: "gate_receipt",
              path: METHODOLOGY_PAIRING_DEMO_GATE_RECEIPT_PATH,
            },
          ],
        },
      },
      evidence: { methodologyPairingBasePath: tiedBase },
    });
    const pairingBlocked = result.diagnostics.filter((d) => d.startsWith("methodology_pairing_blocked"));
    assert.equal(pairingBlocked.length, 0);
  });
});
