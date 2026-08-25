import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import yaml from "js-yaml";

import {
  deriveExpectedFromReceipt,
  derivePhaseAwareSlugs,
  MINIMAL_DEPTH_MISSING_WAIVER,
  validateActivationPairing,
  validateChecklistGate,
  validateDepthDowngrade,
  validateIntegratedParentChildSlugs,
  validateMinimalWaiver,
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

function minimalSubStubNotApplicable() {
  return {
    slug: "sub-adversarial-inquiry-pass",
    disposition: "not_applicable",
    policy: "minimal-depth-no-inquiry",
    rationale: "Minimal depth uses counterexamples only; sub-stub is not executed.",
  };
}

function minimalCitdp(overrides: Record<string, unknown> = {}) {
  return {
    risk_analysis: {
      adversarial_inquiry: {
        depth_tier: "minimal",
        counterexamples: ["empty input"],
        falsification_questions: ["Can an empty input pass?"],
        disconfirming_observations: ["test rejects empty input"],
        evidence_references: ["test-1"],
        ...overrides,
      },
    },
  };
}

function minimalTracker(extraSteps: Record<string, unknown>[] = []) {
  return {
    steps: [
      {
        slug: "change-definition",
        disposition: "completed",
        evidence_refs: ["citdp"],
      },
      minimalSubStubNotApplicable(),
      ...extraSteps,
    ],
  };
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
      tracker: minimalTracker(),
      citdp: minimalCitdp(),
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

  it("rejects cross-phase and root-projection artifact paths [Slice P]", () => {
    const base: ActivationExpectedIdentity = {
      request_token: "REQ-EXAMPLE",
      project_id: "project-1",
      run_id: "run-1",
      phase: "verification",
      scope: ["block-1"],
      scope_hash: stableHash(["block-1"]),
    };
    const phasePrefix = `working/${base.request_token}/adversarial-inquiry/phase-${base.phase}/`;
    const buildArtifacts = (pathPrefix: string) => Object.fromEntries([
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
      path: `${pathPrefix}${name}`,
    }]));
    const receipt = {
      ...base,
      success: true,
      tool: "tied_adversarial_inquiry_run",
      scope: base.scope,
      artifact_hashes: Object.fromEntries([
        "obligation-report.json",
        "finding-ledger.jsonl",
        "gate-result.json",
        "evidence-provenance.json",
      ].map((name) => [name, `${name}-hash`])),
    };

    const accepted = validateActivationPairing({
      receipt,
      artifacts: buildArtifacts(phasePrefix),
      expected: base,
    });
    assert.equal(accepted.ok, true);

    const crossPhase = validateActivationPairing({
      receipt,
      artifacts: buildArtifacts(
        `working/${base.request_token}/adversarial-inquiry/phase-pre_implementation/`,
      ),
      expected: base,
    });
    assert.equal(crossPhase.ok, false);
    assert.ok(crossPhase.diagnostics.some((item) => item.startsWith("artifact_path_wrong_phase:")));

    const rootProjection = validateActivationPairing({
      receipt,
      artifacts: buildArtifacts(`working/${base.request_token}/adversarial-inquiry/`),
      expected: base,
    });
    assert.equal(rootProjection.ok, false);
    assert.ok(rootProjection.diagnostics.some((item) => item.startsWith("artifact_path_root_projection_rejected:")));
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
      tracker: minimalTracker(),
      citdp: minimalCitdp({ prior_depth_tier: "integrated" }),
    });
    assert.equal(gate.allowed, false);
    assert.ok(gate.diagnostics.includes("depth_downgrade_requires_waiver"));
  });

  it("skips downgrade diagnostic when prior_depth_tier is missing", () => {
    const gate = validateChecklistGate({
      phase: "pre_implementation",
      tracker: minimalTracker(),
      citdp: minimalCitdp(),
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
      tracker: minimalTracker(),
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

// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: Slice 0 validator hotfixes for placeholder waivers, expected auto-derive, and sub-stub disposition.
describe("VALIDATE_CHECKLIST_GATE Slice 0 hotfixes [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]", () => {
  it("rejects placeholder close_out inquiry waiver (1787507684 shape)", () => {
    const result = validateChecklistGate({
      phase: "close_out",
      tracker: integratedTracker("close_out"),
      citdp: integratedCitdp({
        close_out_inquiry_waiver: {
          owner: "~",
          expiry: "~",
          rationale: "~",
          approval: "~",
          referenced_verification_run_id: "~",
        },
      }),
    });
    assert.equal(result.allowed, false);
    assert.ok(result.diagnostics.includes("integrated_depth_requires_pairing"));
  });

  it("derives expected from receipt when activation omits expected", () => {
    const activation = buildActivation("verification", "verification-run-1");
    const derived = deriveExpectedFromReceipt(activation.receipt);
    assert.deepEqual(derived, activation.expected);

    const { expected: _expected, ...receiptOnly } = activation;
    const result = validateChecklistGate({
      phase: "verification",
      tracker: integratedTracker("verification"),
      citdp: integratedCitdp(),
      activation: receiptOnly,
    });
    assert.equal(result.allowed, true);
    assert.ok(!result.diagnostics.includes("missing_expected_identity"));
  });

  it("fails when receipt is incomplete and expected is omitted", () => {
    const activation = buildActivation("verification", "verification-run-1");
    const incompleteReceipt = { ...activation.receipt, scope_hash: undefined };
    delete (incompleteReceipt as { scope_hash?: string }).scope_hash;
    const result = validateChecklistGate({
      phase: "verification",
      tracker: integratedTracker("verification"),
      citdp: integratedCitdp(),
      activation: {
        receipt: incompleteReceipt,
        artifacts: activation.artifacts,
      },
    });
    assert.equal(result.allowed, false);
    assert.ok(result.diagnostics.includes("missing_expected_identity"));
  });

  it("fails minimal depth when sub-adversarial-inquiry-pass is pending", () => {
    const result = validateChecklistGate({
      phase: "pre_implementation",
      tracker: {
        steps: [
          {
            slug: "change-definition",
            disposition: "completed",
            evidence_refs: ["citdp"],
          },
          {
            slug: "sub-adversarial-inquiry-pass",
            disposition: "pending",
          },
        ],
      },
      citdp: minimalCitdp(),
    });
    assert.equal(result.allowed, false);
    assert.ok(result.diagnostics.includes("pending_required_step:sub-adversarial-inquiry-pass"));
  });

  it("fails integrated depth when parent slug is completed and sub-stub is pending", () => {
    const result = validateChecklistGate({
      phase: "pre_implementation",
      tracker: {
        steps: [
          completedStep("risk-assessment"),
          completedStep("gate-pseudocode-validation"),
          { slug: "sub-adversarial-inquiry-pass", disposition: "pending" },
        ],
      },
      citdp: integratedCitdp(),
      activation: buildActivation("pre_implementation", "pre-impl-run-1"),
    });
    assert.equal(result.allowed, false);
    assert.ok(
      result.diagnostics.includes("sub_stub_pending_while_parent_completed")
      || result.diagnostics.includes("pending_required_step:sub-adversarial-inquiry-pass"),
    );
  });

  it("validateIntegratedParentChildSlugs detects parent completed with pending sub-stub", () => {
    const result = validateIntegratedParentChildSlugs({
      depth: "integrated",
      phase: "pre_implementation",
      tracker: {
        steps: [
          completedStep("gate-pseudocode-validation"),
          { slug: "sub-adversarial-inquiry-pass", disposition: "pending" },
        ],
      },
    });
    assert.equal(result.ok, false);
    assert.ok(result.diagnostics.includes("sub_stub_pending_while_parent_completed"));
  });

  it("rejects placeholder depth-change waiver on downgrade", () => {
    const downgrade = validateDepthDowngrade({
      citdp: {
        risk_analysis: {
          adversarial_inquiry: {
            depth_tier: "minimal",
            prior_depth_tier: "integrated",
            integrated_waiver: {
              owner: "~",
              expiry: "~",
              rationale: "~",
              approval: "~",
            },
          },
        },
      },
    });
    assert.equal(downgrade.ok, false);
    assert.ok(downgrade.diagnostics.includes("depth_downgrade_requires_waiver"));
  });
});

// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: warn-only minimal_depth_missing_waiver for triggered minimal depth without integrated_waiver (Slice A3).
describe("VALIDATE_MINIMAL_WAIVER Slice A3 [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]", () => {
  it("warns when triggered minimal depth lacks integrated_waiver", () => {
    const result = validateChecklistGate({
      phase: "pre_implementation",
      tracker: minimalTracker(),
      citdp: minimalCitdp({
        gate_policy: "advisory",
        eligibility_triggers_matched: ["external-input", "network"],
      }),
    });
    assert.equal(result.allowed, true);
    assert.equal(result.blocking, false);
    assert.ok(result.diagnostics.includes(MINIMAL_DEPTH_MISSING_WAIVER));
  });

  it("is clean when triggered minimal depth has complete integrated_waiver", () => {
    const result = validateChecklistGate({
      phase: "pre_implementation",
      tracker: minimalTracker(),
      citdp: minimalCitdp({
        gate_policy: "advisory",
        eligibility_triggers_matched: ["persistence"],
        integrated_waiver: {
          owner: "sponsor",
          expiry: "2099-01-01",
          rationale: "Local read-only CLI; integrated inquiry not required.",
          approval: "plan-refine",
        },
      }),
    });
    assert.equal(result.allowed, true);
    assert.ok(!result.diagnostics.includes(MINIMAL_DEPTH_MISSING_WAIVER));
  });

  it("does not warn for non-triggered minimal depth", () => {
    const result = validateChecklistGate({
      phase: "pre_implementation",
      tracker: minimalTracker(),
      citdp: minimalCitdp({
        gate_policy: "advisory",
        eligibility_triggers_matched: [],
      }),
    });
    assert.equal(result.allowed, true);
    assert.ok(!result.diagnostics.includes(MINIMAL_DEPTH_MISSING_WAIVER));
  });

  it("does not warn for integrated depth even when triggers are recorded", () => {
    const result = validateChecklistGate({
      phase: "pre_implementation",
      tracker: integratedTracker("pre_implementation"),
      citdp: integratedCitdp({
        eligibility_triggers_matched: ["network"],
        integrated_waiver: null,
      }),
      activation: buildActivation("pre_implementation", "pre-impl-run-a3"),
    });
    assert.ok(!result.diagnostics.includes(MINIMAL_DEPTH_MISSING_WAIVER));
  });

  it("validateMinimalWaiver isolates advisory diagnostic semantics", () => {
    const warned = validateMinimalWaiver({
      citdp: {
        risk_analysis: {
          adversarial_inquiry: {
            depth_tier: "minimal",
            eligibility_triggers_matched: ["auth"],
          },
        },
      },
    });
    assert.equal(warned.ok, false);
    assert.deepEqual(warned.diagnostics, [MINIMAL_DEPTH_MISSING_WAIVER]);

    const clean = validateMinimalWaiver({
      citdp: {
        risk_analysis: {
          adversarial_inquiry: {
            depth_tier: "minimal",
            eligibility_triggers_matched: ["auth"],
            integrated_waiver: {
              owner: "sponsor",
              expiry: "2099-01-01",
              rationale: "Sponsor confirmed minimal.",
              approval: "approved",
            },
          },
        },
      },
    });
    assert.equal(clean.ok, true);
  });
});

// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: Go writer fixture consumed by shared checklist gate (Stage E).
describe("Go writer fixture gate composition [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]", () => {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
  const writerFixturePath = path.join(
    repoRoot,
    "tools/agentstream/checklist/testdata/gate-writer-minimal-tracker.yaml",
  );

  function loadWriterFixture(): Record<string, unknown> {
    return yaml.load(fs.readFileSync(writerFixturePath, "utf8")) as Record<string, unknown>;
  }

  const minimalCitdp = {
    risk_analysis: {
      adversarial_inquiry: {
        depth_tier: "minimal",
        counterexamples: ["sparse tracker"],
        falsification_questions: ["Can execution_evidence.completed substitute for steps?"],
        disconfirming_observations: ["writer emits authoritative step rows"],
        evidence_references: ["tools/agentstream/checklist/tracker_test.go"],
      },
    },
  };

  it("A1 rejects sparse legacy summary without matching step rows", () => {
    const sparse = validateChecklistGate({
      phase: "verification",
      tracker: {
        execution_evidence: { completed: ["change-definition", "impact-discovery"] },
      },
      citdp: {
        risk_analysis: {
          adversarial_inquiry: {
            depth_tier: "integrated",
            gate_policy: "advisory",
            counterexamples: ["sparse tracker"],
            falsification_questions: ["Can execution_evidence.completed substitute for steps?"],
            disconfirming_observations: ["writer emits authoritative step rows"],
            evidence_references: ["tools/agentstream/checklist/tracker_test.go"],
          },
        },
      },
    });
    assert.equal(sparse.allowed, false);
    assert.ok(sparse.diagnostics.includes("tracker_sparse"));
  });

  it("A6 passes minimal pre_implementation gate for Go writer fixture", () => {
    const result = validateChecklistGate({
      phase: "pre_implementation",
      tracker: loadWriterFixture(),
      citdp: minimalCitdp,
    });
    assert.equal(result.allowed, true);
    assert.equal(result.depth, "minimal");
  });

  it("A7 fails integrated writer output without activation under advisory policy", () => {
    const tracker = loadWriterFixture();
    const steps = (tracker.steps as Record<string, unknown>[]).map((row) => ({ ...row }));
    for (const row of steps) {
      if (row.slug === "sub-adversarial-inquiry-pass") {
        row.disposition = "pending";
        delete row.policy;
        delete row.rationale;
      }
    }
    const result = validateChecklistGate({
      phase: "verification",
      tracker: { ...tracker, steps },
      citdp: {
        risk_analysis: {
          adversarial_inquiry: {
            depth_tier: "integrated",
            gate_policy: "advisory",
            counterexamples: ["missing activation"],
            falsification_questions: ["Can integrated pass without pairing?"],
            disconfirming_observations: ["gate requires activation"],
            evidence_references: ["checklist-validator.test.ts"],
          },
        },
      },
    });
    assert.equal(result.allowed, false);
    assert.ok(result.diagnostics.includes("integrated_depth_requires_pairing"));
  });
});

// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: Stage P normative trigger — gate must accept unresolved refs from non-agentstream Tracker writers.
describe("Stage P trigger: non-agentstream unresolved evidence_refs", () => {
  it("A32 trigger fires when gate accepts manual Tracker with nonexistent evidence_refs", () => {
    const manualTracker = {
      steps: [
        completedStep("change-definition", "manual/nonexistent/file-that-go-would-reject.go"),
        completedStep("impact-discovery", "another/fake/path/evidence.txt"),
        minimalSubStubNotApplicable(),
      ],
    };
    const result = validateChecklistGate({
      phase: "verification",
      tracker: manualTracker,
      citdp: minimalCitdp(),
    });
    assert.equal(
      result.allowed,
      true,
      "Stage P trigger: shared gate accepts unresolved refs bypassing Go producer resolution",
    );
    assert.equal(result.depth, "minimal");
  });
});
