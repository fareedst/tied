/**
 * [REQ-VOCABULARY_ANALYSIS] [IMPL-VOCABULARY_ANALYSIS] term-analysis unit tests
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import {
  analyzeSourceTerms,
  buildExcerpt,
  classifyFileKind,
  redactSecrets,
} from "./term-analysis.js";

describe("term-analysis REQ-VOCABULARY_ANALYSIS", () => {
  it("extracts TIED tokens regardless of min_frequency", () => {
    const result = analyzeSourceTerms(
      [{ relPosix: "src/one.ts", text: "const x = '[REQ-SINGLE_TOKEN]';" }],
      { min_frequency: 2, max_terms: 1000, include_extensions: [".ts"] },
    );
    const tied = result.terms.filter((t) => t.kind === "tied_token");
    assert.ok(tied.some((t) => t.display === "REQ-SINGLE_TOKEN"));
  });

  it("applies min_frequency to source identifiers", () => {
    const result = analyzeSourceTerms(
      [
        { relPosix: "src/a.ts", text: "const widgetHandler = 1;" },
        { relPosix: "src/b.ts", text: "function widgetHandler() {}" },
        { relPosix: "src/c.ts", text: "const uniqueOnce = true;" },
      ],
      { min_frequency: 2, max_terms: 1000, include_extensions: [".ts"] },
    );
    const ids = result.terms.filter((t) => t.kind === "source_identifier").map((t) => t.display);
    assert.ok(ids.includes("widgetHandler"));
    assert.ok(!ids.includes("uniqueOnce"));
  });

  it("rejects stop words and reserved words", () => {
    const result = analyzeSourceTerms(
      [
        { relPosix: "a.ts", text: "const the = 1; return export class function;" },
        { relPosix: "b.ts", text: "const the = 2; return export class function;" },
      ],
      { min_frequency: 1, max_terms: 1000, include_extensions: [".ts"] },
    );
    const ids = result.terms.map((t) => t.display);
    assert.ok(!ids.includes("the"));
    assert.ok(!ids.includes("return"));
  });

  it("redacts secret patterns in excerpts", () => {
    const redacted = redactSecrets("api_key: super-secret-value");
    assert.match(redacted, /\[REDACTED\]/);
    assert.ok(!redacted.includes("super-secret-value"));
  });

  it("caps excerpt length at 240 characters", () => {
    const longLine = "x".repeat(300);
    const excerpt = buildExcerpt([longLine], 0);
    assert.ok(excerpt.length <= 240);
  });

  it("truncates terms deterministically when max_terms exceeded", () => {
    const files = [];
    for (let i = 0; i < 10; i++) {
      files.push({
        relPosix: `src/a${i}.ts`,
        text: `const term${i} = 1; const sharedTerm = 1;`,
      });
      files.push({
        relPosix: `src/b${i}.ts`,
        text: `const term${i} = 2; const sharedTerm = 2;`,
      });
    }
    const result = analyzeSourceTerms(files, {
      min_frequency: 2,
      max_terms: 3,
      include_extensions: [".ts"],
    });
    assert.strictEqual(result.truncation.applied, true);
    assert.strictEqual(result.terms.length, 3);
    assert.ok(result.truncation.dropped_count > 0);
  });

  it("classifies test files via path heuristics", () => {
    assert.strictEqual(classifyFileKind("src/foo.test.ts"), "test");
    assert.strictEqual(classifyFileKind("src/production.ts"), "production");
    assert.strictEqual(classifyFileKind("tied/methodology/x.ts"), "methodology");
  });

  it("AST mode ignores comment-only identifiers", () => {
    const result = analyzeSourceTerms(
      [
        { relPosix: "src/a.ts", text: "/** fixture shared identifier */\nexport function widgetHandler() {}" },
        { relPosix: "src/b.ts", text: "/** shared widgetHandler */\nexport const widgetHandler = 1;" },
      ],
      { min_frequency: 2, max_terms: 1000, include_extensions: [".ts"], identifier_mode: "ast" },
    );
    const ids = result.terms.filter((t) => t.kind === "source_identifier").map((t) => t.display);
    assert.ok(ids.includes("widgetHandler"));
    assert.ok(!ids.includes("shared"));
  });
});
