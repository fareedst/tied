import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { describe, it } from "node:test";

import { REPORT_SCHEMA_VERSION } from "./analysis/pseudocode-ir.js";
import { PSEUDOCODE_GATE_SLUG } from "./checklist-slug-registry.js";
import {
  validateCanonicalSlugs,
  validateChecklistGate,
  validatePseudocodeAnalysisEvidence,
  validatePseudocodeGateHistory,
  withPseudocodeGateHistory,
} from "./checklist-validator.js";

function completedStep(slug: string) {
  return { slug, disposition: "completed", evidence_refs: ["evidence-1"] };
}

function goodPsaReport(implToken: string, requestToken: string, sidecarHash?: string) {
  return {
    ok: true,
    gate_mode_applied: true,
    schema_version: REPORT_SCHEMA_VERSION,
    token: implToken,
    request_token: requestToken,
    input_identity: {
      algorithm: "sha256",
      hash: sidecarHash ?? "abc123",
      byte_length: 100,
    },
  };
}

function integratedCitdp() {
  return {
    risk_analysis: {
      adversarial_inquiry: {
        depth_tier: "integrated",
        gate_policy: "advisory",
      },
    },
    completion_criteria: {
      activation: {
        run_id: "verification-run-1",
        phase: "verification",
        request_token: "REQ-PSEUDOCODE_STATIC_ANALYSIS",
      },
    },
  };
}

// [REQ-PSEUDOCODE_STATIC_ANALYSIS] [IMPL-QUALITY_PSEUDOCODE_VALIDATOR] — Wave 2 pseudocode gate enforcement.
describe("Wave 2 pseudocode gate enforcement [REQ-PSEUDOCODE_STATIC_ANALYSIS]", () => {
  it("W2-D3 rejects author-implementation invalid_slug", () => {
    const result = validateCanonicalSlugs({
      tracker: {
        steps: [completedStep("author-implementation")],
      },
    });
    assert.equal(result.ok, false);
    assert.ok(result.diagnostics.some((item) => item.startsWith("invalid_slug:")));
  });

  it("W2-D2 verification fails without gate-pseudocode-validation history", () => {
    const result = validatePseudocodeGateHistory({
      tracker: {
        steps: derivePhaseAwareSlugs("integrated", "verification").map(completedStep),
      },
      phase: "verification",
      depth: "integrated",
    });
    assert.equal(result.ok, false);
    assert.ok(result.diagnostics.includes("missing_pseudocode_gate_history"));
  });

  it("W2-D2 passes when gate-pseudocode-validation completed", () => {
    const tracker = withPseudocodeGateHistory({
      steps: [completedStep("verification-gate")],
    });
    const result = validatePseudocodeGateHistory({
      tracker,
      phase: "verification",
      depth: "integrated",
    });
    assert.equal(result.ok, true);
  });

  it("W2-D1 rejects missing PSA for impl_inventory", () => {
    const result = validatePseudocodeAnalysisEvidence({
      tracker: {
        execution_evidence: {
          request: "REQ-PSEUDOCODE_STATIC_ANALYSIS",
          impl_inventory: [{ impl_token: "IMPL-PSEUDOCODE_ANALYSIS_ENGINE" }],
        },
      },
      requestToken: "REQ-PSEUDOCODE_STATIC_ANALYSIS",
      pseudocodeReports: {},
    });
    assert.equal(result.ok, false);
    assert.ok(result.diagnostics.includes("psa_missing:IMPL-PSEUDOCODE_ANALYSIS_ENGINE"));
  });

  it("W2-D1 rejects ok false and gate_mode_applied false", () => {
    const badOk = validatePseudocodeAnalysisEvidence({
      tracker: {
        execution_evidence: {
          request: "REQ-PSEUDOCODE_STATIC_ANALYSIS",
          impl_inventory: ["IMPL-PSEUDOCODE_ANALYSIS_ENGINE"],
        },
      },
      requestToken: "REQ-PSEUDOCODE_STATIC_ANALYSIS",
      pseudocodeReports: {
        "IMPL-PSEUDOCODE_ANALYSIS_ENGINE": {
          ...goodPsaReport("IMPL-PSEUDOCODE_ANALYSIS_ENGINE", "REQ-PSEUDOCODE_STATIC_ANALYSIS"),
          ok: false,
        },
      },
    });
    assert.ok(badOk.diagnostics.includes("psa_not_ok:IMPL-PSEUDOCODE_ANALYSIS_ENGINE"));

    const badGate = validatePseudocodeAnalysisEvidence({
      tracker: {
        execution_evidence: {
          request: "REQ-PSEUDOCODE_STATIC_ANALYSIS",
          impl_inventory: ["IMPL-PSEUDOCODE_ANALYSIS_ENGINE"],
        },
      },
      requestToken: "REQ-PSEUDOCODE_STATIC_ANALYSIS",
      pseudocodeReports: {
        "IMPL-PSEUDOCODE_ANALYSIS_ENGINE": {
          ...goodPsaReport("IMPL-PSEUDOCODE_ANALYSIS_ENGINE", "REQ-PSEUDOCODE_STATIC_ANALYSIS"),
          gate_mode_applied: false,
        },
      },
    });
    assert.ok(badGate.diagnostics.includes("psa_gate_mode_not_applied:IMPL-PSEUDOCODE_ANALYSIS_ENGINE"));
  });

  it("W2-D1 rejects sidecar hash mismatch", () => {
    const sidecar = "# sidecar\nprocedure MAIN:\n  RETURN";
    const hash = createHash("sha256").update(sidecar.replace(/\r\n/g, "\n"), "utf8").digest("hex");
    const result = validatePseudocodeAnalysisEvidence({
      tracker: {
        execution_evidence: {
          request: "REQ-PSEUDOCODE_STATIC_ANALYSIS",
          impl_inventory: ["IMPL-PSEUDOCODE_ANALYSIS_ENGINE"],
        },
      },
      requestToken: "REQ-PSEUDOCODE_STATIC_ANALYSIS",
      pseudocodeReports: {
        "IMPL-PSEUDOCODE_ANALYSIS_ENGINE": goodPsaReport(
          "IMPL-PSEUDOCODE_ANALYSIS_ENGINE",
          "REQ-PSEUDOCODE_STATIC_ANALYSIS",
          "different-hash",
        ),
      },
      sidecarHashes: {
        "IMPL-PSEUDOCODE_ANALYSIS_ENGINE": hash,
      },
    });
    assert.ok(result.diagnostics.includes("psa_sidecar_hash_mismatch:IMPL-PSEUDOCODE_ANALYSIS_ENGINE"));
  });

  it("W2-D1 passes with valid PSA reports", () => {
    const result = validatePseudocodeAnalysisEvidence({
      tracker: {
        execution_evidence: {
          request: "REQ-PSEUDOCODE_STATIC_ANALYSIS",
          impl_inventory: ["IMPL-PSEUDOCODE_ANALYSIS_ENGINE"],
        },
      },
      requestToken: "REQ-PSEUDOCODE_STATIC_ANALYSIS",
      pseudocodeReports: {
        "IMPL-PSEUDOCODE_ANALYSIS_ENGINE": goodPsaReport(
          "IMPL-PSEUDOCODE_ANALYSIS_ENGINE",
          "REQ-PSEUDOCODE_STATIC_ANALYSIS",
        ),
      },
    });
    assert.equal(result.ok, true);
  });

  it("integrated gate fails author-implementation slug at verification", () => {
    const gate = validateChecklistGate({
      phase: "verification",
      tracker: withPseudocodeGateHistory({
        steps: [
          completedStep("author-implementation"),
          completedStep("verification-gate"),
          completedStep("risk-assessment"),
          completedStep("sub-adversarial-inquiry-pass"),
        ],
      }),
      citdp: integratedCitdp(),
    });
    assert.equal(gate.allowed, false);
    assert.ok(gate.diagnostics.some((item) => item.startsWith("invalid_slug:")));
  });
});

function derivePhaseAwareSlugs(
  depth: "integrated",
  phase: "verification" | "close_out" | "pre_implementation",
): string[] {
  if (phase === "verification") {
    return ["risk-assessment", "sub-adversarial-inquiry-pass", "verification-gate"];
  }
  if (phase === "close_out") {
    return ["risk-assessment", "sub-adversarial-inquiry-pass", "verification-gate", "traceable-commit"];
  }
  return ["risk-assessment", "sub-adversarial-inquiry-pass", PSEUDOCODE_GATE_SLUG];
}
