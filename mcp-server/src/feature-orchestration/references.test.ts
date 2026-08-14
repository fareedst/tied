import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveCanonicalReferences, type CanonicalIndexes } from "./references.js";

const indexes: CanonicalIndexes = {
  requirements: { "REQ-FEAT_MANIFEST_SCHEMA": { name: "Manifest" } },
  architecture: { "ARCH-FEAT_MANIFEST_CONTRACT": { name: "Manifest architecture" } },
  implementations: { "IMPL-FEAT_MANIFEST_VALIDATOR": { name: "Manifest validator" } },
};

describe("CANONICAL_REFERENCE_LINKER REQ-FEAT_CANONICAL_LINKS", () => {
  // [IMPL-FEAT_REFERENCE_LINKER] [ARCH-FEAT_CANONICAL_LINK_BOUNDARY] [REQ-FEAT_CANONICAL_LINKS] — How: resolve references, enforce token type, and validate the REQ→ARCH→IMPL graph.
  it("resolves typed references without mutating canonical indexes", () => {
    const result = resolveCanonicalReferences(
      [
        { token: "REQ-FEAT_MANIFEST_SCHEMA", layer: "requirements" },
        { token: "ARCH-FEAT_MANIFEST_CONTRACT", layer: "architecture" },
        { token: "IMPL-FEAT_MANIFEST_VALIDATOR", layer: "implementations" },
      ],
      indexes
    );
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.links.length, 3);
    assert.deepEqual(indexes.requirements["REQ-FEAT_MANIFEST_SCHEMA"], { name: "Manifest" });
  });

  it("reports dangling, duplicate, wrong-type, and inconsistent-graph references", () => {
    assert.equal(resolveCanonicalReferences([{ token: "REQ-MISSING", layer: "requirements" }], indexes).error?.category, "DANGLING_REFERENCE");
    assert.equal(
      resolveCanonicalReferences(
        [
          { token: "REQ-FEAT_MANIFEST_SCHEMA", layer: "requirements" },
          { token: "REQ-FEAT_MANIFEST_SCHEMA", layer: "requirements" },
        ],
        indexes
      ).error?.category,
      "DUPLICATE_REFERENCE"
    );
    assert.equal(
      resolveCanonicalReferences([{ token: "REQ-FEAT_MANIFEST_SCHEMA", layer: "architecture" }], indexes).error?.category,
      "WRONG_TOKEN_TYPE"
    );
    assert.equal(
      resolveCanonicalReferences(
        [
          { token: "REQ-FEAT_MANIFEST_SCHEMA", layer: "requirements" },
          { token: "IMPL-FEAT_MANIFEST_VALIDATOR", layer: "implementations" },
        ],
        indexes
      ).error?.category,
      "INCONSISTENT_GRAPH"
    );
  });
});
