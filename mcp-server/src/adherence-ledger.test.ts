/**
 * Tests for adherence ledger gate_decided and status_mutated append helpers.
 * [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT]
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

import {
  ADHERENCE_EVENT_SCHEMA_VERSION,
  appendGateDecided,
  appendStatusMutated,
} from "./adherence-ledger.js";

function readLastLedgerRow(ledgerPath: string): Record<string, unknown> {
  const lines = fs.readFileSync(ledgerPath, "utf8").trim().split("\n").filter(Boolean);
  assert.ok(lines.length > 0, "ledger must have rows");
  return JSON.parse(lines[lines.length - 1]!) as Record<string, unknown>;
}

describe("appendGateDecided [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]", () => {
  it("appends gate_decided row with artifact_ref and artifact_hash", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "adherence-gate-decided-"));
    const ledgerPath = path.join(dir, "events.jsonl");
    appendGateDecided(
      ledgerPath,
      { request_token: "REQ-TIED_CHECKLIST_GATE_ENFORCEMENT", phase: "verification" },
      path.join(dir, "gates", "verification-test.json"),
      "sha256:abc123",
    );
    const row = readLastLedgerRow(ledgerPath);
    assert.equal(row.schema_version, ADHERENCE_EVENT_SCHEMA_VERSION);
    assert.equal(row.event_class, "gate_decided");
    assert.equal(row.artifact_ref, path.join(dir, "gates", "verification-test.json"));
    assert.equal(row.artifact_hash, "sha256:abc123");
    const correlation = row.correlation as Record<string, unknown>;
    assert.equal(correlation.request_token, "REQ-TIED_CHECKLIST_GATE_ENFORCEMENT");
    assert.equal(correlation.phase, "verification");
  });
});

describe("appendStatusMutated [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]", () => {
  it("appends status_mutated row with gate_receipt_ref and token diffs", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "adherence-status-mutated-"));
    const ledgerPath = path.join(dir, "events.jsonl");
    const gateRef = path.join(dir, "gates", "verification-test.json");
    appendStatusMutated(
      ledgerPath,
      { request_token: "REQ-TIED_CHECKLIST_GATE_ENFORCEMENT", phase: "verification" },
      [{
        index: "requirements",
        token: "REQ-ONE",
        previous_status: "Planned",
        next_status: "Implemented",
      }],
      gateRef,
      "sha256:gatehash",
    );
    const row = readLastLedgerRow(ledgerPath);
    assert.equal(row.event_class, "status_mutated");
    assert.equal(row.gate_receipt_ref, gateRef);
    assert.equal(row.gate_receipt_hash, "sha256:gatehash");
    const mutations = row.status_mutations as Array<Record<string, unknown>>;
    assert.equal(mutations.length, 1);
    assert.equal(mutations[0]!.token, "REQ-ONE");
    assert.equal(mutations[0]!.next_status, "Implemented");
  });
});
