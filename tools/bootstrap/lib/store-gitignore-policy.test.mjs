// [IMPL-TIED_STORE_BUNDLE_GIT_POLICY] [REQ-TIED_STORE_BUNDLE_GIT_POLICY]
import { test } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  applyStoreGitignoreProfile,
  GITIGNORE_STORE_LOCAL_WORKING_BEGIN,
  GITIGNORE_UNDIVIDED_MIRROR_BEGIN,
} from "./working-gitignore.mjs";
import { GITIGNORE_BLOCK_BEGIN } from "./layers/gitignore-block.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

test("applyStoreGitignoreProfile is idempotent and removes client tied-bundle/ install line", () => {
  const sample = [
    "# root",
    "tied-bundle/working/**/gates/",
    GITIGNORE_UNDIVIDED_MIRROR_BEGIN,
    "working/**/gates/",
    "# END TIED UNDIVIDED STORE MIRROR",
    GITIGNORE_BLOCK_BEGIN,
    ".cursor/mcp.json",
    "tied-bundle/",
    "# END TIED INSTALL MANAGED",
    "",
  ].join("\n");
  const once = applyStoreGitignoreProfile(sample);
  const twice = applyStoreGitignoreProfile(once);
  assert.equal(once, twice);
  assert.ok(once.includes(GITIGNORE_STORE_LOCAL_WORKING_BEGIN));
  assert.ok(once.includes("tied-bundle/working/"));
  assert.ok(once.includes("tied-bundle/install.json"));
  assert.ok(!once.includes(GITIGNORE_UNDIVIDED_MIRROR_BEGIN));
  const managed = once.slice(once.indexOf(GITIGNORE_BLOCK_BEGIN));
  assert.ok(!managed.split("\n").some((line) => line.trim() === "tied-bundle/"));
});

test("temp git repo: corpus trackable, local working ignored", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "store-gitignore-"));
  try {
    execSync("git init", { cwd: dir, stdio: "ignore" });
    const gitignore = applyStoreGitignoreProfile(`${GITIGNORE_BLOCK_BEGIN}\ntied-bundle/\n# END TIED INSTALL MANAGED\n`);
    fs.writeFileSync(path.join(dir, ".gitignore"), gitignore);
    fs.mkdirSync(path.join(dir, "tied-bundle", "docs"), { recursive: true });
    fs.mkdirSync(path.join(dir, "tied-bundle", "working", "REQ-X"), { recursive: true });
    fs.writeFileSync(path.join(dir, "tied-bundle", "docs", "ai-principles.md"), "# principles\n");
    fs.writeFileSync(path.join(dir, "tied-bundle", "working", "REQ-X", "gate.json"), "{}\n");
    execSync("git add .", { cwd: dir, stdio: "ignore" });
    const tracked = execSync("git ls-files", { cwd: dir, encoding: "utf8" }).trim().split("\n");
    assert.ok(tracked.includes("tied-bundle/docs/ai-principles.md"));
    assert.ok(!tracked.some((p) => p.startsWith("tied-bundle/working/")));
    execSync("git check-ignore -q tied-bundle/working/REQ-X/gate.json", { cwd: dir });
    const ignoreProbe = execSync("git check-ignore -v tied-bundle/working/REQ-X/gate.json", {
      cwd: dir,
      encoding: "utf8",
    });
    assert.match(ignoreProbe, /tied-bundle\/working/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("store repo invariant: no tracked paths under tied-bundle/working", () => {
  const listed = execSync("git ls-files tied-bundle/working", {
    cwd: repoRoot,
    encoding: "utf8",
  }).trim();
  assert.equal(listed, "", listed ? `still tracked:\n${listed}` : undefined);
});
