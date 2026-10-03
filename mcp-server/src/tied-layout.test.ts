/**
 * [REQ-TIED_TWO_FOLDER_LAYOUT] Contract: tied-layout.ts mirrors layout.mjs constants.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  BUNDLE_DIR_NAME,
  PROJECT_DIR_NAME,
  resolveTiedLayout,
} from "./tied-layout.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const layoutMjsPath = path.join(repoRoot, "tools/bootstrap/lib/layout.mjs");

describe("tied-layout contract vs layout.mjs", () => {
  it("exports matching PROJECT_DIR_NAME and BUNDLE_DIR_NAME literals", () => {
    const src = fs.readFileSync(layoutMjsPath, "utf8");
    assert.match(src, /PROJECT_DIR_NAME = "tied-project"/);
    assert.match(src, /BUNDLE_DIR_NAME = "tied-bundle"/);
    assert.equal(PROJECT_DIR_NAME, "tied-project");
    assert.equal(BUNDLE_DIR_NAME, "tied-bundle");
  });

  it("resolveTiedLayout paths match fixture shape", () => {
    const layout = resolveTiedLayout("/tmp/client");
    assert.equal(layout.projectConfigPath, path.join(layout.tiedDir, "config.yaml"));
    assert.equal(layout.installConfigPath, path.join(layout.bundleDir, "install.json"));
    assert.equal(layout.methodologyIndexRoot, layout.bundleDir);
  });
});
