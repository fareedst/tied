/**
 * [REQ-VOCABULARY_EXPLORER] [IMPL-VOCABULARY_PROJECTION] view-model unit tests
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import { projectVocabularyExplorerV1, stableTermId } from "./view-model.js";

describe("view-model REQ-VOCABULARY_EXPLORER", () => {
  it("produces deterministic stable term ids", () => {
    const a = stableTermId("tied_token", "req-sample");
    const b = stableTermId("tied_token", "req-sample");
    assert.strictEqual(a, b);
    assert.strictEqual(a.length, 16);
  });

  it("sorts terms by id ascending", () => {
    const envelope = projectVocabularyExplorerV1({
      sourceAnalysis: {
        terms: [
          {
            kind: "source_identifier",
            display: "zebraTerm",
            normalized_key: "zebraterm",
            tied_layer: null,
            occurrences: [
              { path: "a.ts", line: 1, excerpt: "zebraTerm", file_kind: "production" },
              { path: "b.ts", line: 1, excerpt: "zebraTerm", file_kind: "production" },
            ],
            scope_keys: new Set(["a.ts#1:0", "b.ts#1:0"]),
          },
          {
            kind: "tied_token",
            display: "REQ-ALPHA",
            normalized_key: "req-alpha",
            tied_layer: "REQ",
            occurrences: [{ path: "a.ts", line: 2, excerpt: "[REQ-ALPHA]", file_kind: "production" }],
            scope_keys: new Set(["a.ts#2:0"]),
          },
        ],
        truncation: { applied: false, max_terms: 100, dropped_count: 0 },
      },
      tiedCatalog: {
        records: [
          {
            token: "REQ-ALPHA",
            layer: "REQ",
            display: "REQ-ALPHA",
            normalized_key: "req-alpha",
            description: "Alpha requirement",
            ownership: "project",
            relationships: [],
          },
        ],
      },
      walkSummary: {
        roots_used: ["/tmp"],
        default_roots_used: ["/tmp"],
        ignore_source: { type: "inline" },
        skipped_paths_count: 0,
        followed_symlinks: false,
      },
      filesScanned: 2,
      policy: { min_frequency: 2, max_terms: 100, include_extensions: [".ts"] },
      projectRootLabel: "fixture",
      generatedAt: "2026-01-01T00:00:00.000Z",
    });

    assert.strictEqual(envelope.schema, "vocabulary-explorer.v1");
    assert.strictEqual(envelope.generated_at, "2026-01-01T00:00:00.000Z");
    const ids = envelope.terms.map((t) => t.id);
    const sorted = [...ids].sort();
    assert.deepStrictEqual(ids, sorted);
    const alpha = envelope.terms.find((t) => t.display === "REQ-ALPHA");
    assert.ok(alpha);
    assert.strictEqual(alpha?.description, "Alpha requirement");
  });
});
