/**
 * [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_BOOTSTRAP_DETAIL_INTEGRITY] [REQ-TIED_SETUP]
 * Unit tests for usable detail_file classification and path boundary resolution.
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import path from "node:path";
import { isUsableDetailFilePath, resolveDetailFileUnderBase } from "./detail-file-path.js";

describe("isUsableDetailFilePath", () => {
  it("treats sentinel and empty values as absent", () => {
    for (const value of [null, undefined, "", "   ", "null", "~", "\tnull\t"]) {
      assert.strictEqual(isUsableDetailFilePath(value), false, String(value));
    }
  });

  it("accepts real relative paths", () => {
    assert.strictEqual(isUsableDetailFilePath("requirements/REQ-TIED_SETUP.yaml"), true);
    assert.strictEqual(isUsableDetailFilePath(" architecture-decisions/ARCH-FOO.yaml "), true);
  });
});

describe("resolveDetailFileUnderBase", () => {
  const base = path.join("/tmp", "tied", "methodology");

  it("returns null for sentinel values", () => {
    assert.strictEqual(resolveDetailFileUnderBase(base, "null"), null);
  });

  it("resolves in-base relative paths", () => {
    const resolved = resolveDetailFileUnderBase(base, "requirements/REQ-TIED_SETUP.yaml");
    assert.strictEqual(resolved, path.join(base, "requirements", "REQ-TIED_SETUP.yaml"));
  });

  it("rejects traversal outside base", () => {
    assert.strictEqual(resolveDetailFileUnderBase(base, "../secrets.yaml"), null);
    assert.strictEqual(resolveDetailFileUnderBase(base, "requirements/../../etc/passwd"), null);
  });
});
