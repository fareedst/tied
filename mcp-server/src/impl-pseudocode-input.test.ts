/**
 * [IMPL] Safety and IO for IMPL essence_pseudocode_path resolution under TIED_BASE_PATH.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it, beforeEach } from "node:test";
import { resolvePseudocodePathUnderTiedBase, readTextFromPseudocodePath } from "./impl-pseudocode-input.js";

describe("impl-pseudocode-input: resolvePseudocodePathUnderTiedBase", () => {
  it("accepts a file path relative to the TIED base [IMPL]", () => {
    const base = fs.mkdtempSync(path.join(os.tmpdir(), "tied-ep-"));
    try {
      const sub = path.join(base, "implementation-decisions");
      fs.mkdirSync(sub, { recursive: true });
      const f = path.join(sub, "body.md");
      fs.writeFileSync(f, "line", "utf8");
      const r = resolvePseudocodePathUnderTiedBase("implementation-decisions/body.md", base);
      assert.equal(r.ok, true);
      if (r.ok) {
        assert.equal(r.absolutePath, f);
        const t = readTextFromPseudocodePath(r.absolutePath);
        assert.equal(t.ok, true);
        if (t.ok) assert.equal(t.content, "line");
      }
    } finally {
      fs.rmSync(base, { recursive: true, force: true });
    }
  });

  it("accepts an absolute file path that still lies under the base [IMPL]", () => {
    const base = fs.mkdtempSync(path.join(os.tmpdir(), "tied-ep-"));
    try {
      const sub = path.join(base, "x.md");
      fs.writeFileSync(sub, "x", "utf8");
      const r = resolvePseudocodePathUnderTiedBase(sub, base);
      assert.equal(r.ok, true);
    } finally {
      fs.rmSync(base, { recursive: true, force: true });
    }
  });

  it("rejects paths that escape the TIED base [IMPL]", () => {
    const base = fs.mkdtempSync(path.join(os.tmpdir(), "tied-ep-"));
    const outside = fs.mkdtempSync(path.join(os.tmpdir(), "tied-ep-out-"));
    try {
      const f = path.join(outside, "nope.md");
      fs.writeFileSync(f, "x", "utf8");
      const r = resolvePseudocodePathUnderTiedBase(f, base);
      assert.equal(r.ok, false);
    } finally {
      fs.rmSync(base, { recursive: true, force: true });
      fs.rmSync(outside, { recursive: true, force: true });
    }
  });
});
