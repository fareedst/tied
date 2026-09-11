/**
 * [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [ARCH-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT]
 * Composition tests: bootstrap output → audit dimensions (Module 4).
 */
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import {
  REPO_ROOT,
  runGrammarV2DefaultAudit,
  runLayerBReport,
  runLayerCReport,
  runLegacyCompatibilityReport,
} from "./lib/audit-grammar-v2-default.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("grammar-v2-default audit modules [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT]", () => {
  it("validates the smoke fixture independently for Layer B and Layer C [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT]", () => {
    // [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [ARCH-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT] How: Validate audit helpers before bootstrap composition wiring.
    const smokePath = path.join(REPO_ROOT, "scripts", "fixtures", "grammar-v2-default-smoke.sidecar.md");
    const smokeBody = fs.readFileSync(smokePath, "utf8");
    const layerB = runLayerBReport(smokeBody, "IMPL-GRAMMAR-V2-SMOKE");
    const layerC = runLayerCReport(smokeBody, "IMPL-GRAMMAR-V2-SMOKE", { constraintFlow: false });
    assert.equal(layerB.ok, true, JSON.stringify(layerB.diagnostics));
    assert.equal(layerC.ok, true, layerC.error ?? layerC.stage);
    assert.equal(layerC.gate_mode_applied, true);
    assert.equal(layerC.constraint_flow, false);
  });

  it("preserves legacy-v1 compatibility on the headerless IMPL fixture [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT]", () => {
    // [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [ARCH-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT] How: Keep legacy classification auditable and separate from generated-v2 checks.
    const legacy = runLegacyCompatibilityReport();
    assert.equal(legacy.compatible, true);
    assert.equal(legacy.classification, "legacy_v1");
  });
});

describe("bootstrap-to-audit composition [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT]", () => {
  it("wires copy_files.sh output into independent audit dimensions [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT]", () => {
    // [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [ARCH-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT] How: Prove bootstrap template emission and audit reporting at the composition boundary.
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-grammar-v2-audit-compose-"));
    const copyScript = path.join(REPO_ROOT, "copy_files.sh");
    try {
      execFileSync("bash", [copyScript, tempDir], { cwd: REPO_ROOT, stdio: "pipe" });
      const report = runGrammarV2DefaultAudit(tempDir);
      assert.equal(report.ok, true, JSON.stringify(report.audit));
      assert.equal(report.dimensions.grammar_v2_header, "pass");
      assert.equal(report.dimensions.layer_b.ok, true);
      assert.equal(report.dimensions.layer_c.gate_mode_applied, true);
      assert.equal(report.dimensions.constraint_flow, false);
      assert.equal(report.dimensions.legacy_v1_compatibility.compatible, true);
      assert.equal(report.audit.ok, true);
      assert.equal(report.audit.dimensions.grammar_v2_header, "pass");
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
