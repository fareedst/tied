import assert from "node:assert/strict";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const BUILD_SH = path.join(REPO_ROOT, "build-workspace.sh");
const HELP_CLI = path.join(REPO_ROOT, "tools/bootstrap/build-workspace-help-cli.mjs");

describe("build-workspace shell help [REQ-TIED_UNIFIED_TOOLCHAIN]", () => {
  it("build-workspace.sh --help exits 0 without running build steps", () => {
    const result = spawnSync("bash", [BUILD_SH, "--help"], {
      cwd: REPO_ROOT,
      encoding: "utf8",
      env: { ...process.env, NO_COLOR: "1" },
    });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /TIED workspace build/);
    assert.doesNotMatch(result.stdout, /▶ Step 1\/2/);
    assert.doesNotMatch(result.stdout, /Repo:/);
  });

  it("build-workspace-help-cli.mjs prints help and exits 0", () => {
    const result = spawnSync(process.execPath, [HELP_CLI], {
      cwd: path.join(REPO_ROOT, "tools/bootstrap"),
      encoding: "utf8",
      env: { ...process.env, NO_COLOR: "1" },
    });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Examples/);
  });
});
