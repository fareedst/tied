/**
 * [REQ-TIED_TWO_FOLDER_LAYOUT] lint-stale-layout fixture + allowlist.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { lintStaleLayoutReferences } from "./lint-stale-layout.mjs";

describe("lintStaleLayoutReferences [REQ-TIED_TWO_FOLDER_LAYOUT]", () => {
  it("flags planted copy_files reference on live surface", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "stale-lint-"));
    fs.mkdirSync(path.join(root, "tools"), { recursive: true });
    fs.writeFileSync(path.join(root, "README.md"), "Run copy_files.sh here\n", "utf8");
    const result = lintStaleLayoutReferences(root, { roots: ["README.md", "tools"] });
    assert.equal(result.ok, false);
    assert.ok(result.findings.some((f) => f.patternId === "copy_files"));
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
});
