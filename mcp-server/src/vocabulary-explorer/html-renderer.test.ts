/**
 * [REQ-VOCABULARY_EXPLORER] [IMPL-VOCABULARY_HTML_RENDERER] html-renderer unit tests
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import {
  escapeHtml,
  renderVocabularyExplorerHtml,
  scriptSafeJson,
} from "./html-renderer.js";
import type { VocabularyExplorerV1Envelope } from "./view-model.js";

const FIXTURE_ENVELOPE: VocabularyExplorerV1Envelope = {
  schema: "vocabulary-explorer.v1",
  generated_at: "2026-01-01T00:00:00.000Z",
  project_root_label: "hostile-fixture",
  proof_boundary: "offline_navigation_aid",
  walk_summary: {
    roots_used: ["src"],
    files_scanned: 1,
    skipped_paths_count: 0,
    truncation: { applied: false, max_terms: 100, dropped_count: 0 },
  },
  policy: { min_frequency: 2, max_terms: 100, include_extensions: [".ts"], identifier_mode: "ast" },
  terms: [
    {
      id: "deadbeefdeadbeef",
      kind: "source_identifier",
      display: "</script><img onerror=alert(1)>",
      normalized_key: "hostile",
      frequency: 2,
      ownership: "n/a",
      tied_layer: null,
      description: "password: [REDACTED]",
      relationships: [],
      occurrences: [
        {
          path: "src/hostile.ts",
          line: 1,
          excerpt: "const x = '</script>';",
          file_kind: "production",
        },
      ],
    },
  ],
  filters_catalog: { directories: ["src"], languages: ["typescript"], file_kinds: ["production"] },
  views_catalog: ["frequency", "relationships", "semantic_tokens"],
};

describe("html-renderer REQ-VOCABULARY_EXPLORER", () => {
  it("escapes hostile HTML in text nodes", () => {
    assert.strictEqual(escapeHtml("<script>"), "&lt;script&gt;");
  });

  it("embeds JSON without raw script-breaking sequences", () => {
    const payload = scriptSafeJson({ x: "</script>" });
    assert.ok(!payload.includes("</script>"));
    assert.ok(payload.includes("\\u003c"));
  });

  it("produces byte-stable HTML for fixed envelope", () => {
    const html1 = renderVocabularyExplorerHtml(FIXTURE_ENVELOPE);
    const html2 = renderVocabularyExplorerHtml(FIXTURE_ENVELOPE);
    assert.strictEqual(html1, html2);
    assert.ok(html1.includes("Generated view — navigation aid only"));
    assert.ok(!html1.includes("<img onerror=alert(1)>"));
    assert.ok(!html1.match(/<\/script><img/));
  });

  it("rejects invalid envelope schema", () => {
    assert.throws(
      () =>
        renderVocabularyExplorerHtml({
          ...FIXTURE_ENVELOPE,
          schema: "wrong" as "vocabulary-explorer.v1",
        }),
      /InvalidEnvelope/,
    );
  });
});
