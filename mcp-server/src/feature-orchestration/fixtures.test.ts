import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validateFixtureCorpus, type FixtureCase } from "./fixtures.js";
import { validateManifest } from "./manifest.js";

const validManifest = {
  schema_version: "feature-manifest.v1",
  feature_id: "FEAT-003",
  slug: "chat-system",
  title: "Chat",
  mode: "greenfield",
  status: "draft",
  revision: 1,
  created_at: "2026-08-13T12:00:00.000Z",
  updated_at: "2026-08-13T12:00:00.000Z",
  canonical_tokens: { requirements: [], architecture: [], implementations: [] },
};

describe("FIXTURE_CORPUS REQ-FEAT_FIXTURE_VALIDATION", () => {
  // [IMPL-FEAT_FIXTURE_VALIDATORS] [ARCH-FEAT_FIXTURE_CORPUS] [REQ-FEAT_FIXTURE_VALIDATION] — How: execute each fixture against its isolated validator and compare deterministic evidence.
  it("validates the required representative scenarios deterministically", () => {
    const fixtures: FixtureCase[] = [
      { name: "greenfield", owner: "manifest", input: validManifest, expected: { ok: true } },
      { name: "brownfield", owner: "manifest", input: { ...validManifest, mode: "brownfield" }, expected: { ok: true } },
      { name: "unsupported-version", owner: "manifest", input: { ...validManifest, schema_version: "feature-manifest.v2" }, expected: { ok: false, category: "UNSUPPORTED_VERSION" } },
      { name: "partial-write", owner: "manifest", input: { ...validManifest, revision: 0 }, expected: { ok: false, category: "INVALID_IDENTITY" } },
      { name: "ambiguous", owner: "manifest", input: { ...validManifest, slug: "not safe" }, expected: { ok: false, category: "INVALID_IDENTITY" } },
      { name: "multi-module", owner: "manifest", input: { ...validManifest, dependencies: ["module-a", "module-b"] }, expected: { ok: true } },
      { name: "multi-approach", owner: "manifest", input: { ...validManifest, tasks: ["approach-a", "approach-b"] }, expected: { ok: true } },
      { name: "stale-view", owner: "manifest", input: { ...validManifest, updated_at: "2026-08-12T12:00:00.000Z" }, expected: { ok: true } },
      { name: "migration", owner: "manifest", input: { ...validManifest, revision: 2 }, expected: { ok: true } },
      { name: "invalid-reference", owner: "manifest", input: { ...validManifest, canonical_tokens: { requirements: ["bad"], architecture: [], implementations: [] } }, expected: { ok: false, category: "INVALID_REFERENCE_SHAPE" } },
    ];
    const result = validateFixtureCorpus(fixtures, { manifest: (input) => validateManifest(input) });
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.coverage_report?.missing.length, 0);
  });

  it("rejects missing scenarios and unexpected outcomes", () => {
    const missing = validateFixtureCorpus(
      [{ name: "greenfield", owner: "manifest", input: validManifest, expected: { ok: true } }],
      { manifest: (input) => validateManifest(input) }
    );
    assert.deepEqual(missing, { ok: false, error: { category: "MISSING_SCENARIO", scenario: "brownfield" } });
  });
});
