/**
 * [REQ-PSEUDOCODE_MIGRATION_TOOLING] Unit tests — G3 fleet receipt defaults.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildConstraintMigrationReceipt,
  DEFAULT_G3_FLEET_OPTIONS,
  fleetReceiptContext,
} from "./constraint-migration-receipt.ts";

test("DEFAULT_G3_FLEET_OPTIONS is advisory constraint gate", () => {
  assert.equal(DEFAULT_G3_FLEET_OPTIONS.constraint_gate_errors, false);
  assert.equal(DEFAULT_G3_FLEET_OPTIONS.constraint_flow, true);
  assert.equal(DEFAULT_G3_FLEET_OPTIONS.typed_flow, true);
});

test("fleetReceiptContext sets G3 advisory orchestrator fields", () => {
  const ctx = fleetReceiptContext("/tmp/x.md", "IMPL-TEST");
  assert.equal(ctx.gate_stage, "G3");
  assert.equal(ctx.program_gate_policy, "advisory");
});

test("buildConstraintMigrationReceipt uses G3 from fleetReceiptContext", () => {
  const report = {
    ok: true,
    grammar_version: "pseudocode-grammar.v2",
    input_identity: { algorithm: "sha256" as const, hash: "abc", byte_length: 3 },
  };
  const receipt = buildConstraintMigrationReceipt(
    report,
    fleetReceiptContext("tied/implementation-decisions/IMPL-TEST-pseudocode.md", "IMPL-TEST"),
    DEFAULT_G3_FLEET_OPTIONS,
  );
  assert.equal(receipt.receipt_meta.gate_stage, "G3");
  assert.equal(receipt.receipt_meta.program_gate_policy, "advisory");
  assert.equal(receipt.layer_c.constraint_flow, true);
  assert.equal(receipt.layer_c.typed_flow, true);
});
