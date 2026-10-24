/**
 * [REQ-TIED_SETUP] [REQ-REQUEST_EVIDENCE_ENVELOPE]
 */
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import {
  clearTiedMethodologyVersionCache,
  readTiedMethodologyVersion,
} from "./tied-methodology-version.js";

describe("readTiedMethodologyVersion [REQ-TIED_SETUP]", () => {
  it("reads and trims VERSION from project_root", () => {
    clearTiedMethodologyVersionCache();
    const root = mkdtempSync(path.join(os.tmpdir(), "tied-ver-"));
    writeFileSync(path.join(root, "VERSION"), "  1.2.3\n\n");
    assert.equal(readTiedMethodologyVersion({ project_root: root }), "1.2.3");
  });

  it("caches per VERSION path", () => {
    clearTiedMethodologyVersionCache();
    const root = mkdtempSync(path.join(os.tmpdir(), "tied-ver-cache-"));
    writeFileSync(path.join(root, "VERSION"), "2.0.0\n");
    assert.equal(readTiedMethodologyVersion({ project_root: root }), "2.0.0");
    writeFileSync(path.join(root, "VERSION"), "9.9.9\n");
    assert.equal(readTiedMethodologyVersion({ project_root: root }), "2.0.0");
    clearTiedMethodologyVersionCache();
    assert.equal(readTiedMethodologyVersion({ project_root: root }), "9.9.9");
  });

  it("resolves VERSION via tied_base_path parent when project_root lacks VERSION", () => {
    clearTiedMethodologyVersionCache();
    const store = mkdtempSync(path.join(os.tmpdir(), "tied-store-"));
    writeFileSync(path.join(store, "VERSION"), "4.0.0\n");
    const tiedProject = path.join(store, "tied-project");
    mkdirSync(tiedProject, { recursive: true });
    const clientOnly = mkdtempSync(path.join(os.tmpdir(), "tied-client-"));
    assert.equal(
      readTiedMethodologyVersion({
        project_root: clientOnly,
        tied_base_path: tiedProject,
      }),
      "4.0.0",
    );
  });

  it("throws when VERSION is missing", () => {
    clearTiedMethodologyVersionCache();
    const root = mkdtempSync(path.join(os.tmpdir(), "tied-ver-missing-"));
    const prevCwd = process.cwd();
    process.chdir(root);
    try {
      assert.throws(
        () => readTiedMethodologyVersion({ project_root: root }),
        /VERSION file not found/,
      );
    } finally {
      process.chdir(prevCwd);
      clearTiedMethodologyVersionCache();
    }
  });
});
