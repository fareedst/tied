/**
 * [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION] [ARCH-PSEUDOCODE_FLEET_MIGRATION_GOVERNANCE]
 * [REQ-REQUEST_EVIDENCE_ENVELOPE] — P5-G FEAT-spawned checklist policy validator tests.
 */
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { validateFeatSpawnedEnvelopePolicy } from "./lib/validate-feat-spawned-envelope-policy.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");

describe("validateFeatSpawnedEnvelopePolicy [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION]", () => {
  it("passes Phase 5 FEAT-spawned checklist template", () => {
    const checklistPath = path.join(
      REPO_ROOT,
      "templates/agent-req-checklist-feat-spawned-phase5.v1.yaml",
    );
    const result = validateFeatSpawnedEnvelopePolicy(checklistPath);
    assert.equal(result.ok, true, JSON.stringify(result.violations));
  });

  it("fails when depth_tier is not integrated", () => {
    const checklistPath = path.join(
      REPO_ROOT,
      "scripts/fixtures/feat-spawned-envelope-policy-bad-depth.v1.yaml",
    );
    const result = validateFeatSpawnedEnvelopePolicy(checklistPath);
    assert.equal(result.ok, false);
    assert.ok(result.violations.some((v) => v.code === "depth_tier_not_integrated"));
  });
});
