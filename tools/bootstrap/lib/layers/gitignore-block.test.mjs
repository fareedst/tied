import { test } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  writeGitignoreBlock,
  GITIGNORE_BLOCK_BEGIN,
  GITIGNORE_MANAGED_PATHS,
} from "./gitignore-block.mjs";
import {
  GITIGNORE_LOCAL_WORKING_BEGIN,
  GITIGNORE_UNDIVIDED_MIRROR_BEGIN,
} from "../working-gitignore.mjs";

test("gitignore block is idempotent and client profile is install-managed only", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-gitignore-"));
  writeGitignoreBlock(dir);
  const first = fs.readFileSync(path.join(dir, ".gitignore"), "utf8");
  assert.ok(first.includes(GITIGNORE_BLOCK_BEGIN));
  for (const p of GITIGNORE_MANAGED_PATHS) {
    assert.ok(first.includes(p), `missing managed path ${p}`);
  }
  assert.ok(first.includes("tied-bundle/"));
  assert.ok(!first.includes(GITIGNORE_LOCAL_WORKING_BEGIN));
  assert.ok(!first.includes(GITIGNORE_UNDIVIDED_MIRROR_BEGIN));
  assert.ok(!first.includes("tied-project/"));
  assert.ok(!first.includes("tied-bundle/docs/"));
  writeGitignoreBlock(dir);
  const second = fs.readFileSync(path.join(dir, ".gitignore"), "utf8");
  assert.equal(first, second);
});

test("writeGitignoreBlock strips legacy LOCAL WORKING blocks on refresh", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-gitignore-legacy-"));
  const legacy = [
    "# user rule",
    "!tied-bundle/working/REQ-KEEP/",
    "# BEGIN TIED LOCAL WORKING (managed)",
    "tied-bundle/working/**/gates/",
    "# END TIED LOCAL WORKING (managed)",
    "",
  ].join("\n");
  fs.writeFileSync(path.join(dir, ".gitignore"), legacy, "utf8");
  writeGitignoreBlock(dir);
  const next = fs.readFileSync(path.join(dir, ".gitignore"), "utf8");
  assert.ok(next.includes("# user rule"));
  assert.ok(next.includes("!tied-bundle/working/REQ-KEEP/"));
  assert.ok(!next.includes(GITIGNORE_LOCAL_WORKING_BEGIN));
  assert.ok(next.includes(GITIGNORE_BLOCK_BEGIN));
});

test("managed skills/ entry is honored by git check-ignore", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-gitignore-skills-"));
  writeGitignoreBlock(dir);
  fs.mkdirSync(path.join(dir, "skills", "tied-yaml"), { recursive: true });
  execSync("git init", { cwd: dir, stdio: "ignore" });
  execSync("git check-ignore skills/tied-yaml", { cwd: dir });
});
