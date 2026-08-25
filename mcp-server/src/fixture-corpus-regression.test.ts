// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
// How: replay fixture corpus manifest cases through validateChecklistGate and publish regression manifest.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import {
  corpusPaths,
  loadCorpusManifest,
  runAllCorpusCases,
  runCorpusCase,
  writeRegressionManifest,
} from "./fixture-corpus-regression.js";

const REQUEST_TOKEN = "REQ-TIED_CHECKLIST_GATE_ENFORCEMENT";

function sha256File(filePath: string): string {
  return createHash("sha256").update(readFileSync(filePath)).digest("hex");
}

function loadGateReceipts(root: string) {
  const working = path.join(root, "working", REQUEST_TOKEN);
  const phases = [
    { phase: "pre_implementation", file: "gate-pre-implementation.json" },
    { phase: "verification", file: "gate-verification.json" },
    { phase: "close_out", file: "gate-close_out.json" },
  ] as const;
  return phases.map(({ phase, file }) => {
    const gatePath = path.join(working, file);
    return {
      phase,
      path: path.relative(root, gatePath),
      hash: sha256File(gatePath),
    };
  });
}

function loadAdversarialInquiryRuns(root: string) {
  const evidencePath = path.join(root, "working", REQUEST_TOKEN, "evidence-manifest.json");
  const evidence = JSON.parse(readFileSync(evidencePath, "utf8")) as {
    adversarial_inquiry_runs?: Array<{ phase: string; run_id: string; proof_boundary?: string }>;
  };
  return evidence.adversarial_inquiry_runs ?? [];
}

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

    const root = path.resolve(import.meta.dirname, "../..");
    writeRegressionManifest(results, root, {
      stddRevision,
      gateReceipts: loadGateReceipts(root),
      adversarialInquiryRuns: loadAdversarialInquiryRuns(root),
    });
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
