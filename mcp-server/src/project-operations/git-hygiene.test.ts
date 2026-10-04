import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { describe, it } from "node:test";
import { pathToFileURL } from "node:url";
import { classifyGitPorcelain, runGitHygiene } from "./git-hygiene.js";

const repoRoot = path.resolve(import.meta.dirname, "../../..");

// [IMPL-TIED_GIT_HYGIENE] [ARCH-TIED_GIT_HYGIENE_SAFETY] [REQ-TIED_GIT_HYGIENE] — How: preview/apply guards and bootstrap gitignore parity.
describe("git-hygiene [REQ-TIED_GIT_HYGIENE]", () => {
  it("mergeLocalWorkingGitignoreBlock is idempotent via bootstrap bridge", async () => {
    const mod = await import(
      pathToFileURL(path.join(repoRoot, "tools/bootstrap/lib/working-gitignore.mjs")).href
    );
    const sample = "# custom\n";
    const once = mod.mergeLocalWorkingGitignoreBlock(sample, { profile: "store" });
    const twice = mod.mergeLocalWorkingGitignoreBlock(once, { profile: "store" });
    assert.equal(once, twice);
  });

  it("rejects apply when allowlist does not match untracked exactly", async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "git-hygiene-"));
    execFileSync("git", ["init"], { cwd: tmp });
    fs.writeFileSync(path.join(tmp, "scratch.txt"), "x", "utf8");
    const preview = classifyGitPorcelain(tmp);
    assert.deepEqual(preview.untracked, ["scratch.txt"]);
    const result = await runGitHygiene({
      project_root: tmp,
      apply: true,
      allowed_paths: ["other.txt"],
    });
    assert.equal(result.ok, false);
    assert.equal(result.error, "allowlist_mismatch");
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it("apply deletes untracked files when allowlist matches exactly", async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "git-hygiene-apply-"));
    execFileSync("git", ["init"], { cwd: tmp });
    const rel = "drop-me.txt";
    fs.writeFileSync(path.join(tmp, rel), "x", "utf8");
    const result = await runGitHygiene({
      project_root: tmp,
      apply: true,
      allowed_paths: [rel],
    });
    assert.equal(result.ok, true);
    assert.deepEqual(result.deleted, [rel]);
    assert.ok(!fs.existsSync(path.join(tmp, rel)));
    fs.rmSync(tmp, { recursive: true, force: true });
  });
});
