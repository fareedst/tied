/**
 * [REQ-VOCABULARY_EXPLORER] [IMPL-VOCABULARY_ANALYSIS] composition tests
 */

import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { collectScopedSourceFiles, runScopedAnalysis } from "../analysis/scoped-analysis.js";
import { runVocabularyExplorer } from "./pipeline.js";
import { clearBasePathCache } from "../yaml-loader.js";

const mcpServerRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const fixtureRoot = path.resolve(
  mcpServerRoot,
  "test/fixtures/vocabulary-explorer/mini-project",
);
const repoRoot = path.resolve(mcpServerRoot, "..");

function sha256(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

describe("vocabulary-explorer composition REQ-VOCABULARY_EXPLORER", () => {
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

  it("collectScopedSourceFiles matches walk_summary file set", () => {
    const collected = collectScopedSourceFiles({});
    const summary = runScopedAnalysis({ mode: "walk_summary" });
    assert.strictEqual(collected.ok, true);
    assert.strictEqual(summary.ok, true);
    const collectedRel = collected.files.map((f) => f.relPosix).sort();
    const summaryRel = (summary.files_scanned ?? []).map((p) => p.split(path.sep).join("/")).sort();
    assert.deepStrictEqual(collectedRel, summaryRel);
  });

  it("pipeline produces deterministic envelope and HTML for fixture", () => {
    const fixedAt = "2026-06-01T12:00:00.000Z";
    const result = runVocabularyExplorer({
      min_frequency: 2,
      max_terms: 500,
      generated_at: fixedAt,
      identifier_mode: "ast",
    });
    assert.strictEqual(result.ok, true);
    assert.ok(result.envelope);
    assert.ok(result.html);
    assert.strictEqual(result.envelope!.generated_at, fixedAt);
    assert.ok(result.envelope!.terms.some((t) => t.display === "widgetHandler"));
    assert.ok(result.envelope!.terms.some((t) => t.display === "REQ-TIED_SETUP"));

    const jsonText = `${JSON.stringify(result.envelope, null, 2)}\n`;
    const htmlHash = sha256(result.html!);
    const jsonHash = sha256(jsonText);

    const expectedDir = path.join(mcpServerRoot, "test/fixtures/vocabulary-explorer/expected");
    fs.mkdirSync(expectedDir, { recursive: true });
    const jsonGolden = path.join(expectedDir, "envelope.json");
    const hashGolden = path.join(expectedDir, "hashes.json");

    if (!fs.existsSync(jsonGolden)) {
      fs.writeFileSync(jsonGolden, jsonText, "utf8");
      fs.writeFileSync(
        hashGolden,
        `${JSON.stringify({ jsonSha256: jsonHash, htmlSha256: htmlHash }, null, 2)}\n`,
        "utf8",
      );
    }

    const expectedJson = fs.readFileSync(jsonGolden, "utf8");
    assert.strictEqual(jsonText, expectedJson, "envelope JSON must match golden");

    const hashes = JSON.parse(fs.readFileSync(hashGolden, "utf8")) as {
      jsonSha256: string;
      htmlSha256: string;
    };
    assert.strictEqual(jsonHash, hashes.jsonSha256);
    assert.strictEqual(htmlHash, hashes.htmlSha256);
  });
});
