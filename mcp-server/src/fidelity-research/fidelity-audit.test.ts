import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { auditImplFidelity } from "./fidelity-audit.js";

describe("AUDIT_IMPL_FIDELITY REQ-TIED_FIDELITY_RESEARCH", () => {
  // [IMPL-TIED_FIDELITY_RESEARCH] [ARCH-TIED_FIDELITY_RESEARCH] [REQ-TIED_FIDELITY_RESEARCH]
  // Produces both pseudo-code-to-evidence reliability analysis and evidence-to-pseudo-code completeness analysis.
  it("maps a pseudo-code block in both evidence directions", () => {
    const result = auditImplFidelity({
      pseudocode: "procedure PROJECT_MANIFEST(input):\n  RETURN normalized manifest",
      testLoci: [{ block: "PROJECT_MANIFEST", locus: "manifest.test.ts:8" }],
      codeLoci: [{ block: "PROJECT_MANIFEST", locus: "manifest.ts:12" }],
    });

    assert.deepEqual(result.inventory, [
      {
        block: "PROJECT_MANIFEST",
        testLocus: "manifest.test.ts:8",
        codeLocus: "manifest.ts:12",
      },
    ]);
    assert.deepEqual(result.findings, []);
    assert.equal(result.verdicts.PROJECT_MANIFEST, "PASS");
  });

  it("reports a missing production locus as an incomplete block", () => {
    const result = auditImplFidelity({
      pseudocode: "procedure PROJECT_MANIFEST(input):\n  RETURN normalized manifest",
      testLoci: [{ block: "PROJECT_MANIFEST", locus: "manifest.test.ts:8" }],
      codeLoci: [],
    });

    assert.equal(result.verdicts.PROJECT_MANIFEST, "RELIABLE_INCOMPLETE");
    assert.equal(result.findings[0].kind, "completeness");
  });
});
