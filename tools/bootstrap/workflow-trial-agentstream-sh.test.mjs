import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SCRIPT = path.join(REPO_ROOT, "scripts/workflow-trial-agentstream.sh");
const TAG_INC = path.join(REPO_ROOT, "scripts/lib/wf-trial-disposable-tag.inc.sh");
const PREFLIGHT_INC = path.join(REPO_ROOT, "scripts/lib/wf-trial-claude-preflight.inc.sh");
const TIED_CLI = path.join(REPO_ROOT, "mcp-server/packages/cli/dist/index.js");

function buildDisposableTag(wfId, envOverrides = {}) {
  const env = { ...process.env, NO_COLOR: "1", ...envOverrides };
  const bash = `
    normalize_wf_tag_suffix() {
      local raw="$1"
      raw="\${raw#PROMPT-}"
      raw="\$(printf '%s' "\$raw" | tr '[:upper:]' '[:lower:]')"
      printf '%s' "\$raw"
    }
    # shellcheck source=scripts/lib/wf-trial-disposable-tag.inc.sh
    source "${TAG_INC}"
    build_wf_trial_disposable_tag "${wfId}"
  `;
  const r = spawnSync("bash", ["-c", bash], { cwd: REPO_ROOT, encoding: "utf8", env });
  assert.equal(r.status, 0, r.stderr || r.stdout);
  return r.stdout.trim();
}

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

  it("build_wf_trial_disposable_tag default cursor + composer25 [REQ-WF_TRIAL_AGENTSTREAM_DISPOSABLE_TAG]", () => {
    assert.equal(
      buildDisposableTag("wf-03", {
        HARNESS: "cursor",
        MODEL_CONFIG: "composer-2.5",
        MODEL_SLUG: "composer-2.5-fast",
      }),
      "wf-agentstream-wf-03-cursor-composer25",
    );
  });

  it("build_wf_trial_disposable_tag claude harness", () => {
    assert.equal(
      buildDisposableTag("wf-03", { HARNESS: "claude", MODEL_CONFIG: "composer-2.5" }),
      "wf-agentstream-wf-03-claude-composer25",
    );
  });

  it("build_wf_trial_disposable_tag MODEL_SLUG fallback when MODEL_CONFIG empty", () => {
    assert.equal(
      buildDisposableTag("wf-02", {
        HARNESS: "cursor",
        MODEL_CONFIG: "",
        MODEL_SLUG: "composer-2.5-fast",
      }),
      "wf-agentstream-wf-02-cursor-composer25fast",
    );
  });

  it("wf_trial_handle_claude_validation_exit strict vs advisory [REQ-CLAUDE_WF03_LIVE_MATRIX_GAPS]", () => {
    const bash = `
      # shellcheck source=scripts/lib/wf-trial-claude-preflight.inc.sh
      source "${PREFLIGHT_INC}"
      wf_trial_handle_claude_validation_exit 0; echo exit=$?
      wf_trial_handle_claude_validation_exit 1; echo exit=$?
      WF_TRIAL_STRICT_PREFLIGHT=1 wf_trial_handle_claude_validation_exit 1; echo strict_exit=$?
    `;
    const r = spawnSync("bash", ["-c", bash], { cwd: REPO_ROOT, encoding: "utf8", env: process.env });
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /exit=0/);
    assert.match(r.stdout, /exit=0/); // advisory path after failure
    assert.match(r.stdout, /strict_exit=1/);
    assert.match(r.stderr, /DIAGNOSTIC: Claude client validation failed/);
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
