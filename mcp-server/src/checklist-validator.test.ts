import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  validateActivationPairing,
  validateChecklistGate,
  validateTracker,
  stableHash,
  type ActivationExpectedIdentity,
} from "./checklist-validator.js";

// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: validate disposition contracts and reject generic skips.
describe("VALIDATE_TRACKER REQ-TIED_CHECKLIST_GATE_ENFORCEMENT", () => {
  it("blocks pending steps and generic skip dispositions", () => {
    const pending = validateTracker({
      tracker: { steps: [{ slug: "risk-assessment", status: "pending" }] },
      phase: "pre_implementation",
    });
    assert.equal(pending.ok, false);
    assert.ok(pending.diagnostics.includes("pending_required_step:risk-assessment"));

    const skipped = validateTracker({
      tracker: { steps: [{ slug: "risk-assessment", disposition: "skipped" }] },
      phase: "pre_implementation",
    });
    assert.equal(skipped.ok, false);
    assert.ok(skipped.diagnostics.includes("invalid_disposition:risk-assessment"));
  });

  it("requires every explicitly governed step to be present", () => {
    const result = validateTracker({
      tracker: { steps: [{ slug: "change-definition", disposition: "completed", evidence_refs: ["citdp"] }] },
      requiredStepSlugs: ["change-definition", "risk-assessment"],
      phase: "pre_implementation",
    });
    assert.equal(result.ok, false);
    assert.ok(result.diagnostics.includes("missing_required_step:risk-assessment"));
  });

  it("requires evidence, rationale, and waiver ownership by disposition", () => {
    assert.equal(validateTracker({
      tracker: { steps: [{ slug: "done", disposition: "completed" }] },
      phase: "verification",
    }).ok, false);
    assert.equal(validateTracker({
      tracker: {
        steps: [{
          slug: "na",
          disposition: "not_applicable",
          policy: "no-ui-scope",
          rationale: "Policy excludes UI.",
        }],
      },
      phase: "verification",
    }).ok, true);
    assert.equal(validateTracker({
      tracker: {
        steps: [{
          slug: "waived",
          disposition: "waived",
          rationale: "Deferred to next release.",
          owner: "team",
          expiry: "2099-01-01",
          approval: "approval-1",
          residual_risk: "Known gap.",
        }],
      },
      phase: "verification",
    }).ok, true);
  });
});

// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: enforce depth-specific adversarial obligations before progression.
describe("VALIDATE_ADVERSARIAL_CONTRACT REQ-TIED_CHECKLIST_GATE_ENFORCEMENT", () => {
  it("requires the complete minimal evidence set", () => {
    const result = validateChecklistGate({
      phase: "pre_implementation",
      tracker: {
        steps: [{
          slug: "change-definition",
          disposition: "completed",
          evidence_refs: ["citdp"],
        }],
      },
      citdp: {
        risk_analysis: {
          adversarial_inquiry: {
            depth_tier: "minimal",
            counterexamples: ["empty input"],
            falsification_questions: ["Can an empty input pass?"],
            disconfirming_observations: ["test rejects empty input"],
            evidence_references: ["test-1"],
          },
        },
      },
    });
    assert.equal(result.allowed, true);
    assert.equal(result.depth, "minimal");
  });
});

// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: pair inquiry receipt with four bounded artifacts.
describe("VALIDATE_ACTIVATION_PAIRING REQ-TIED_CHECKLIST_GATE_ENFORCEMENT", () => {
  it("rejects stale identities and accepts a complete matching pair", () => {
    const base: ActivationExpectedIdentity = {
      request_token: "REQ-EXAMPLE",
      project_id: "project-1",
      run_id: "run-1",
      phase: "verification",
      scope: ["block-1"],
      scope_hash: stableHash(["block-1"]),
    };
    const artifacts = Object.fromEntries([
      "obligation-report.json",
      "finding-ledger.jsonl",
      "gate-result.json",
      "evidence-provenance.json",
    ].map((name) => [name, {
      valid: true,
      request_token: base.request_token,
      project_id: base.project_id,
      run_id: base.run_id,
      phase: base.phase,
      scope_hash: base.scope_hash,
      hash: `${name}-hash`,
    }]));
    const receipt = {
      ...base,
      success: true,
      tool: "tied_adversarial_inquiry_run",
      artifact_hashes: Object.fromEntries(
        Object.entries(artifacts).map(([name, artifact]) => [name, (artifact as { hash: string }).hash]),
      ),
    };
    const accepted = validateActivationPairing({ receipt, artifacts, expected: base });
    assert.equal(accepted.ok, true);

    const stale = validateActivationPairing({
      receipt: { ...receipt, project_id: "other-project" },
      artifacts,
      expected: base,
    });
    assert.equal(stale.ok, false);
    assert.ok(stale.diagnostics.includes("receipt_identity_mismatch:project_id"));

    const staleScope = validateActivationPairing({
      receipt: { ...receipt, scope: ["different-block"] },
      artifacts,
      expected: base,
    });
    assert.equal(staleScope.ok, false);
    assert.ok(staleScope.diagnostics.includes("receipt_scope_hash_mismatch"));
  });
});
