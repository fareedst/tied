import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

/**
 * [REQ-TIED_CLI_OPERATOR_OUTPUT_TEXTURE] Composition harness for sourced how().
 */
function runHow(argv, envOverrides = {}) {
  const quoted = argv.map((a) => `'${String(a).replace(/'/g, `'\\''`)}'`).join(" ");
  const cmd = `source scripts/build-commands.sh && how ${quoted}`.trim();
  const env = { ...process.env, ...envOverrides };
  if (!("NO_COLOR" in envOverrides)) {
    env.NO_COLOR = "1";
  }
  return spawnSync("bash", ["-lc", cmd], { cwd: REPO_ROOT, encoding: "utf8", env });
}

describe("build-commands how() [REQ-TIED_CLI_OPERATOR_OUTPUT_TEXTURE]", () => {
  it("defaults help to stderr with empty stdout", () => {
    const r = runHow(["build"]);
    assert.equal(r.status, 0, r.stderr);
    assert.equal(r.stdout, "");
    assert.match(r.stderr, /build-workspace/);
    assert.doesNotMatch(r.stderr, /\x1b\[/);
  });

  it("TIED_CLI_PLAIN=1 uses ASCII rules without Unicode hr", () => {
    const r = runHow(["build"], { TIED_CLI_PLAIN: "1", NO_COLOR: "" });
    assert.equal(r.status, 0);
    assert.match(r.stderr, /-{10,}/);
    assert.doesNotMatch(r.stderr, /─/);
    assert.doesNotMatch(r.stderr, /\x1b\[/);
  });

  it("how --plain build matches plain env", () => {
    const r = runHow(["--plain", "build"], { NO_COLOR: "" });
    assert.equal(r.status, 0);
    assert.match(r.stderr, /-{10,}/);
    assert.doesNotMatch(r.stderr, /─/);
  });

  it("how --stdout routes help to stdout", () => {
    const r = runHow(["--stdout", "build"]);
    assert.equal(r.status, 0);
    assert.match(r.stdout, /build-workspace/);
    assert.equal(r.stderr, "");
  });

  it("TIED_CLI_HELP_STDOUT=1 routes help to stdout", () => {
    const r = runHow(["tied"], { TIED_CLI_HELP_STDOUT: "1" });
    assert.equal(r.status, 0);
    assert.match(r.stdout, /tied-cli/);
    assert.equal(r.stderr, "");
  });

  it("unknown topic exits 2 on stderr only", () => {
    const r = runHow(["not-a-topic"]);
    assert.equal(r.status, 2);
    assert.match(r.stderr, /unknown topic/i);
    assert.equal(r.stdout, "");
  });

  it("excess args after topic exit 2", () => {
    const r = runHow(["build", "extra"]);
    assert.equal(r.status, 2);
    assert.match(r.stderr, /excess argument/i);
    assert.equal(r.stdout, "");
  });

  it("unknown global flag exits 2", () => {
    const r = runHow(["--no-such-flag", "build"]);
    assert.equal(r.status, 2);
    assert.match(r.stderr, /unknown flag/i);
    assert.equal(r.stdout, "");
  });

  it("how all prints sections on stderr", () => {
    const r = runHow(["all"]);
    assert.equal(r.status, 0);
    assert.equal(r.stdout, "");
    assert.match(r.stderr, /Backup/);
    assert.match(r.stderr, /Environment/);
  });

  it("how install-matrix includes matrix path line", () => {
    const r = runHow(["install-matrix"]);
    assert.equal(r.status, 0);
    assert.match(r.stderr, /install-resource-matrix\.md/);
    assert.equal(r.stdout, "");
  });
});
