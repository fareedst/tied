import assert from "node:assert/strict";
import fs from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const BUILD_COMMANDS = path.join(REPO_ROOT, "scripts/build-commands.sh");

/**
 * [REQ-TIED_GIT_HYGIENE] [IMPL-TIED_GIT_HYGIENE] Store operator shell companion to MCP preview/apply.
 */
describe("test-all-hygiene alias [REQ-TIED_GIT_HYGIENE]", () => {
  it("defines test_all_hygiene and alias in build-commands.sh", () => {
    const src = fs.readFileSync(BUILD_COMMANDS, "utf8");
    assert.match(src, /test_all_hygiene\(\)/);
    assert.match(src, /alias test-all-hygiene=test_all_hygiene/);
    assert.match(src, /CITDP-REQ-ACTIVATION\.yaml/);
    assert.match(src, /regression-manifest\.json/);
    assert.match(src, /envelope-gap-report\.v1\.yaml/);
  });

  it("documents test-all-hygiene in how test", () => {
    const guide = fs.readFileSync(
      path.join(REPO_ROOT, "scripts/_build_commands_cli_guide.inc.sh"),
      "utf8",
    );
    assert.match(guide, /test-all-hygiene/);
  });

  it("dry-run exits zero without mutating git state", () => {
    const before = spawnSync("git", ["status", "--porcelain"], {
      cwd: REPO_ROOT,
      encoding: "utf8",
    }).stdout;
    const r = spawnSync("bash", ["-lc", "source scripts/build-commands.sh && test-all-hygiene --dry-run"], {
      cwd: REPO_ROOT,
      encoding: "utf8",
    });
    assert.equal(r.status, 0, r.stderr || r.stdout);
    assert.match(r.stdout + r.stderr, /dry-run complete/i);
    const after = spawnSync("git", ["status", "--porcelain"], {
      cwd: REPO_ROOT,
      encoding: "utf8",
    }).stdout;
    assert.equal(after, before);
  });
});
