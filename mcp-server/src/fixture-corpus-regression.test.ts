// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
// How: replay fixture corpus manifest cases through validateChecklistGate and publish regression manifest.
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import { describe, it } from "node:test";

import {
  loadCorpusManifest,
  runAllCorpusCases,
  runCorpusCase,
  writeRegressionManifest,
} from "./fixture-corpus-regression.js";

describe("fixture corpus regression [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]", () => {
  it("runs all 15 corpus cases with expected gate decisions", () => {
    const manifest = loadCorpusManifest();
    const cases = [...manifest.negative_cases, manifest.positive_case];
    assert.equal(cases.length, 15);

    const results = runAllCorpusCases();
    assert.equal(results.length, 15);

    const failures = results.filter((item) => !item.matches_expected);
    if (failures.length > 0) {
      const detail = failures.map((item) => (
        `${item.case_id}: allowed=${item.actual_allowed} diagnostics=${item.actual_diagnostics.join(",")}`
      )).join("\n");
      assert.fail(`corpus regression mismatches:\n${detail}`);
    }

    let stddRevision = "unknown";
    try {
      stddRevision = execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
    } catch {
      // non-git environment
    }

    writeRegressionManifest(results, undefined, { stddRevision });
  });

  it("A4 missing pairing rejects with activation_pairing_incomplete", () => {
    const manifest = loadCorpusManifest();
    const testCase = manifest.negative_cases.find((item) => item.id === "A4-missing-pairing");
    assert.ok(testCase);
    const result = runCorpusCase(testCase);
    assert.equal(result.actual_allowed, false);
    assert.ok(result.actual_diagnostics.includes("activation_pairing_incomplete"));
  });
});
