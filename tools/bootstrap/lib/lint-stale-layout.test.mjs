/**
 * [REQ-TIED_TWO_FOLDER_LAYOUT] [REQ-TIED_LEGACY_LAYOUT_DOC_DECOMMISSION] lint-stale-layout fixture + allowlist.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { lintStaleLayoutReferences, LIVE_SURFACE_ROOTS } from "./lint-stale-layout.mjs";

describe("lintStaleLayoutReferences [REQ-TIED_TWO_FOLDER_LAYOUT]", () => {
  it("flags planted copy_files reference on live surface", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "stale-lint-"));
    fs.mkdirSync(path.join(root, "tools"), { recursive: true });
    fs.writeFileSync(path.join(root, "README.md"), "Run copy_files.sh here\n", "utf8");
    const result = lintStaleLayoutReferences(root, { roots: ["README.md", "tools"] });
    assert.equal(result.ok, false);
    assert.ok(result.findings.some((f) => f.patternId === "copy_files"));
  });

  it("includes tied-bundle/docs on live surfaces", () => {
    assert.ok(LIVE_SURFACE_ROOTS.includes("tied-bundle/docs"));
  });

  it("allowlists migration history file", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "stale-lint-"));
    fs.mkdirSync(path.join(root, "tied-bundle", "docs"), { recursive: true });
    fs.writeFileSync(
      path.join(root, "tied-bundle", "docs", "methodology-migration.md"),
      "Legacy copy_files.sh note\n",
      "utf8",
    );
    const result = lintStaleLayoutReferences(root, { roots: ["tied-bundle"] });
    assert.equal(result.ok, true);
  });

  it("flags legacy tied narrative and migrate-layout in markdown", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "stale-lint-"));
    fs.writeFileSync(
      path.join(root, "README.md"),
      "Use legacy `tied/` or tied-install --migrate-layout\n",
      "utf8",
    );
    const result = lintStaleLayoutReferences(root, { roots: ["README.md"] });
    assert.equal(result.ok, false);
    assert.ok(result.findings.some((f) => f.patternId === "legacy_tied_dir_narrative"));
    assert.ok(result.findings.some((f) => f.patternId === "migrate_layout_markdown"));
  });

  it("does not flag migrate-layout in .mjs CLI sources", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "stale-lint-"));
    fs.mkdirSync(path.join(root, "tools"), { recursive: true });
    fs.writeFileSync(
      path.join(root, "tools", "help.mjs"),
      "export const flags = ['--migrate-layout'];\n",
      "utf8",
    );
    const result = lintStaleLayoutReferences(root, { roots: ["tools"] });
    assert.equal(result.ok, true);
  });

  it("allowlists migrate-layout in REQ detail yaml", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "stale-lint-"));
    fs.mkdirSync(path.join(root, "tied-project", "requirements"), { recursive: true });
    fs.writeFileSync(
      path.join(root, "tied-project", "requirements", "REQ-EXAMPLE.yaml"),
      "criterion: tied-install --migrate-layout idempotent\n",
      "utf8",
    );
    const result = lintStaleLayoutReferences(root, { roots: ["tied-project/requirements"] });
    assert.equal(result.ok, true);
  });
});
