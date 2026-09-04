/**
 * [REQ-VOCABULARY_EXPLORER] [ARCH-VOCABULARY_OFFLINE_VIEW] offline HTML smoke tests
 */

import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runVocabularyExplorer } from "./pipeline.js";
import { clearBasePathCache } from "../yaml-loader.js";
import { decodeViewerFragment, encodeViewerFragment } from "./state.js";

const mcpServerRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const fixtureRoot = path.resolve(
  mcpServerRoot,
  "test/fixtures/vocabulary-explorer/mini-project",
);

function extractEmbeddedEnvelope(html: string): unknown {
  const match = html.match(
    /<script type="application\/json" id="vocabulary-data">([\s\S]*?)<\/script>/,
  );
  assert.ok(match, "embedded vocabulary-data script must exist");
  return JSON.parse(match[1]);
}

describe("vocabulary-explorer offline HTML smoke [REQ-VOCABULARY_EXPLORER]", () => {
  let origCwd: string;
  let origEnv: string | undefined;

  beforeEach(() => {
    origCwd = process.cwd();
    origEnv = process.env.TIED_BASE_PATH;
    process.chdir(fixtureRoot);
    process.env.TIED_BASE_PATH = path.join(fixtureRoot, "tied");
    clearBasePathCache();
  });

  afterEach(() => {
    process.chdir(origCwd);
    if (origEnv === undefined) delete process.env.TIED_BASE_PATH;
    else process.env.TIED_BASE_PATH = origEnv;
    clearBasePathCache();
  });

  it("produces self-contained HTML suitable for file:// opening", () => {
    const fixedAt = "2026-06-01T12:00:00.000Z";
    const result = runVocabularyExplorer({
      min_frequency: 2,
      max_terms: 500,
      generated_at: fixedAt,
      identifier_mode: "ast",
    });
    assert.strictEqual(result.ok, true);
    const html = result.html!;
    assert.match(html, /^<!DOCTYPE html>/);
    assert.match(html, /Generated view — navigation aid only/);
    assert.match(html, /offline_navigation_aid/);
    assert.match(html, /id="term-list"/);
    assert.match(html, /id="detail-panel"/);
    assert.match(html, /id="occurrences-panel"/);
    assert.match(html, /occurrences-column/);
    assert.match(html, /occ-list/);
    assert.match(html, /id="filters"/);
    assert.match(html, /id="breadcrumbs"/);
    assert.match(html, /id="vocabulary-data"/);
    assert.match(html, /parseHash/);
    assert.match(html, /popstate/);
    assert.doesNotMatch(html, /src="https?:\/\//);
    assert.doesNotMatch(html, /href="https?:\/\//);

    const embedded = extractEmbeddedEnvelope(html) as { schema: string; generated_at: string };
    assert.strictEqual(embedded.schema, "vocabulary-explorer.v1");
    assert.strictEqual(embedded.generated_at, fixedAt);

    const tmpDir = fs.mkdtempSync(path.join(mcpServerRoot, "test/tmp-vocab-smoke-"));
    try {
      const artifact = path.join(tmpDir, "vocabulary-explorer.html");
      fs.writeFileSync(artifact, html, "utf8");
      const reread = fs.readFileSync(artifact, "utf8");
      assert.strictEqual(reread, html);
      assert.ok(reread.length > 1000, "artifact must be substantial single file");
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("fragment encode/decode round-trips selection and filters for viewer script contract", () => {
    const state = {
      q: "widget",
      sel: "abc123",
      kind: "source_identifier",
      dir: "src",
      fk: "production",
      lang: "typescript",
      prod: "production",
      minf: "2",
      view: "relationships",
    };
    const fragment = encodeViewerFragment(state);
    const restored = decodeViewerFragment(fragment);
    assert.deepStrictEqual(restored, state);
  });
});
