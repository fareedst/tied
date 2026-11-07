import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const WRAPPER = path.join(REPO_ROOT, "scripts/run-traditional-four-phase-agentstream.sh");
const FOUR_PHASE_INC = path.join(
  REPO_ROOT,
  "scripts/lib/wf-trial-run-four-phase-agentstream.inc.sh",
);
const BATCH_TEMPLATE = path.join(REPO_ROOT, "docs/demos/traditional-four-phase-agentstream.yaml");

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

  it("T-AGENTSTREAM-EXIT-01 inc.sh propagates stub exit without expanded_batch unbound (set -u) [REQ-WF_TRIAL_FOUR_PHASE_SHELL_EXIT]", () => {
    const bashScript = `
set -euo pipefail
# shellcheck source=scripts/lib/wf-trial-run-four-phase-agentstream.inc.sh
source "${FOUR_PHASE_INC}"
export HARNESS=cursor MODEL_SLUG=stub MODEL_CONFIG=stub FEATURE_REMAINDER=stub-exit
batch_path=""
wf_trial_four_phase_prepare_expanded_batch "${BATCH_TEMPLATE}" batch_path
[[ -n "\$batch_path" && -f "\$batch_path" ]] || exit 97
set +e
wf_trial_four_phase_run_agentstream bash -c 'exit 42'
ec=\$?
set -e
exit "\$ec"
`;
    const r = spawnSync("bash", ["-c", bashScript], {
      cwd: REPO_ROOT,
      encoding: "utf8",
      env: { ...process.env, NO_COLOR: "1" },
    });
    assert.equal(r.status, 42, r.stderr || r.stdout);
    assert.doesNotMatch(r.stderr, /expanded_batch: unbound variable/, r.stderr);
  });

  it("T-EXIT-TRAP-01 dry-run EXIT trap does not reference unbound expanded_batch (set -u)", () => {
    const workspace = path.join(REPO_ROOT, "tools/bootstrap/.tmp-four-phase-exit-trap-ws");
    fs.mkdirSync(path.join(workspace, "tied-project"), { recursive: true });
    const r = runWrapper(["--dry-run"], {
      WORKSPACE: workspace,
      MODEL_SLUG: "composer-2.5-fast",
      FEATURE_REMAINDER: "exit-trap regression",
    });
    assert.doesNotMatch(r.stderr, /expanded_batch: unbound variable/, r.stderr);
    assert.notEqual(r.status, 127, r.stderr);
  });

  it("--help does not require WORKSPACE", () => {
    const r = runWrapper(["-h"]);
    assert.equal(r.status, 0, r.stderr);
    assert.equal(r.stdout, "");
    assert.match(r.stderr, /Environment/);
  });

  it("T-BATCH-01 turn 4 documents envelope depth/backfill and turn 1 uses {{HARNESS}} [REQ-CLAUDE_WF03_LIVE_MATRIX_GAPS]", () => {
    const template = path.join(REPO_ROOT, "docs/demos/traditional-four-phase-agentstream.yaml");
    const body = fs.readFileSync(template, "utf8");
    assert.match(body, /\{\{HARNESS\}\}-agentstream-four-phase/);
    assert.match(body, /request_evidence_envelope_backfill/);
    assert.match(body, /run-close-out-gates\.mjs/);
    assert.match(body, /fail_on_error_gaps/);
  });

  it("T-SHELL-01 expands {{HARNESS}} per HARNESS env [REQ-CLAUDE_WF03_LIVE_MATRIX_GAPS]", () => {
    const template = path.join(REPO_ROOT, "docs/demos/traditional-four-phase-agentstream.yaml");
    const tmp = path.join(REPO_ROOT, "tools/bootstrap/.tmp-four-phase-harness-expand.yaml");
    const r = spawnSync(
      "bash",
      [
        "-c",
        `export HARNESS=claude SKILL_ROOT=.claude/skills MODEL_SLUG=x MODEL_CONFIG=y FEATURE_REMAINDER=z; perl -pe 's/\\{\\{MODEL_SLUG\\}\\}/$ENV{MODEL_SLUG}/g; s/\\{\\{MODEL_CONFIG\\}\\}/$ENV{MODEL_CONFIG}/g; s/\\{\\{FEATURE_REMAINDER\\}\\}/$ENV{FEATURE_REMAINDER}/g; s/\\{\\{SKILL_ROOT\\}\\}/$ENV{SKILL_ROOT}/g; s/\\{\\{HARNESS\\}\\}/$ENV{HARNESS}/g' "${template}" > "${tmp}"`,
      ],
      { cwd: REPO_ROOT, encoding: "utf8", env: { ...process.env, NO_COLOR: "1" } },
    );
    assert.equal(r.status, 0, r.stderr);
    const expanded = fs.readFileSync(tmp, "utf8");
    assert.match(expanded, /claude-agentstream-four-phase/);
    fs.unlinkSync(tmp);
  });

  it("expands {{SKILL_ROOT}} per HARNESS [REQ-AGENTSTREAM_CLAUDE_WF_PARITY]", () => {
    const template = path.join(REPO_ROOT, "docs/demos/traditional-four-phase-agentstream.yaml");
    const tmp = path.join(REPO_ROOT, "tools/bootstrap/.tmp-four-phase-expand-test.yaml");
    const runExpand = (skillRoot) =>
      spawnSync(
        "bash",
        [
          "-c",
          `export HARNESS=cursor SKILL_ROOT='${skillRoot}' MODEL_SLUG=x MODEL_CONFIG=y FEATURE_REMAINDER=z; perl -pe 's/\\{\\{MODEL_SLUG\\}\\}/$ENV{MODEL_SLUG}/g; s/\\{\\{MODEL_CONFIG\\}\\}/$ENV{MODEL_CONFIG}/g; s/\\{\\{FEATURE_REMAINDER\\}\\}/$ENV{FEATURE_REMAINDER}/g; s/\\{\\{SKILL_ROOT\\}\\}/$ENV{SKILL_ROOT}/g; s/\\{\\{HARNESS\\}\\}/$ENV{HARNESS}/g' "${template}" > "${tmp}"`,
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
