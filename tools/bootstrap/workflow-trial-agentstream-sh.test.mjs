import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SCRIPT = path.join(REPO_ROOT, "scripts/workflow-trial-agentstream.sh");
const TIED_CLI = path.join(REPO_ROOT, "mcp-server/packages/cli/dist/index.js");

function runScript(argv, envOverrides = {}) {
  const env = { ...process.env, NO_COLOR: "1", ...envOverrides };
  return spawnSync("bash", [SCRIPT, ...argv], {
    cwd: REPO_ROOT,
    encoding: "utf8",
    env,
  });
}

describe("workflow-trial-agentstream.sh [REQ-TIED_SETUP] [REQ-TIED_CLI_OPERATOR_OUTPUT_TEXTURE]", () => {
  it("--help on stderr without WF_ID", () => {
    const r = runScript(["--help"]);
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stderr, /workflow-trial-agentstream/);
    assert.equal(r.stdout, "");
  });

  it("rejects invalid WF id", () => {
    const r = runScript(["WF-99"]);
    assert.notEqual(r.status, 0);
    assert.match(r.stderr, /WF-/);
  });

  it("requires gawk on PATH", () => {
    const r = runScript(["wf-02"], { PATH: "/usr/bin:/bin" });
    if (spawnSync("bash", ["-c", "command -v gawk"], { encoding: "utf8" }).status === 0) {
      return;
    }
    assert.notEqual(r.status, 0);
    assert.match(r.stderr, /gawk/i);
  });

  it("--workspace + --dry-run emits --model on stdout when CLI built", () => {
    if (!fs.existsSync(TIED_CLI)) {
      console.log("DEBUG: skip — built tied CLI missing:", TIED_CLI);
      return;
    }
    const workspace = fs.mkdtempSync(path.join(os.tmpdir(), "wf-trial-ws-"));
    const r = runScript(["wf-02", "--dry-run", "--workspace", workspace]);
    assert.equal(r.status, 0, `${r.stderr}\n${r.stdout}`);
    assert.match(r.stdout, /"--model"/);
    assert.match(r.stdout, /composer-2\.5-fast/);
  });
});
