import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { runAdversarialInquiry } from "./core.js";
import type { FidelityNormalizationInput, ObligationGraphInput } from "./types.js";

const fixtureRoot = path.resolve(
  import.meta.dirname,
  "../../test/fixtures/adversarial-inquiry-psa",
);
const blockId = "IMPL-PSEUDOCODE_ANALYSIS_ENGINE#ANALYZE_ESSENCE_PSEUDOCODE#ccd3592432c0cf4e";

function readJson<T>(name: string): T {
  return JSON.parse(fs.readFileSync(path.join(fixtureRoot, name), "utf8")) as T;
}

describe("adversarial-inquiry-psa fixture [REQ-PSEUDOCODE_STATIC_ANALYSIS]", () => {
  it("classifies Mode A fidelity as PASS for aligned statements", () => {
    // [IMPL-PSEUDOCODE_ANALYSIS_ENGINE] [ARCH-PSEUDOCODE_ANALYSIS_PIPELINE] [REQ-PSEUDOCODE_STATIC_ANALYSIS]
    const graph = readJson<ObligationGraphInput>("graph.json");
    const fidelity = readJson<FidelityNormalizationInput>("fidelity.json");
    const result = runAdversarialInquiry({
      graph,
      fidelity,
      scope: [blockId],
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.verdict, "PASS");
    assert.equal(result.status[blockId], "PASS");
    assert.equal(
      result.report.findings.filter((finding) => finding.proofBoundary === "semantic_fidelity").length,
      0,
    );
  });
});
