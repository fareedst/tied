import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { runFirstSlice } from "./first-slice.js";

describe("RUN_FIRST_SLICE REQ-TIED_FIDELITY_RESEARCH", () => {
  // [IMPL-TIED_FIDELITY_RESEARCH] [ARCH-TIED_FIDELITY_RESEARCH] [REQ-TIED_FIDELITY_RESEARCH]
  // Orchestrates validated research modules through one read-only composition seam.
  it("connects the validated modules in the declared order", () => {
    const calls: string[] = [];
    const adapters = {
      resolveManifest: (..._args: unknown[]) => {
        calls.push("manifest");
        return { ok: true, manifest: { projectRoot: "/p", tiedBasePath: "/p/tied" } };
      },
      snapshotChange: (..._args: unknown[]) => {
        calls.push("snapshot");
        return { ok: true, snapshot: { id: "snapshot-1" } };
      },
      analyzeSpecificationState: (..._args: unknown[]) => {
        calls.push("specification");
        return { classification: "ImplementationLag" };
      },
      runStructuralAnalysis: (..._args: unknown[]) => {
        calls.push("structural");
        return { evidence: [], proofBoundary: "structural-only" };
      },
      auditImplFidelity: (..._args: unknown[]) => {
        calls.push("fidelity");
        return { inventory: [], findings: [], verdicts: {} };
      },
      analyzeBindingEvidence: (..._args: unknown[]) => {
        calls.push("binding");
        return { kind: "composition-evidence" };
      },
      appendCandidateFinding: (..._args: unknown[]) => {
        calls.push("finding");
        return { kind: "appended", finding: { id: "finding-1" } };
      },
      promoteConfirmedCase: (..._args: unknown[]) => {
        calls.push("promotion");
        return { kind: "case-report", caseReport: { findingId: "finding-1" } };
      },
      verifyDeterministicRerun: (..._args: unknown[]) => {
        calls.push("rerun");
        return { deterministic: true, duplicateLinks: [], defectCountDelta: 0 };
      },
    };

    const result = runFirstSlice({
      manifestInput: { projectRoot: "/p", tiedBasePath: "/p/tied" },
      change: { id: "change-1" },
      scope: ["IMPL-TIED_FIDELITY_RESEARCH"],
      adapters,
    });

    assert.deepEqual(calls, [
      "manifest",
      "snapshot",
      "specification",
      "structural",
      "fidelity",
      "binding",
      "finding",
      "promotion",
      "rerun",
    ]);
    assert.equal(result.ok, true);
  });
});
