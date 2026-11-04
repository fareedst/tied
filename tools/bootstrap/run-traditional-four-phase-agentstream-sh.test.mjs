import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const WRAPPER = path.join(REPO_ROOT, "scripts/run-traditional-four-phase-agentstream.sh");

/**
 * [REQ-TIED_CLI_OPERATOR_OUTPUT_TEXTURE] Facilitator wrapper operator help/diagnostics.
 */
function runWrapper(argv, envOverrides = {}) {
  const env = { ...process.env, ...envOverrides };
  if (!("NO_COLOR" in envOverrides)) {
    env.NO_COLOR = "1";
  }
  return spawnSync("bash", [WRAPPER, ...argv], {
    cwd: REPO_ROOT,
    encoding: "utf8",
    env,
  });
}

describe("run-traditional-four-phase-agentstream.sh [REQ-TIED_CLI_OPERATOR_OUTPUT_TEXTURE]", () => {
  it("--help defaults to stderr with empty stdout", () => {
    const r = runWrapper(["--help"]);
    assert.equal(r.status, 0, r.stderr);
    assert.equal(r.stdout, "");
    assert.match(r.stderr, /Traditional four-phase agentstream/);
    assert.match(r.stderr, /Examples/);
    assert.doesNotMatch(r.stderr, /\x1b\[/);
  });

  it("--help --stdout routes help to stdout", () => {
    const r = runWrapper(["--help", "--stdout"]);
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /Traditional four-phase agentstream/);
    assert.equal(r.stderr, "");
  });

  it("--plain --help uses ASCII rules without Unicode hr", () => {
    const r = runWrapper(["--plain", "--help"], { NO_COLOR: "" });
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stderr, /-{10,}/);
    assert.doesNotMatch(r.stderr, /─/);
    assert.doesNotMatch(r.stderr, /\x1b\[/);
  });

  it("TIED_CLI_PLAIN=1 --help matches plain texture", () => {
    const r = runWrapper(["--help"], { TIED_CLI_PLAIN: "1", NO_COLOR: "" });
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stderr, /-{10,}/);
    assert.doesNotMatch(r.stderr, /─/);
  });

  it("missing WORKSPACE exits 2 with ERROR on stderr only", () => {
    const r = runWrapper([]);
    assert.equal(r.status, 2);
    assert.match(r.stderr, /ERROR:/);
    assert.equal(r.stdout, "");
  });

  it("--help does not require WORKSPACE", () => {
    const r = runWrapper(["-h"]);
    assert.equal(r.status, 0, r.stderr);
    assert.equal(r.stdout, "");
    assert.match(r.stderr, /Environment/);
  });

  it("expands {{SKILL_ROOT}} per HARNESS [REQ-AGENTSTREAM_CLAUDE_WF_PARITY]", () => {
    const template = path.join(REPO_ROOT, "docs/demos/traditional-four-phase-agentstream.yaml");
    const tmp = path.join(REPO_ROOT, "tools/bootstrap/.tmp-four-phase-expand-test.yaml");
    const runExpand = (skillRoot) =>
      spawnSync(
        "bash",
        [
          "-c",
          `export SKILL_ROOT='${skillRoot}' MODEL_SLUG=x MODEL_CONFIG=y FEATURE_REMAINDER=z; perl -pe 's/\\{\\{MODEL_SLUG\\}\\}/$ENV{MODEL_SLUG}/g; s/\\{\\{MODEL_CONFIG\\}\\}/$ENV{MODEL_CONFIG}/g; s/\\{\\{FEATURE_REMAINDER\\}\\}/$ENV{FEATURE_REMAINDER}/g; s/\\{\\{SKILL_ROOT\\}\\}/$ENV{SKILL_ROOT}/g' "${template}" > "${tmp}"`,
        ],
        { cwd: REPO_ROOT, encoding: "utf8", env: { ...process.env, NO_COLOR: "1" } },
      );
    const claude = runExpand(".claude/skills");
    assert.equal(claude.status, 0, claude.stderr);
    const claudeBody = fs.readFileSync(tmp, "utf8");
    assert.match(claudeBody, /\.claude\/skills\/build-plan/);
    const cursor = runExpand(".cursor/skills");
    assert.equal(cursor.status, 0, cursor.stderr);
    const cursorBody = fs.readFileSync(tmp, "utf8");
    assert.match(cursorBody, /\.cursor\/skills\/build-plan/);
    fs.unlinkSync(tmp);
  });
});
