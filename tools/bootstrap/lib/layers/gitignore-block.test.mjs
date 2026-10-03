import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  writeGitignoreBlock,
  GITIGNORE_BLOCK_BEGIN,
  GITIGNORE_MANAGED_PATHS,
} from "./gitignore-block.mjs";

test("gitignore block is idempotent", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-gitignore-"));
  writeGitignoreBlock(dir);
  const first = fs.readFileSync(path.join(dir, ".gitignore"), "utf8");
  assert.ok(first.includes(GITIGNORE_BLOCK_BEGIN));
  for (const p of GITIGNORE_MANAGED_PATHS) {
    assert.ok(first.includes(p));
  }
  assert.ok(first.includes("tied-bundle/"));
  assert.ok(first.includes("BEGIN TIED LOCAL WORKING"));
  assert.ok(!first.includes("tied-bundle/docs/"));
  writeGitignoreBlock(dir);
  const second = fs.readFileSync(path.join(dir, ".gitignore"), "utf8");
  assert.equal(first, second);
});
