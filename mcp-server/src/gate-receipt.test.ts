/**
 * Tests for gate receipt persistence.
 * [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT]
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

import {
  computeInputHashes,
  persistGateDecisionReceipt,
  persistStatusMutationReceipt,
} from "./gate-receipt.js";
import { stableHash } from "./checklist-validator.js";

describe("persistGateDecisionReceipt [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]", () => {
  it("writes gate receipt with tracker_hash and citdp_hash (A17)", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "gate-receipt-"));
    const gatesDir = path.join(dir, "gates");
    const ledgerPath = path.join(dir, "adherence", "events.jsonl");
    const tracker = { steps: [{ slug: "verification-gate", disposition: "completed" }] };
    const citdp = { risk_analysis: { adversarial_inquiry: { depth_tier: "minimal" } } };
    const gateResult = { allowed: true, diagnostics: [], depth: "minimal", phase: "verification" as const };

    const result = persistGateDecisionReceipt({
      gateResult,
      phase: "verification",
      tracker,
      citdp,
      gatesDir,
      ledgerPath,
      requestToken: "REQ-TIED_CHECKLIST_GATE_ENFORCEMENT",
    });

    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.ok(fs.existsSync(result.path));
    const receipt = JSON.parse(fs.readFileSync(result.path, "utf8")) as Record<string, unknown>;
    const inputHashes = receipt.input_hashes as Record<string, string>;
    assert.ok(inputHashes.tracker_hash.startsWith("sha256:"));
    assert.ok(inputHashes.citdp_hash.startsWith("sha256:"));
    assert.equal(inputHashes.tracker_hash, `sha256:${stableHash(tracker)}`);
    assert.equal(inputHashes.citdp_hash, `sha256:${stableHash(citdp)}`);
    assert.equal(receipt.allowed, true);
    assert.equal(receipt.phase, "verification");

    const ledgerLines = fs.readFileSync(ledgerPath, "utf8").trim().split("\n");
    const gateRow = JSON.parse(ledgerLines[0]!) as Record<string, unknown>;
    assert.equal(gateRow.event_class, "gate_decided");
    assert.equal(gateRow.artifact_ref, result.path);
    assert.equal(gateRow.artifact_hash, result.hash);
  });
});

describe("persistStatusMutationReceipt [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]", () => {
  it("rejects mutation when gate_receipt_ref missing", () => {
    const result = persistStatusMutationReceipt({
      ledgerPath: "/tmp/unused.jsonl",
      requestToken: "REQ-TIED_CHECKLIST_GATE_ENFORCEMENT",
      mutations: [{
        index: "requirements",
        token: "REQ-ONE",
        previous_status: "Planned",
        next_status: "Implemented",
      }],
      gateReceiptRef: "",
      gateReceiptHash: "",
      mutationApplied: true,
    });
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.ok(result.diagnostics.includes("missing_gate_receipt_ref"));
  });

  it("returns verify_no_op for empty mutations", () => {
    const result = persistStatusMutationReceipt({
      ledgerPath: "/tmp/unused.jsonl",
      requestToken: "REQ-TIED_CHECKLIST_GATE_ENFORCEMENT",
      mutations: [],
      gateReceiptRef: "gates/test.json",
      gateReceiptHash: "sha256:abc",
      mutationApplied: false,
    });
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.ok(result.diagnostics.includes("verify_no_op"));
  });
});

describe("computeInputHashes [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]", () => {
  it("produces stable sha256-prefixed hashes", () => {
    const tracker = { name: "stage-j" };
    const citdp = { title: "stage-j" };
    const first = computeInputHashes(tracker, citdp);
    const second = computeInputHashes(tracker, citdp);
    assert.deepEqual(first, second);
    assert.match(first.tracker_hash, /^sha256:[a-f0-9]{64}$/);
    assert.match(first.citdp_hash, /^sha256:[a-f0-9]{64}$/);
  });
});
