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
  resolveTiedMethodologyVersion,
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

  it("throws when no semver source exists", () => {
    clearTiedMethodologyVersionCache();
    const root = mkdtempSync(path.join(os.tmpdir(), "tied-ver-missing-"));
    const prevTestRepo = process.env.TIED_MCP_TEST_REPO_ROOT;
    delete process.env.TIED_MCP_TEST_REPO_ROOT;
    try {
      assert.throws(
        () => readTiedMethodologyVersion({ project_root: root }),
        /Methodology semver not found/,
      );
    } finally {
      if (prevTestRepo !== undefined) {
        process.env.TIED_MCP_TEST_REPO_ROOT = prevTestRepo;
      }
      clearTiedMethodologyVersionCache();
    }
  });

  it("reads semver from AGENTS.md when VERSION is absent [REQ-TIED_CLIENT_OPERATOR_TOOLING]", () => {
    clearTiedMethodologyVersionCache();
    const root = mkdtempSync(path.join(os.tmpdir(), "tied-ver-agents-"));
    writeFileSync(
      path.join(root, "AGENTS.md"),
      "**TIED Methodology Version**: 4.0.0\n",
      "utf8",
    );
    assert.equal(readTiedMethodologyVersion({ project_root: root }), "4.0.0");
  });

  it("prefers install.json over client root VERSION [REQ-TIED_INSTALL_JSON_REFRESH_SEMVER]", () => {
    clearTiedMethodologyVersionCache();
    const root = mkdtempSync(path.join(os.tmpdir(), "tied-ver-priority-"));
    writeFileSync(path.join(root, "VERSION"), "4.0.0\n");
    mkdirSync(path.join(root, "tied-bundle"), { recursive: true });
    writeFileSync(
      path.join(root, "tied-bundle", "install.json"),
      JSON.stringify({ store_methodology_version: "4.2.2" }),
      "utf8",
    );
    const resolved = resolveTiedMethodologyVersion({ project_root: root });
    assert.equal(resolved.version, "4.2.2");
    assert.equal(resolved.source, "install_json");
    assert.equal(readTiedMethodologyVersion({ project_root: root }), "4.2.2");
  });

  it("reads semver from tied-bundle/install.json store_methodology_version [REQ-TIED_CLIENT_OPERATOR_TOOLING]", () => {
    clearTiedMethodologyVersionCache();
    const root = mkdtempSync(path.join(os.tmpdir(), "tied-ver-install-"));
    mkdirSync(path.join(root, "tied-bundle"), { recursive: true });
    writeFileSync(
      path.join(root, "tied-bundle", "install.json"),
      JSON.stringify({ store_methodology_version: "3.9.1" }),
      "utf8",
    );
    assert.equal(readTiedMethodologyVersion({ project_root: root }), "3.9.1");
  });
});
