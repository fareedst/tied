/**
 * [REQ-TIED_PROCESS_CERTIFICATION_READINESS] [IMPL-TIED_PROCESS_CERTIFICATION_SPEC]
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  defaultBundleRoot,
  loadProcessCertificationBundleV1,
  validateEdseProcessSpecV1,
  validateIso330xxCapabilityModelV1,
} from "./spec-loader.js";

describe("spec-loader [REQ-TIED_PROCESS_CERTIFICATION_READINESS]", () => {
  it("loads committed bundle resources", () => {
    const result = loadProcessCertificationBundleV1(defaultBundleRoot());
    assert.equal(result.ok, true, JSON.stringify(result.diagnostics));
    assert.equal(result.bundle?.spec.clauses.length, 7);
    assert.equal(result.bundle?.mapping.reference_mapping_only, true);
  });

  it("rejects hash mismatch", () => {
    const loaded = loadProcessCertificationBundleV1(defaultBundleRoot());
    assert.equal(loaded.ok, true);
    const bad = { ...loaded.bundle!.spec, content_hash: "deadbeef" };
    const validated = validateEdseProcessSpecV1(bad);
    assert.equal(validated.ok, false);
    assert.ok(validated.diagnostics.some((d) => d.code === "HASH_MISMATCH"));
  });

  it("rejects aggregate score fields on capability model", () => {
    const loaded = loadProcessCertificationBundleV1(defaultBundleRoot());
    const bad = { ...loaded.bundle!.capabilityModel, aggregate_score: 99 };
    const validated = validateIso330xxCapabilityModelV1(bad);
    assert.equal(validated.ok, false);
    assert.ok(validated.diagnostics.some((d) => d.code === "FORBIDDEN_ROLLUP_FIELD"));
  });
});
