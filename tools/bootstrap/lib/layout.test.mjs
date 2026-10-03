/**
 * [REQ-TIED_TWO_FOLDER_LAYOUT] layout resolution unit tests (RED→GREEN).
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  BUNDLE_DIR_NAME,
  PROJECT_DIR_NAME,
  detectLegacyLayout,
  guardSelfInstall,
  resolveTiedLayout,
  resolveWorkingRoot,
} from "./layout.mjs";

function mkdtemp(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

describe("resolveTiedLayout", () => {
  it("uses tied-project and tied-bundle when present", () => {
    const root = mkdtemp("tfl-modern-");
    fs.mkdirSync(path.join(root, PROJECT_DIR_NAME), { recursive: true });
    fs.mkdirSync(path.join(root, BUNDLE_DIR_NAME), { recursive: true });
    const layout = resolveTiedLayout(root);
    assert.equal(path.basename(layout.tiedDir), PROJECT_DIR_NAME);
    assert.equal(path.basename(layout.bundleDir), BUNDLE_DIR_NAME);
    assert.equal(layout.projectConfigPath, path.join(layout.tiedDir, "config.yaml"));
    assert.equal(layout.installConfigPath, path.join(layout.bundleDir, "install.json"));
    assert.equal(layout.legacyProjectDir, false);
  });

  it("falls back to legacy tied/ when tied-project absent", () => {
    const root = mkdtemp("tfl-legacy-");
    fs.mkdirSync(path.join(root, "tied"), { recursive: true });
    const layout = resolveTiedLayout(root);
    assert.equal(path.basename(layout.tiedDir), "tied");
    assert.equal(layout.legacyProjectDir, true);
  });

  it("resolveWorkingRoot splits committed vs local", () => {
    const root = mkdtemp("tfl-work-");
    fs.mkdirSync(path.join(root, PROJECT_DIR_NAME, "working"), { recursive: true });
    fs.mkdirSync(path.join(root, BUNDLE_DIR_NAME, "working"), { recursive: true });
    const committed = resolveWorkingRoot(root, "REQ-TIED_FOO", "committed");
    const local = resolveWorkingRoot(root, "REQ-TIED_FOO", "local");
    assert.match(committed, /tied-project[/\\]working[/\\]REQ-TIED_FOO$/);
    assert.match(local, /tied-bundle[/\\]working[/\\]REQ-TIED_FOO$/);
  });
});

describe("detectLegacyLayout", () => {
  it("flags top-level tied/ when modern layout expected", () => {
    const root = mkdtemp("tfl-detect-");
    fs.mkdirSync(path.join(root, "tied"), { recursive: true });
    const result = detectLegacyLayout(root);
    assert.equal(result.detected, true);
    assert.equal(result.code, "LEGACY_LAYOUT_DETECTED");
  });

  it("passes when only tied-project exists", () => {
    const root = mkdtemp("tfl-ok-");
    fs.mkdirSync(path.join(root, PROJECT_DIR_NAME), { recursive: true });
    const result = detectLegacyLayout(root);
    assert.equal(result.detected, false);
  });
});

describe("guardSelfInstall", () => {
  it("refuses projectRoot equal to storeRoot", () => {
    const root = mkdtemp("tfl-self-");
    assert.throws(() => guardSelfInstall(root, root), (e) => e.code === "SELF_INSTALL_REFUSED");
  });

  it("allows when allow flag set", () => {
    const root = mkdtemp("tfl-self-allow-");
    assert.doesNotThrow(() => guardSelfInstall(root, root, { allow: true }));
  });
});
