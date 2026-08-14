import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validateManifest, type FeatureManifest } from "./manifest.js";

describe("MANIFEST_SCHEMA_CONTRACT REQ-FEAT_MANIFEST_SCHEMA", () => {
  // [IMPL-FEAT_MANIFEST_VALIDATOR] [ARCH-FEAT_MANIFEST_CONTRACT] [REQ-FEAT_MANIFEST_SCHEMA] — How: enforce version, identity, mode, lifecycle, references, revision, and ownership.
  it("accepts and deterministically normalizes a reference-only manifest", () => {
    const result = validateManifest({
      schema_version: "feature-manifest.v1",
      feature_id: "FEAT-003",
      slug: "chat-system",
      title: "Real-time chat system",
      mode: "greenfield",
      status: "specified",
      revision: 1,
      created_at: "2026-08-13T12:00:00.000Z",
      updated_at: "2026-08-13T12:00:00.000Z",
      canonical_tokens: {
        requirements: ["REQ-FEAT_MANIFEST_SCHEMA"],
        architecture: ["ARCH-FEAT_MANIFEST_CONTRACT"],
        implementations: ["IMPL-FEAT_MANIFEST_VALIDATOR"],
      },
      artifacts: [],
      open_questions: [],
      dependencies: [],
      tasks: [],
      history: [],
    });

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.deepEqual(result.manifest.canonical_tokens, {
        requirements: ["REQ-FEAT_MANIFEST_SCHEMA"],
        architecture: ["ARCH-FEAT_MANIFEST_CONTRACT"],
        implementations: ["IMPL-FEAT_MANIFEST_VALIDATOR"],
      });
    }
  });

  it("rejects unsupported versions, embedded canonical bodies, and invalid references", () => {
    const base = {
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
    assert.equal(validateManifest({ ...base, schema_version: "feature-manifest.v2" }).error?.category, "UNSUPPORTED_VERSION");
    assert.equal(validateManifest({ ...base, title: { body: "copied record" } }).error?.category, "EMBEDDED_CANONICAL_BODY");
    assert.equal(
      validateManifest({ ...base, canonical_tokens: { requirements: ["not-a-token"], architecture: [], implementations: [] } }).error?.category,
      "INVALID_REFERENCE_SHAPE"
    );
  });
});
