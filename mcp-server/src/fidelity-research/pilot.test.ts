import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { runFidelityResearchPilot } from "./pilot.js";

describe("RUN_FIDELITY_RESEARCH_PILOT REQ-TIED_FIDELITY_RESEARCH", () => {
  // [IMPL-TIED_FIDELITY_RESEARCH] [ARCH-TIED_FIDELITY_RESEARCH] [REQ-TIED_FIDELITY_RESEARCH]
  // Connects concrete first-slice modules for a bounded, read-only pilot and emits research-dataset records.
  it("runs concrete modules and keeps the audited project read-only", () => {
    const result = runFidelityResearchPilot({
      manifest: {
        projectRoot: "/pilot-project",
        tiedBasePath: "/pilot-project/tied",
        version: "3.0.0",
        languages: ["typescript"],
        testClassifiers: ["*.test.ts"],
        ignoreRules: ["node_modules"],
      },
      change: {
        id: "change-1",
        priorRevision: "rev-0",
        currentRevision: "rev-1",
        artifacts: [
          {
            path: "tied/implementation-decisions/IMPL-TIED_FIDELITY_RESEARCH-pseudocode.md",
            kind: "pseudocode",
            content: "procedure PROJECT_MANIFEST(input): RETURN input",
          },
        ],
        priorSpecification: { approved: true, behavior: "old behavior" },
        currentSpecification: { approved: true, behavior: "new behavior" },
        observedBehavior: "old behavior",
      },
      scope: {
        token: "IMPL-TIED_FIDELITY_RESEARCH",
        pseudocode: "procedure PROJECT_MANIFEST(input): RETURN input",
        testLoci: [{ block: "PROJECT_MANIFEST", locus: "pilot.test.ts:1" }],
        codeLoci: [{ block: "PROJECT_MANIFEST", locus: "pilot.ts:1" }],
        validators: {
          tiedConsistency: () => ({ ok: true }),
          pseudocode: () => ({ ok: true }),
          traceability: () => ({ ok: true }),
          cycles: () => ({ ok: true }),
          bindingInventory: () => ({ ok: true }),
          testAdequacy: () => ({ ok: true }),
        },
        binding: {
          contract: {
            trigger: "pilot",
            channel: "direct",
            callee: "runFidelityResearchPilot",
            arguments: "bounded input",
            effect: "research dataset",
            ordering: "manifest before snapshot",
            failureBehavior: "return stage failure",
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
        },
      },
      finding: {
        category: "implementation-lag",
        severity: "medium",
        confidence: "high",
        visibility: "developer-visible",
        discoverySource: "pilot",
        evidence: [{ path: "pilot.ts", line: 1 }],
      },
      reviewers: ["reviewer-a", "reviewer-b"],
    });

    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.result.readOnly, true);
    assert.equal(result.result.specification.classification, "ImplementationLag");
    assert.equal(result.result.binding.kind, "composition-evidence");
    assert.equal(result.result.researchDataset.findings.length, 1);
    assert.equal(result.result.researchDataset.caseReports.length, 1);
    assert.equal(result.result.researchDataset.caseReports[0].productTiedMutation, false);
    assert.equal(result.result.rerun.deterministic, true);
    assert.equal(result.result.rerun.defectCountDelta, 0);
  });

  it("fails closed when the manifest points at another TIED base path", () => {
    const result = runFidelityResearchPilot({
      manifest: {
        projectRoot: "/pilot-project",
        tiedBasePath: "/other-project/tied",
        version: "3.0.0",
        languages: ["typescript"],
        testClassifiers: ["*.test.ts"],
        ignoreRules: [],
      },
      change: {} as never,
      scope: {} as never,
      finding: {} as never,
      reviewers: [],
    });

    assert.deepEqual(result, {
      ok: false,
      stage: "manifest",
      error: "WrongTiedBasePath",
    });
  });
});
