/**
 * [IMPL-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP] [ARCH-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP] [REQ-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP]
 * RED/GREEN unit tests for block-lead detection and normalization.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import {
  REPO_ROOT,
  buildInventory,
  normalizeSidecarBlockLeads,
  scanBlockLeadPlacement,
  sidecarPathForToken,
} from "./lib/normalize-sidecar-block-leads.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_DIR = path.join(REPO_ROOT, "scripts", "fixtures", "block-lead-sweep");

describe("normalize-sidecar-block-leads detection [REQ-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP]", () => {
  it("detects external-only block-leads above procedure headings [IMPL-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP]", () => {
    // [IMPL-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP] [ARCH-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP] [REQ-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP] How: Mirror pseudocode-shared external tokenScanStart bounds.
    const fixturePath = path.join(FIXTURE_DIR, "external-only.sidecar.md");
    const content = fs.readFileSync(fixturePath, "utf8");
    const placement = scanBlockLeadPlacement(content);
    assert.equal(placement.external_only.length, 1);
    assert.equal(placement.external_only[0]?.procedure, "MAIN");
    assert.match(placement.external_only[0]?.line ?? "", /How: external lead must move inside/);
    assert.equal(placement.inter_procedure.length, 0);
  });

  it("detects inter-procedure block-leads in procedure gaps [IMPL-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP]", () => {
    // [IMPL-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP] [ARCH-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP] [REQ-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP] How: Mirror pseudocode-shared tokenScanEnd trimming for prior procedure.
    const fixturePath = path.join(FIXTURE_DIR, "inter-procedure.sidecar.md");
    const content = fs.readFileSync(fixturePath, "utf8");
    const placement = scanBlockLeadPlacement(content);
    assert.equal(placement.inter_procedure.length, 1);
    assert.equal(placement.inter_procedure[0]?.from_procedure, "FIRST");
    assert.equal(placement.inter_procedure[0]?.to_procedure, "SECOND");
    assert.equal(placement.external_only.length, 1);
    assert.equal(placement.external_only[0]?.procedure, "SECOND");
  });
});

describe("normalize-sidecar-block-leads normalization [REQ-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP]", () => {
  it("moves external-only leads inside the owning procedure before Contract [IMPL-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP]", () => {
    // [IMPL-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP] [ARCH-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP] [REQ-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP] How: Preserve verbatim lead text while relocating placement.
    const fixturePath = path.join(FIXTURE_DIR, "external-only.sidecar.md");
    const before = fs.readFileSync(fixturePath, "utf8");
    const after = normalizeSidecarBlockLeads(before);
    const placement = scanBlockLeadPlacement(after);
    assert.equal(placement.external_only.length, 0);
    assert.equal(placement.inter_procedure.length, 0);
    const lines = after.split("\n");
    const procIndex = lines.findIndex((line) => /^procedure MAIN:/.test(line));
    assert.ok(procIndex >= 0);
    assert.match(lines[procIndex + 1] ?? "", /^# \[IMPL-FIXTURE-EXTERNAL\]/);
    assert.match(lines[procIndex + 2] ?? "", /^  Contract:/);
  });

  it("moves inter-procedure leads to the next procedure internal slot [IMPL-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP]", () => {
    // [IMPL-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP] [ARCH-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP] [REQ-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP] How: Relocate gap leads to the following procedure body start.
    const fixturePath = path.join(FIXTURE_DIR, "inter-procedure.sidecar.md");
    const before = fs.readFileSync(fixturePath, "utf8");
    const after = normalizeSidecarBlockLeads(before);
    const placement = scanBlockLeadPlacement(after);
    assert.equal(placement.external_only.length, 0);
    assert.equal(placement.inter_procedure.length, 0);
    const lines = after.split("\n");
    const secondIndex = lines.findIndex((line) => /^procedure SECOND:/.test(line));
    assert.ok(secondIndex >= 0);
    assert.match(lines[secondIndex + 1] ?? "", /^# \[IMPL-FIXTURE-INTER\]/);
    assert.match(lines[secondIndex + 2] ?? "", /^\s*Contract:/);
  });

  it("reports zero leaks after normalization on fixtures [IMPL-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP]", () => {
    // [IMPL-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP] [ARCH-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP] [REQ-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP] How: Inventory JSON is the wave gate proof artifact.
    const fixturePaths = [
      path.join(FIXTURE_DIR, "external-only.sidecar.md"),
      path.join(FIXTURE_DIR, "inter-procedure.sidecar.md"),
    ];
    let externalTotal = 0;
    let interTotal = 0;
    for (const fixturePath of fixturePaths) {
      const normalized = normalizeSidecarBlockLeads(fs.readFileSync(fixturePath, "utf8"));
      const placement = scanBlockLeadPlacement(normalized);
      externalTotal += placement.external_only.length;
      interTotal += placement.inter_procedure.length;
    }
    assert.equal(externalTotal, 0);
    assert.equal(interTotal, 0);
  });
});

describe("normalize-sidecar-block-leads wave resolution [REQ-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP]", () => {
  it("resolves B1 pilot sidecar paths by IMPL token [IMPL-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP]", () => {
    // [IMPL-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP] [ARCH-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP] [REQ-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP] How: Wave lists use exact IMPL token names from the hygiene plan.
    const checklistPath = sidecarPathForToken("IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT");
    assert.ok(fs.existsSync(checklistPath));
  });
});
