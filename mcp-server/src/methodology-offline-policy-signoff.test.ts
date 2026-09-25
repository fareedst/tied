/**
 * [IMPL-TIED_METHODOLOGY_CLIENT_BOUNDARY] [REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY] G4 — sign-off receipt validation.
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  METHODOLOGY_OFFLINE_POLICY_SIGNOFF_SCHEMA,
  validateMethodologyOfflinePolicySignoff,
} from "./methodology-offline-policy-signoff.js";

describe("methodology offline policy signoff [REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY] G4", () => {
  it("validates committed example receipt", () => {
    const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
    const receiptPath = path.join(
      repoRoot,
      "working/REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY/evidence/methodology-offline-policy-signoff.v1.json",
    );
    assert.ok(fs.existsSync(receiptPath), `expected example at ${receiptPath}`);
    const parsed = JSON.parse(fs.readFileSync(receiptPath, "utf8"));
    const result = validateMethodologyOfflinePolicySignoff(parsed);
    assert.strictEqual(result.ok, true, result.ok ? "" : result.errors.join("; "));
    if (result.ok) {
      assert.strictEqual(result.receipt.schema, METHODOLOGY_OFFLINE_POLICY_SIGNOFF_SCHEMA);
      assert.strictEqual(result.receipt.request_token, "REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY");
    }
  });

  it("rejects receipt without copy_files retention", () => {
    const result = validateMethodologyOfflinePolicySignoff({
      schema: METHODOLOGY_OFFLINE_POLICY_SIGNOFF_SCHEMA,
      request_token: "REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY",
      signed_at: "2026-09-25",
      signer_role: "program owner",
      policy: { copy_files_refresh_retained: false, bundle_optional: true },
    });
    assert.strictEqual(result.ok, false);
    if (!result.ok) {
      assert.ok(result.errors.some((e) => e.includes("copy_files_refresh_retained")));
    }
  });
});
