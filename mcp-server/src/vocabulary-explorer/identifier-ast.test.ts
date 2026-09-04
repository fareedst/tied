/**
 * [REQ-VOCABULARY_ANALYSIS] [IMPL-VOCABULARY_ANALYSIS] AST identifier extraction tests
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import { extractAstIdentifiers, isAstExtractableExtension } from "./identifier-ast.js";

describe("identifier-ast REQ-VOCABULARY_ANALYSIS", () => {
  it("detects AST-capable extensions", () => {
    assert.strictEqual(isAstExtractableExtension(".ts"), true);
    assert.strictEqual(isAstExtractableExtension(".md"), false);
  });

  it("extracts function and variable declaration names", () => {
    const hits = extractAstIdentifiers(
      `export function widgetHandler(): string {
  return "alpha";
}
export const uniqueBeta = true;`,
      "src/alpha.ts",
    );
    const names = hits.map((h) => h.display);
    assert.ok(names.includes("widgetHandler"));
    assert.ok(names.includes("uniqueBeta"));
    assert.ok(!names.includes("string"));
    assert.ok(!names.includes("alpha"));
  });

  it("extracts property access member names", () => {
    const hits = extractAstIdentifiers(
      `const value = obj.widgetHandler;
const other = ns.deepHandler;`,
      "src/use.ts",
    );
    const names = hits.map((h) => h.display);
    assert.ok(names.includes("widgetHandler"));
    assert.ok(names.includes("deepHandler"));
  });

  it("returns empty for non-AST extensions", () => {
    const hits = extractAstIdentifiers("# widgetHandler in markdown", "docs/readme.md");
    assert.deepStrictEqual(hits, []);
  });
});
