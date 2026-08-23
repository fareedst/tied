import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  derivePhaseAwareSlugs,
  validateActivationPairing,
  validateChecklistGate,
  validateDepthDowngrade,
  validateTracker,
  stableHash,
  type ActivationExpectedIdentity,
  type GatePhase,
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

function completedStep(slug: string, evidence = "evidence-1") {
  return { slug, disposition: "completed", evidence_refs: [evidence] };
}

function buildActivation(phase: GatePhase, runId: string) {
  const base: ActivationExpectedIdentity = {
    request_token: "REQ-TIED_CHECKLIST_GATE_ENFORCEMENT",
    project_id: "stdd-project",
    run_id: runId,
    phase,
    scope: ["IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT#DERIVE#block"],
    scope_hash: stableHash(["IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT#DERIVE#block"]),
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
    hash: `${name}-${runId}-hash`,
  }]));
  const receipt = {
    ...base,
    success: true,
    tool: "tied_adversarial_inquiry_run",
    scope: base.scope,
    artifact_hashes: Object.fromEntries(
      Object.entries(artifacts).map(([name, artifact]) => [name, (artifact as { hash: string }).hash]),
    ),
  };
  return { receipt, artifacts, expected: base };
}

function integratedTracker(phase: GatePhase) {
  const slugs = derivePhaseAwareSlugs("integrated", phase);
  return { steps: slugs.map((slug) => completedStep(slug, `working/REQ-TIED_CHECKLIST_GATE_ENFORCEMENT/adversarial-inquiry/${slug}`)) };
}

function integratedCitdp(overrides: Record<string, unknown> = {}) {
  return {
    risk_analysis: {
      adversarial_inquiry: {
        depth_tier: "integrated",
        gate_policy: "advisory",
        ...overrides,
      },
    },
    completion_criteria: {
      activation: {
        request_token: "REQ-TIED_CHECKLIST_GATE_ENFORCEMENT",
        project_id: "stdd-project",
        run_id: "verification-run-1",
        phase: "verification",
        scope_hash: stableHash(["IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT#DERIVE#block"]),
      },
    },
  };
}

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

// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: auto-enforce integrated depth slug sets, pairing, downgrade, and phase-bound receipts.
describe("VALIDATE_CHECKLIST_GATE Batch 2 Slice 1 [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]", () => {
  it("fails closed when integrated depth omits activation", () => {
    const result = validateChecklistGate({
      phase: "verification",
      tracker: integratedTracker("verification"),
      citdp: integratedCitdp(),
    });
    assert.equal(result.allowed, false);
    assert.ok(result.diagnostics.includes("integrated_depth_requires_pairing"));
  });

  it("requires auto sub-adversarial slug even when caller omits required_step_slugs", () => {
    const tracker = integratedTracker("verification").steps.filter(
      (step) => step.slug !== "sub-adversarial-inquiry-pass",
    );
    const result = validateChecklistGate({
      phase: "verification",
      tracker: { steps: tracker },
      citdp: integratedCitdp(),
      activation: buildActivation("verification", "verification-run-1"),
    });
    assert.equal(result.allowed, false);
    assert.ok(
      result.diagnostics.includes("missing_required_step:sub-adversarial-inquiry-pass")
      || result.diagnostics.includes("pending_required_step:sub-adversarial-inquiry-pass"),
    );
  });

  it("unions caller slugs with auto slugs and cannot subtract auto slugs", () => {
    const result = validateChecklistGate({
      phase: "pre_implementation",
      tracker: {
        steps: [
          completedStep("risk-assessment"),
          completedStep("gate-pseudocode-validation"),
        ],
      },
      citdp: integratedCitdp(),
      activation: buildActivation("pre_implementation", "pre-impl-run-1"),
      requiredStepSlugs: ["change-definition"],
    });
    assert.equal(result.allowed, false);
    assert.ok(result.diagnostics.includes("missing_required_step:sub-adversarial-inquiry-pass"));
  });

  it("passes integrated verification with VolumeStats-style fixture", () => {
    const activation = buildActivation("verification", "verification-run-1");
    const result = validateChecklistGate({
      phase: "verification",
      tracker: integratedTracker("verification"),
      citdp: integratedCitdp(),
      activation,
    });
    assert.equal(result.allowed, true);
    assert.equal(result.depth, "integrated");
  });

  it("rejects the same run_id when receipt phase differs from gate phase", () => {
    const activation = buildActivation("verification", "shared-run-1");
    const result = validateChecklistGate({
      phase: "close_out",
      tracker: integratedTracker("close_out"),
      citdp: integratedCitdp(),
      activation,
    });
    assert.equal(result.allowed, false);
    assert.ok(result.diagnostics.includes("receipt_identity_mismatch:phase"));
  });

  it("rejects verification receipt submitted as close_out activation even with citation", () => {
    const activation = buildActivation("verification", "verification-run-1");
    const result = validateChecklistGate({
      phase: "close_out",
      tracker: integratedTracker("close_out"),
      citdp: integratedCitdp({
        close_out_inquiry_waiver: null,
      }),
      activation,
    });
    assert.equal(result.allowed, false);
    assert.ok(result.diagnostics.includes("receipt_identity_mismatch:phase"));
  });

  it("requires depth-change waiver when downgrading from integrated to minimal", () => {
    const downgrade = validateDepthDowngrade({
      citdp: {
        risk_analysis: {
          adversarial_inquiry: {
            depth_tier: "minimal",
            prior_depth_tier: "integrated",
          },
        },
      },
    });
    assert.equal(downgrade.ok, false);
    assert.ok(downgrade.diagnostics.includes("depth_downgrade_requires_waiver"));

    const gate = validateChecklistGate({
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
            prior_depth_tier: "integrated",
            counterexamples: ["empty input"],
            falsification_questions: ["Can empty input pass?"],
            disconfirming_observations: ["test rejects empty input"],
            evidence_references: ["test-1"],
          },
        },
      },
    });
    assert.equal(gate.allowed, false);
    assert.ok(gate.diagnostics.includes("depth_downgrade_requires_waiver"));
  });

  it("skips downgrade diagnostic when prior_depth_tier is missing", () => {
    const gate = validateChecklistGate({
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
            falsification_questions: ["Can empty input pass?"],
            disconfirming_observations: ["test rejects empty input"],
            evidence_references: ["test-1"],
          },
        },
      },
    });
    assert.equal(gate.allowed, true);
    assert.ok(!gate.diagnostics.includes("depth_downgrade_requires_waiver"));
  });

  it("requires completion_criteria.activation at verification and close_out", () => {
    const citdpWithoutActivation = {
      risk_analysis: {
        adversarial_inquiry: {
          depth_tier: "integrated",
          gate_policy: "advisory",
        },
      },
    };
    const verification = validateChecklistGate({
      phase: "verification",
      tracker: integratedTracker("verification"),
      citdp: citdpWithoutActivation,
      activation: buildActivation("verification", "verification-run-1"),
    });
    assert.equal(verification.allowed, false);
    assert.ok(verification.diagnostics.includes("missing_completion_activation"));

    const closeOut = validateChecklistGate({
      phase: "close_out",
      tracker: integratedTracker("close_out"),
      citdp: citdpWithoutActivation,
      activation: buildActivation("close_out", "close-out-run-1"),
    });
    assert.equal(closeOut.allowed, false);
    assert.ok(closeOut.diagnostics.includes("missing_completion_activation"));
  });

  it("fails strict_candidate at close_out without pairing", () => {
    const result = validateChecklistGate({
      phase: "close_out",
      tracker: integratedTracker("close_out"),
      citdp: {
        risk_analysis: {
          adversarial_inquiry: {
            depth_tier: "strict_candidate",
            counterexamples: ["missing pairing"],
            falsification_questions: ["Can close_out pass without pairing?"],
            disconfirming_observations: ["gate rejects missing pairing"],
            evidence_references: ["checklist-validator.test.ts"],
          },
        },
        completion_criteria: {
          activation: {
            run_id: "verification-run-1",
            phase: "verification",
          },
        },
      },
    });
    assert.equal(result.allowed, false);
    assert.ok(result.diagnostics.includes("integrated_depth_requires_pairing"));
  });

  it("allows strict_candidate at pre_implementation with counterexamples only", () => {
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
            depth_tier: "strict_candidate",
            counterexamples: ["missing counterexample"],
            falsification_questions: ["Can pre_implementation pass without pairing?"],
            disconfirming_observations: ["strict_candidate allows counterexamples only here"],
            evidence_references: ["checklist-validator.test.ts"],
          },
        },
      },
    });
    assert.equal(result.allowed, true);
    assert.equal(result.depth, "strict_candidate");
  });

  it("allows close_out with close-out inquiry waiver instead of pairing", () => {
    const result = validateChecklistGate({
      phase: "close_out",
      tracker: integratedTracker("close_out"),
      citdp: {
        risk_analysis: {
          adversarial_inquiry: {
            depth_tier: "integrated",
            gate_policy: "advisory",
            close_out_inquiry_waiver: {
              owner: "maintainer",
              expiry: "2099-01-01",
              rationale: "Findings unchanged since verification.",
              approval: "approved-1",
              referenced_verification_run_id: "verification-run-1",
            },
          },
        },
        completion_criteria: {
          activation: {
            run_id: "verification-run-1",
            phase: "verification",
          },
        },
      },
    });
    assert.equal(result.allowed, true);
  });
});
