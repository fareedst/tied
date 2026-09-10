import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import { hydrateGateEvidenceFromActivation } from "./checklist-gate-evidence-hydration.js";

// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — W1-D1 auto-hydration from activation artifacts.
describe("hydrateGateEvidenceFromActivation [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]", () => {
  it("loads gate, ledger, and provenance at verification when activation supplies paths", async () => {
    const root = mkdtempSync(path.join(os.tmpdir(), "gate-hydration-"));
    const phaseDir = path.join(
      root,
      "working/REQ-TIED_CHECKLIST_GATE_ENFORCEMENT/adversarial-inquiry/phase-verification",
    );
    mkdirSync(phaseDir, { recursive: true });
    writeFileSync(
      path.join(phaseDir, "evidence-provenance.json"),
      JSON.stringify({ request_token: "REQ-TIED_CHECKLIST_GATE_ENFORCEMENT", phase: "verification" }),
    );
    writeFileSync(
      path.join(phaseDir, "gate-result.json"),
      JSON.stringify({ verdict: "PASS", status: "success" }),
    );
    writeFileSync(path.join(phaseDir, "finding-ledger.jsonl"), "{\"finding\":{\"lifecycle\":\"confirmed\"}}\n");

    const rel = (name: string) =>
      `working/REQ-TIED_CHECKLIST_GATE_ENFORCEMENT/adversarial-inquiry/phase-verification/${name}`;

    const result = await hydrateGateEvidenceFromActivation({
      phase: "verification",
      projectRoot: root,
      activation: {
        artifacts: {
          "evidence-provenance.json": { path: rel("evidence-provenance.json") },
          "gate-result.json": { path: rel("gate-result.json") },
          "finding-ledger.jsonl": { path: rel("finding-ledger.jsonl") },
        },
      },
    });

    assert.deepEqual(result.hydrated.sort(), [
      "evidence-provenance.json",
      "finding-ledger.jsonl",
      "gate-result.json",
    ].sort());
    assert.ok(result.evidence.provenance);
    assert.ok(result.evidence.gateResult);
    assert.equal(typeof result.evidence.findingLedger, "string");
  });

  it("skips hydration at pre_implementation", async () => {
    const result = await hydrateGateEvidenceFromActivation({
      phase: "pre_implementation",
      activation: {
        artifacts: {
          "gate-result.json": { path: "working/REQ-X/adversarial-inquiry/phase-pre_implementation/gate-result.json" },
        },
      },
    });
    assert.deepEqual(result.hydrated, []);
    assert.equal(result.evidence.gateResult, undefined);
  });
});
