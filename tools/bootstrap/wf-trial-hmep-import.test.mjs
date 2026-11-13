import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const BUILD_COMMANDS = path.join(REPO_ROOT, "scripts/build-commands.sh");
const HMEP_INC = path.join(REPO_ROOT, "scripts/lib/wf-trial-hmep-import.inc.sh");
const TAG_INC = path.join(REPO_ROOT, "scripts/lib/wf-trial-disposable-tag.inc.sh");
const EFFORT_INC = path.join(REPO_ROOT, "scripts/lib/wf-trial-model-effort.inc.sh");

function runBash(script, envOverrides = {}) {
  return spawnSync("bash", ["-c", script], {
    cwd: REPO_ROOT,
    encoding: "utf8",
    env: { ...process.env, NO_COLOR: "1", ...envOverrides },
  });
}

describe("wf-trial-hmep-import [REQ-WF_TRIAL_RANGE_HMEP_AUTO_INGEST]", () => {
  it("SC-WRH-02: workflow_trial_range wires capture export and hmep import", () => {
    const text = fs.readFileSync(BUILD_COMMANDS, "utf8");
    assert.match(text, /export WF_TRIAL_HMEP_CAPTURE=1/);
    assert.match(text, /wf_trial_hmep_import_cell/);
  });

  it("SC-WRH-04: skip env branch in workflow_trial_range", () => {
    const text = fs.readFileSync(BUILD_COMMANDS, "utf8");
    assert.match(text, /WF_TRIAL_SKIP_HMEP_CAPTURE/);
    assert.match(text, /unset WF_TRIAL_HMEP_CAPTURE/);
  });

  it("SC-WRH-02: build-commands usage documents HMEP line", () => {
    const text = fs.readFileSync(BUILD_COMMANDS, "utf8");
    assert.match(text, /HMEP: default WF_TRIAL_HMEP_CAPTURE=1/);
  });

  it("SC-WRH-01: resolve latest client under TIED_TEST_ROOT", () => {
    const testRoot = fs.mkdtempSync(path.join(os.tmpdir(), "wf-hmep-"));
    const tag = runBash(
      `
        normalize_wf_tag_suffix() { printf '%s' "\${1#PROMPT-}" | tr '[:upper:]' '[:lower:]'; }
        source "${TAG_INC}"
        source "${EFFORT_INC}"
        HARNESS=cursor MODEL_CONFIG=luna-low MODEL_SLUG=gpt-5.6-luna-low-fast build_wf_trial_disposable_tag "WF-09"
      `,
    );
    assert.equal(tag.status, 0);
    const disposableTag = tag.stdout.trim();
    const client = path.join(testRoot, `999001-${disposableTag}`);
    fs.mkdirSync(client, { recursive: true });

    const r = runBash(
      `
        source "${HMEP_INC}"
        wf_trial_resolve_latest_client_for_tag "WF-09"
      `,
      { TIED_TEST_ROOT: testRoot, HARNESS: "cursor", MODEL_CONFIG: "luna-low", MODEL_SLUG: "gpt-5.6-luna-low-fast" },
    );
    assert.equal(r.status, 0, r.stderr);
    assert.equal(r.stdout.trim(), client);
  });
});
