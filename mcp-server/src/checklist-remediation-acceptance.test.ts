import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  derivePhaseAwareSlugs,
  stableHash,
  validateChecklistGate,
  validateCommandEvidence,
  validateCloseOutTree,
  validateEvidenceFreshness,
  validateFindingDisposition,
  validateProvenanceComplete,
  validateTrackerAuthoritative,
  validateTrackerSparse,
} from "./checklist-validator.js";

// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: acceptance matrix A1–A18 stable diagnostics for remediation corpus.
describe("remediation acceptance matrix A1–A18 [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]", () => {
  function buildActivation(phase: "pre_implementation" | "verification" | "close_out", runId: string) {
    const scope = ["IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT#REMEDIATION#block"];
    const scopeHash = stableHash(scope);
    const base = {
      request_token: "REQ-TIED_CHECKLIST_GATE_ENFORCEMENT",
      project_id: "stdd-project",
      run_id: runId,
      phase,
      scope,
      scope_hash: scopeHash,
    };
    const artifacts = Object.fromEntries([
      "obligation-report.json",
      "finding-ledger.jsonl",
      "gate-result.json",
      "evidence-provenance.json",
    ].map((name) => [name, {
      valid: true,
      ...base,
      hash: `${name}-${runId}`,
      path: `working/REQ-TIED_CHECKLIST_GATE_ENFORCEMENT/adversarial-inquiry/phase-${phase}/${name}`,
    }]));
    const receipt = {
      ...base,
      success: true,
      tool: "tied_adversarial_inquiry_run",
      artifact_hashes: Object.fromEntries(
        Object.entries(artifacts).map(([name, artifact]) => [name, (artifact as { hash: string }).hash]),
      ),
    };
    return { receipt, artifacts, expected: base };
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
          run_id: "verification-run-remediation",
          phase: "verification",
          request_token: "REQ-TIED_CHECKLIST_GATE_ENFORCEMENT",
        },
      },
    };
  }

  it("A1 sparse Tracker → tracker_sparse", () => {
    const sparse = validateTrackerSparse({
      depth: "integrated",
      requiredStepSlugs: derivePhaseAwareSlugs("integrated", "verification"),
      tracker: {
        execution_evidence: { completed: ["session-bootstrap", "change-definition"] },
        steps: [{ slug: "change-definition", disposition: "completed", evidence_refs: ["x"] }],
      },
    });
    assert.equal(sparse.ok, false);
    assert.ok(sparse.diagnostics.includes("tracker_sparse"));
  });

  it("A2 synthetic projection → tracker_not_authoritative", () => {
    const result = validateTrackerAuthoritative({
      tracker: { _synthetic_projection: true, steps: [] },
      trackerSource: "synthetic_projection",
    });
    assert.equal(result.ok, false);
    assert.ok(result.diagnostics.includes("tracker_not_authoritative"));
  });

  it("A3 missing provenance fields → provenance_incomplete", () => {
    const result = validateProvenanceComplete({
      provenance: { proofBoundaries: ["semantic_fidelity"] },
      schemaVersion: "adversarial-inquiry-provenance.v1",
    });
    assert.equal(result.ok, false);
    assert.ok(result.diagnostics.includes("provenance_incomplete"));
  });

  it("A4 missing activation pairing → activation_pairing_incomplete", () => {
    const result = validateChecklistGate({
      phase: "verification",
      tracker: {
        steps: derivePhaseAwareSlugs("integrated", "verification").map((slug) => ({
          slug,
          disposition: "completed",
          evidence_refs: ["checklist-remediation-acceptance.test.ts"],
        })),
      },
      citdp: integratedCitdp(),
    });
    assert.equal(result.allowed, false);
    assert.ok(result.diagnostics.includes("activation_pairing_incomplete"));
  });

  it("A5 unresolved finding → finding_unresolved", () => {
    const result = validateFindingDisposition({
      gateResult: { verdict: "UNRESOLVED", status: "warn" },
      findingLedger: "{\"finding\":{\"lifecycle\":\"observed\"}}\n",
    });
    assert.equal(result.ok, false);
    assert.ok(result.diagnostics.includes("finding_unresolved"));
    assert.ok(result.diagnostics.includes("warn_not_success"));
  });

  it("A6 self-reported command success → command_success_unproven", () => {
    const result = validateCommandEvidence({ claimed_success: true });
    assert.equal(result.ok, false);
    assert.ok(result.diagnostics.includes("command_success_unproven"));
  });

  it("A7 stale hash mismatch → evidence_stale", () => {
    const result = validateEvidenceFreshness({
      declaredHashes: { "gate-result.json": "abc" },
      computedHashes: { "gate-result.json": "def" },
    });
    assert.equal(result.ok, false);
    assert.ok(result.diagnostics.includes("evidence_stale"));
  });

  it("A8 placeholder waiver → waiver_invalid", () => {
    const result = validateChecklistGate({
      phase: "close_out",
      tracker: {
        steps: derivePhaseAwareSlugs("integrated", "close_out").map((slug) => ({
          slug,
          disposition: "completed",
          evidence_refs: ["checklist-remediation-acceptance.test.ts"],
        })),
      },
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
    assert.ok(result.diagnostics.includes("waiver_invalid"));
  });

  it("A9 pending sub-stub at integrated depth → sub_stub_pending", () => {
    const result = validateChecklistGate({
      phase: "pre_implementation",
      tracker: {
        steps: [
          { slug: "risk-assessment", disposition: "completed", evidence_refs: ["x"] },
          { slug: "sub-adversarial-inquiry-pass", disposition: "pending" },
        ],
      },
      citdp: integratedCitdp(),
      activation: buildActivation("pre_implementation", "pre-impl-remediation"),
    });
    assert.equal(result.allowed, false);
    assert.ok(result.diagnostics.includes("sub_stub_pending"));
  });

  it("A10 parent completed with pending sub-stub → parent_child_inconsistent", () => {
    const result = validateChecklistGate({
      phase: "pre_implementation",
      tracker: {
        steps: [
          { slug: "gate-pseudocode-validation", disposition: "completed", evidence_refs: ["x"] },
          { slug: "sub-adversarial-inquiry-pass", disposition: "pending" },
        ],
      },
      citdp: integratedCitdp(),
      activation: buildActivation("pre_implementation", "pre-impl-remediation"),
    });
    assert.equal(result.allowed, false);
    assert.ok(result.diagnostics.includes("parent_child_inconsistent"));
  });

  it("A11 valid integrated verification evidence → allowed", () => {
    const result = validateChecklistGate({
      phase: "verification",
      tracker: {
        steps: derivePhaseAwareSlugs("integrated", "verification").map((slug) => ({
          slug,
          disposition: "completed",
          evidence_refs: ["checklist-remediation-acceptance.test.ts"],
        })),
      },
      citdp: integratedCitdp(),
      activation: buildActivation("verification", "verification-run-remediation"),
    });
    assert.equal(result.allowed, true);
  });

  it("A12 valid waiver excludes waived obligation only", () => {
    const result = validateChecklistGate({
      phase: "pre_implementation",
      tracker: {
        steps: [
          {
            slug: "sub-adversarial-inquiry-pass",
            disposition: "waived",
            rationale: "Minimal fixture negative case.",
            owner: "sponsor",
            expiry: "2099-01-01",
            approval: "approved",
            residual_risk: "No inquiry in this synthetic case.",
          },
        ],
      },
      citdp: {
        risk_analysis: {
          adversarial_inquiry: {
            depth_tier: "minimal",
            counterexamples: ["x"],
            falsification_questions: ["y"],
            disconfirming_observations: ["z"],
            evidence_references: ["checklist-remediation-acceptance.test.ts"],
          },
        },
      },
    });
    assert.equal(result.allowed, true);
  });

  it("A13 wrong phase receipt → receipt_identity_mismatch:phase", () => {
    const result = validateChecklistGate({
      phase: "close_out",
      tracker: {
        steps: derivePhaseAwareSlugs("integrated", "close_out").map((slug) => ({
          slug,
          disposition: "completed",
          evidence_refs: ["checklist-remediation-acceptance.test.ts"],
        })),
      },
      citdp: integratedCitdp(),
      activation: buildActivation("verification", "verification-run-remediation"),
    });
    assert.equal(result.allowed, false);
    assert.ok(result.diagnostics.includes("receipt_identity_mismatch:phase"));
  });

  it("A14 verification receipt at close_out → receipt_identity_mismatch:phase", () => {
    const result = validateChecklistGate({
      phase: "close_out",
      tracker: {
        steps: derivePhaseAwareSlugs("integrated", "close_out").map((slug) => ({
          slug,
          disposition: "completed",
          evidence_refs: ["checklist-remediation-acceptance.test.ts"],
        })),
      },
      citdp: integratedCitdp(),
      activation: buildActivation("verification", "verification-run-remediation"),
    });
    assert.equal(result.allowed, false);
    assert.ok(result.diagnostics.includes("receipt_identity_mismatch:phase"));
  });

  it("A15 dirty post-gate tree → tree_dirty_post_gate", () => {
    const tree = validateCloseOutTree({ dirtyPaths: ["working/evidence-manifest.json"] });
    assert.equal(tree.ok, false);
    assert.ok(tree.diagnostics.includes("tree_dirty_post_gate"));

    const gate = validateChecklistGate({
      phase: "close_out",
      tracker: {
        steps: derivePhaseAwareSlugs("integrated", "close_out").map((slug) => ({
          slug,
          disposition: "completed",
          evidence_refs: ["checklist-remediation-acceptance.test.ts"],
        })),
      },
      citdp: integratedCitdp(),
      activation: buildActivation("close_out", "close-out-remediation"),
      evidence: { dirtyPaths: ["working/evidence-manifest.json"] },
    });
    assert.equal(gate.allowed, false);
    assert.ok(gate.diagnostics.includes("tree_dirty_post_gate"));
  });

  it("A16 depth downgrade without waiver → depth_downgrade_requires_waiver", () => {
    const result = validateChecklistGate({
      phase: "pre_implementation",
      tracker: {
        steps: [{
          slug: "sub-adversarial-inquiry-pass",
          disposition: "not_applicable",
          policy: "minimal",
          rationale: "Synthetic downgrade case.",
        }],
      },
      citdp: {
        risk_analysis: {
          adversarial_inquiry: {
            depth_tier: "minimal",
            prior_depth_tier: "integrated",
            counterexamples: ["x"],
            falsification_questions: ["y"],
            disconfirming_observations: ["z"],
            evidence_references: ["checklist-remediation-acceptance.test.ts"],
          },
        },
      },
    });
    assert.equal(result.allowed, false);
    assert.ok(result.diagnostics.includes("depth_downgrade_requires_waiver"));
  });

  it("A17 caller cannot subtract auto-required slugs", () => {
    const slugs = derivePhaseAwareSlugs("integrated", "pre_implementation");
    const trimmed = slugs.filter((slug) => slug !== "sub-adversarial-inquiry-pass");
    const result = validateChecklistGate({
      phase: "pre_implementation",
      tracker: {
        steps: trimmed.map((slug) => ({
          slug,
          disposition: "completed",
          evidence_refs: ["checklist-remediation-acceptance.test.ts"],
        })),
      },
      citdp: integratedCitdp(),
      activation: buildActivation("pre_implementation", "pre-impl-remediation"),
      requiredStepSlugs: ["change-definition"],
    });
    assert.equal(result.allowed, false);
    assert.ok(
      result.diagnostics.includes("missing_required_step:sub-adversarial-inquiry-pass")
      || result.diagnostics.includes("tracker_sparse"),
    );
  });

  it("A18 advisory policy still fail-closed without activation at integrated depth", () => {
    const result = validateChecklistGate({
      phase: "verification",
      tracker: {
        steps: derivePhaseAwareSlugs("integrated", "verification").map((slug) => ({
          slug,
          disposition: "completed",
          evidence_refs: ["checklist-remediation-acceptance.test.ts"],
        })),
      },
      citdp: integratedCitdp({ gate_policy: "advisory" }),
    });
    assert.equal(result.allowed, false);
    assert.ok(result.diagnostics.includes("activation_pairing_incomplete"));
  });
});
