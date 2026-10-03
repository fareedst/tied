/**
 * [REQ-TIED_TWO_FOLDER_LAYOUT] working-root classification (bootstrap mirror).
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import {
  classifyWorkingRelativePath,
  resolveWorkingPath,
} from "./working-root.mjs";

describe("working-root.mjs", () => {
  it("classifies gate artifacts as local", () => {
    assert.equal(classifyWorkingRelativePath("gates/ledger.jsonl"), "local");
  });

  it("resolveWorkingPath uses bundle for local when divided", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "tfl-wrm-"));
    fs.mkdirSync(path.join(root, "tied", "working"), { recursive: true });
    fs.mkdirSync(path.join(root, "tied-bundle", "working"), { recursive: true });
    try {
      const p = resolveWorkingPath(root, "REQ-A", "adherence", "events.jsonl");
      assert.match(p, /tied-bundle[/\\]working[/\\]REQ-A[/\\]adherence/);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});
