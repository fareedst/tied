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
const EFFORT_INC = path.join(REPO_ROOT, "scripts/lib/wf-trial-model-effort.inc.sh");
const BUILD_COMMANDS = path.join(REPO_ROOT, "scripts/build-commands.sh");
const PREFLIGHT_INC = path.join(REPO_ROOT, "scripts/lib/wf-trial-claude-preflight.inc.sh");
const HARDENING_INC = path.join(REPO_ROOT, "scripts/lib/wf-trial-four-phase-hardening.inc.sh");
const STACK_INC = path.join(REPO_ROOT, "scripts/lib/wf-trial-implementation-stack.inc.sh");
const PROCESS_LOG_INC = path.join(REPO_ROOT, "scripts/lib/wf-trial-process-log.inc.sh");
const PROOF_MANIFEST_GATE_INC = path.join(REPO_ROOT, "scripts/lib/wf-trial-proof-manifest-gate.inc.sh");
const PHASE_HANDOFF_GATE_INC = path.join(REPO_ROOT, "scripts/lib/wf-trial-phase-handoff-gate.inc.sh");
const ABORT_SIGNAL_INC = path.join(REPO_ROOT, "scripts/lib/wf-trial-abort-signal.inc.sh");
const OPERATOR_HIGHLIGHT_INC = path.join(REPO_ROOT, "scripts/lib/wf-trial-operator-highlight.inc.sh");
const PRODUCT_REQ_INC = path.join(REPO_ROOT, "scripts/lib/wf-trial-product-req.inc.sh");
const FIXTURE_1794504138_STDERR = path.join(
  REPO_ROOT,
  "tied-project/working/REQ-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL/evidence/fixture-1794504138-process.stderr.log",
);
const FIXTURE_1794504138_STDOUT_TAIL = path.join(
  REPO_ROOT,
  "tied-project/working/REQ-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL/evidence/fixture-1794504138-process.stdout.tail.txt",
);
const PROOF_MANIFEST_GATE_MJS = path.join(REPO_ROOT, "tools/bootstrap/lib/wf-trial-proof-manifest-gate.mjs");
const TIED_CLI = path.join(REPO_ROOT, "mcp-server/packages/cli/dist/index.js");

const MANIFEST_REQUIRED_KEYS = [
  "schema",
  "orchestrator_script",
  "repo_root",
  "wf_id",
  "workspace",
  "harness",
  "model_slug",
  "model_config",
  "model_effort",
  "disposable_tag",
  "dry_run",
  "log_capture_default",
  "evidence_rel_dir",
  "files",
  "bootstrap_stderr_prepended",
  "started_at",
  "finished_at",
  "exit_code",
];

function buildDisposableTag(wfId, envOverrides = {}) {
  const env = { ...process.env, NO_COLOR: "1", ...envOverrides };
  const bash = `
    normalize_wf_tag_suffix() {
      local raw="$1"
      raw="\${raw#PROMPT-}"
      raw="\$(printf '%s' "\$raw" | tr '[:upper:]' '[:lower:]')"
      printf '%s' "\$raw"
    }
    # shellcheck source=scripts/lib/wf-trial-model-effort.inc.sh
    source "${EFFORT_INC}"
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
    assert.match(r.stderr, /Batch helper/);
    assert.match(r.stderr, /workflow_trial_range/);
    assert.equal(r.stdout, "");
  });

  it("empty argv prints styled help and exits 0 [REQ-WF_TRIAL_AGENTSTREAM_OPERATOR_HELP]", () => {
    const r = runScript([]);
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stderr, /WF trial orchestrator/);
    assert.match(r.stderr, /MODEL_EFFORT/);
    assert.equal(r.stdout, "");
  });

  it("help does not require gawk [REQ-WF_TRIAL_AGENTSTREAM_OPERATOR_HELP]", () => {
    const r = runScript(["--help"], { PATH: "/usr/bin:/bin" });
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stderr, /Examples/);
  });

  it("help works without store root marker [REQ-WF_TRIAL_AGENTSTREAM_OPERATOR_HELP]", () => {
    const r = spawnSync("bash", [SCRIPT, "--help"], {
      cwd: os.tmpdir(),
      encoding: "utf8",
      env: { ...process.env, NO_COLOR: "1" },
    });
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stderr, /workflow-trial-agentstream/);
  });

  it("TIED_CLI_HELP_STDOUT=1 routes help to stdout [REQ-WF_TRIAL_AGENTSTREAM_OPERATOR_HELP]", () => {
    const r = runScript(["--help"], { TIED_CLI_HELP_STDOUT: "1" });
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /Usage/);
    assert.equal(r.stderr, "");
  });

  it("--stdout routes help to stdout [REQ-WF_TRIAL_AGENTSTREAM_OPERATOR_HELP]", () => {
    const r = runScript(["--stdout", "--help"]);
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /Environment/);
    assert.equal(r.stderr, "");
  });

  it("NO_COLOR uses plain hr without Unicode [REQ-WF_TRIAL_AGENTSTREAM_OPERATOR_HELP]", () => {
    const r = runScript(["--help"], { NO_COLOR: "1" });
    assert.equal(r.status, 0);
    assert.match(r.stderr, /-{10,}/);
    assert.doesNotMatch(r.stderr, /\x1b\[/);
  });

  it("rejects invalid WF id", () => {
    const r = runScript(["WF-99"]);
    assert.notEqual(r.status, 0);
    assert.match(r.stderr, /WF-/);
  });

  it("rejects wf-13 above catalog range [SC-WF-REJECT-13]", () => {
    const r = runScript(["wf-13"]);
    assert.notEqual(r.status, 0);
    assert.match(r.stderr, /WF-01 .* WF-12|invalid WF id/i);
  });

  it("wf-09 dry-run accepts extended catalog id [SC-WF-ID-12]", () => {
    const workspace = fs.mkdtempSync(path.join(os.tmpdir(), "wf09-"));
    const r = runScript(["wf-09", "--dry-run", "--workspace", workspace]);
    assert.equal(r.status, 0, `${r.stderr}\n${r.stdout}`);
    const combined = `${r.stderr}\n${r.stdout}`;
    assert.match(combined, /concurrent execution/i);
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

  it("build_wf_trial_disposable_tag appends effort suffix [REQ-WF_TRIAL_MODEL_EFFORT]", () => {
    assert.equal(
      buildDisposableTag("wf-03", {
        HARNESS: "cursor",
        MODEL_CONFIG: "composer-2.5",
        MODEL_EFFORT: "medium",
      }),
      "wf-agentstream-wf-03-cursor-composer25medium",
    );
  });

  it("rejects invalid MODEL_EFFORT before bootstrap [REQ-WF_TRIAL_MODEL_EFFORT]", () => {
    const r = runScript(["wf-02", "--dry-run"], { MODEL_EFFORT: "bogus" });
    assert.notEqual(r.status, 0);
    assert.match(r.stderr, /invalid MODEL_EFFORT/i);
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

  it("materialize_disposable_preload_contract copy-if-absent [REQ-WF_TRIAL_FOUR_PHASE_HARDENING]", () => {
    const ws = fs.mkdtempSync(path.join(os.tmpdir(), "wf-preload-"));
    const bundleDocs = path.join(ws, "tied-bundle", "docs");
    fs.mkdirSync(bundleDocs, { recursive: true });
    const template = path.join(bundleDocs, "agent-preload-contract-template.yaml");
    fs.writeFileSync(template, "agent_preload:\n  note: test\n", "utf8");
    const bash = `
      # shellcheck source=scripts/lib/wf-trial-four-phase-hardening.inc.sh
      source "${HARDENING_INC}"
      materialize_disposable_preload_contract "${ws}"
      test -f "${ws}/tied-project/agent-preload-contract.yaml"
      materialize_disposable_preload_contract "${ws}"
    `;
    const r = spawnSync("bash", ["-c", bash], { cwd: REPO_ROOT, encoding: "utf8", env: process.env });
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stderr, /materialized preload contract/);
    assert.match(r.stderr, /preload contract exists/);
  });

  it("seed_wf_trial_typescript_stack copy-if-absent [REQ-WF_TRIAL_IMPLEMENTATION_STACK]", () => {
    const ws = fs.mkdtempSync(path.join(os.tmpdir(), "wf-stack-seed-"));
    const bash = `
      # shellcheck source=scripts/lib/wf-trial-implementation-stack.inc.sh
      source "${STACK_INC}"
      seed_wf_trial_typescript_stack "${ws}" "${REPO_ROOT}"
      test -f "${ws}/package.json"
      test -f "${ws}/tsconfig.json"
      grep -q 'node --import tsx --test' "${ws}/package.json"
      seed_wf_trial_typescript_stack "${ws}" "${REPO_ROOT}"
    `;
    const r = spawnSync("bash", ["-c", bash], { cwd: REPO_ROOT, encoding: "utf8", env: process.env });
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stderr, /WF trial stack seeded/);
    assert.match(r.stderr, /seed skip \(exists\)/);
  });

  it("materialize_wf_trial_preload_contract TypeScript fields [REQ-WF_TRIAL_IMPLEMENTATION_STACK]", () => {
    const ws = fs.mkdtempSync(path.join(os.tmpdir(), "wf-stack-preload-"));
    const bash = `
      # shellcheck source=scripts/lib/wf-trial-implementation-stack.inc.sh
      source "${STACK_INC}"
      materialize_wf_trial_preload_contract "${ws}" "${REPO_ROOT}"
      grep -q 'language: "TypeScript"' "${ws}/tied-project/agent-preload-contract.yaml"
      grep -q 'test_framework: "node-test"' "${ws}/tied-project/agent-preload-contract.yaml"
    `;
    const r = spawnSync("bash", ["-c", bash], { cwd: REPO_ROOT, encoding: "utf8", env: process.env });
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stderr, /materialized WF trial preload contract/);
  });

  it("WF_TRIAL_SKIP_IMPLEMENTATION_STACK=1 skips stack on dry-run workspace [REQ-WF_TRIAL_IMPLEMENTATION_STACK]", () => {
    if (!fs.existsSync(TIED_CLI)) {
      console.log("DEBUG: skip — built tied CLI missing:", TIED_CLI);
      return;
    }
    const workspace = fs.mkdtempSync(path.join(os.tmpdir(), "wf-stack-skip-"));
    const r = runScript(["wf-02", "--dry-run", "--workspace", workspace], {
      WF_TRIAL_SKIP_IMPLEMENTATION_STACK: "1",
    });
    assert.equal(r.status, 0, `${r.stderr}\n${r.stdout}`);
    assert.equal(fs.existsSync(path.join(workspace, "package.json")), false);
    assert.match(r.stderr, /WF_TRIAL_SKIP_IMPLEMENTATION_STACK=1/);
  });

  it("--workspace + --dry-run seeds stack when enabled [REQ-WF_TRIAL_IMPLEMENTATION_STACK]", () => {
    if (!fs.existsSync(TIED_CLI)) {
      console.log("DEBUG: skip — built tied CLI missing:", TIED_CLI);
      return;
    }
    const workspace = fs.mkdtempSync(path.join(os.tmpdir(), "wf-stack-ws-"));
    const r = runScript(["wf-02", "--dry-run", "--workspace", workspace]);
    assert.equal(r.status, 0, `${r.stderr}\n${r.stdout}`);
    assert.ok(fs.existsSync(path.join(workspace, "package.json")));
    const preload = fs.readFileSync(
      path.join(workspace, "tied-project/agent-preload-contract.yaml"),
      "utf8",
    );
    assert.match(preload, /language: "TypeScript"/);
  });

  it("wf_trial_reconcile_preflight strict vs skip [REQ-WF_TRIAL_FOUR_PHASE_HARDENING]", () => {
    const emptyStore = fs.mkdtempSync(path.join(os.tmpdir(), "wf-store-"));
    const bash = `
      # shellcheck source=scripts/lib/wf-trial-four-phase-hardening.inc.sh
      source "${HARDENING_INC}"
      wf_trial_reconcile_preflight "${emptyStore}"; echo exit=$?
      WF_TRIAL_SKIP_RECONCILE_PREFLIGHT=1 wf_trial_reconcile_preflight "${emptyStore}"; echo skip_exit=$?
      WF_TRIAL_STRICT_RECONCILE=1 wf_trial_reconcile_preflight "${emptyStore}"; echo strict_exit=$?
    `;
    const r = spawnSync("bash", ["-c", bash], { cwd: REPO_ROOT, encoding: "utf8", env: process.env });
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /exit=0/);
    assert.match(r.stdout, /skip_exit=0/);
    assert.match(r.stdout, /strict_exit=1/);
    assert.match(r.stderr, /reconcile preflight/);
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

  it("wf_trial_process_log_enabled respects WF_TRIAL_SKIP_PROCESS_LOG [REQ-WF_TRIAL_ORCHESTRATOR_PROCESS_LOG]", () => {
    const bash = `
      # shellcheck source=scripts/lib/wf-trial-process-log.inc.sh
      source "${PROCESS_LOG_INC}"
      wf_trial_process_log_enabled && echo on=1 || echo on=0
      WF_TRIAL_SKIP_PROCESS_LOG=1 wf_trial_process_log_enabled && echo skip=1 || echo skip=0
    `;
    const r = spawnSync("bash", ["-c", bash], { cwd: REPO_ROOT, encoding: "utf8", env: process.env });
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /on=1/);
    assert.match(r.stdout, /skip=0/);
  });

  it("wf_trial_process_log bind prepends bootstrap stderr [REQ-WF_TRIAL_ORCHESTRATOR_PROCESS_LOG]", () => {
    const ws = fs.mkdtempSync(path.join(os.tmpdir(), "wf-bind-"));
    const bootstrapErr = path.join(os.tmpdir(), `wf-bootstrap-${Date.now()}.err`);
    fs.writeFileSync(bootstrapErr, "BOOTSTRAP_MARKER_LINE\n", "utf8");
    const bash = `
      export WF_TRIAL_BOOTSTRAP_STDERR="${bootstrapErr}"
      # shellcheck source=scripts/lib/wf-trial-process-log.inc.sh
      source "${PROCESS_LOG_INC}"
      wf_trial_process_log_bind_workspace "${ws}" "WF-02" "${REPO_ROOT}" cursor composer-2.5-fast composer-2.5 "" 1 1 medium
      printf 'after_bind\\n'
    `;
    const r = spawnSync("bash", ["-c", bash], { cwd: REPO_ROOT, encoding: "utf8", env: process.env });
    assert.equal(r.status, 0, r.stderr);
    const stderrLog = path.join(
      ws,
      "tied-project/working/wf-trial-orchestrator-run/evidence/process.stderr.log",
    );
    assert.ok(fs.existsSync(stderrLog), stderrLog);
    const stderrHead = fs.readFileSync(stderrLog, "utf8");
    assert.match(stderrHead, /^BOOTSTRAP_MARKER_LINE/);
    const stdoutLog = path.join(
      ws,
      "tied-project/working/wf-trial-orchestrator-run/evidence/process.stdout.log",
    );
    assert.match(fs.readFileSync(stdoutLog, "utf8"), /after_bind/);
    const manifest = JSON.parse(
      fs.readFileSync(
        path.join(ws, "tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json"),
        "utf8",
      ),
    );
    assert.equal(manifest.schema, "wf-trial-orchestrator-run.v1");
    assert.equal(manifest.model_effort, "medium");
    assert.equal(manifest.exit_code, 0);
    assert.ok(manifest.finished_at);
  });

  it("--workspace + --dry-run writes process log manifest and files [REQ-WF_TRIAL_ORCHESTRATOR_PROCESS_LOG]", () => {
    if (!fs.existsSync(TIED_CLI)) {
      console.log("DEBUG: skip — built tied CLI missing:", TIED_CLI);
      return;
    }
    const workspace = fs.mkdtempSync(path.join(os.tmpdir(), "wf-trial-log-"));
    const r = runScript(["wf-02", "--dry-run", "--workspace", workspace]);
    assert.equal(r.status, 0, `${r.stderr}\n${r.stdout}`);
    const evidenceDir = path.join(
      workspace,
      "tied-project/working/wf-trial-orchestrator-run/evidence",
    );
    const manifestPath = path.join(evidenceDir, "wf-trial-orchestrator-run.v1.json");
    assert.ok(fs.existsSync(path.join(evidenceDir, "process.stdout.log")));
    assert.ok(fs.existsSync(path.join(evidenceDir, "process.stderr.log")));
    assert.ok(fs.existsSync(manifestPath));
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    for (const key of MANIFEST_REQUIRED_KEYS) {
      assert.ok(key in manifest, `missing manifest key ${key}`);
    }
    assert.equal(manifest.schema, "wf-trial-orchestrator-run.v1");
    assert.equal(manifest.wf_id, "WF-02");
    assert.equal(manifest.exit_code, 0);
    assert.match(r.stderr, /DIAGNOSTIC: wf-trial process log manifest=/);
    assert.match(r.stderr, /wf-trial-orchestrator-run\.v1\.json/);
  });

  it("workflow_trial_range usage mentions MODEL_REF and catalog [SC-CAT-USAGE]", () => {
    const bash = `
      export ECHO_EXEC=:
      # shellcheck source=scripts/build-commands.sh
      source "${BUILD_COMMANDS}"
      workflow_trial_range 2>&1
    `;
    const r = spawnSync("bash", ["-c", bash], { cwd: REPO_ROOT, encoding: "utf8", env: process.env });
    assert.equal(r.status, 0, r.stderr);
    const out = `${r.stderr}\n${r.stdout}`;
    assert.match(out, /MODEL_REF/);
    assert.match(out, /wf-trial-model-catalog/);
    assert.match(out, /haiku-5-5 medium/);
  });

  it("workflow_trial_range usage mentions CONFIG_ID and effort [SC-SPEC-USAGE]", () => {
    const bash = `
      export ECHO_EXEC=:
      # shellcheck source=scripts/build-commands.sh
      source "${BUILD_COMMANDS}"
      workflow_trial_range 2>&1
    `;
    const r = spawnSync("bash", ["-c", bash], { cwd: REPO_ROOT, encoding: "utf8", env: process.env });
    assert.equal(r.status, 0, r.stderr);
    const out = `${r.stderr}\n${r.stdout}`;
    assert.match(out, /MODEL_REF/);
    assert.match(out, /Cursor compose:/);
    assert.match(out, /luna medium 2 2/);
  });

  it("wf_trial_canonicalize_cursor_model_slug Grok prefixes [SC-CURSOR-SLUG]", () => {
    const bash = `
      # shellcheck source=scripts/lib/wf-trial-model-spec.inc.sh
      source "${REPO_ROOT}/scripts/lib/wf-trial-model-spec.inc.sh"
      export HARNESS=cursor
      export MODEL_SLUG=grok-4.6-medium-fast
      wf_trial_canonicalize_cursor_model_slug cursor || exit 1
      [[ "\${MODEL_SLUG}" == "cursor-grok-4.6-medium-fast" ]] || exit 2
      export MODEL_SLUG=cursor-grok-4.7-low-fast
      wf_trial_canonicalize_cursor_model_slug cursor || exit 3
      [[ "\${MODEL_SLUG}" == "grok-4.7-low-fast" ]] || exit 4
      printf ok-cursor-slug\\n
    `;
    const r = spawnSync("bash", ["-c", bash], { cwd: REPO_ROOT, encoding: "utf8", env: process.env });
    assert.equal(r.status, 0, `${r.stderr}\n${r.stdout}`);
    assert.match(r.stdout, /ok-cursor-slug/);
  });

  it("workflow_trial_range resolves grok47-med for cursor [SC-SPEC-RESOLVE]", () => {
    const bash = `
      export ECHO_EXEC=:
      workflow_trial_agentstream() { :; }
      # shellcheck source=scripts/build-commands.sh
      source "${BUILD_COMMANDS}"
      workflow_trial_range cursor grok47-med - 1 1 : 2>/dev/null
      [[ "\${MODEL_CONFIG:-}" == "grok47-med" ]] || exit 3
      [[ "\${MODEL_SLUG:-}" == "grok-4.7-medium-fast" ]] || exit 4
      printf ok-grok47\\n
    `;
    const r = spawnSync("bash", ["-c", bash], { cwd: REPO_ROOT, encoding: "utf8", env: process.env });
    assert.equal(r.status, 0, `${r.stderr}\n${r.stdout}`);
    assert.match(r.stdout, /ok-grok47/);
  });

  it("workflow_trial_range resolves luna-low for cursor [SC-SPEC-RESOLVE]", () => {
    const bash = `
      export ECHO_EXEC=:
      workflow_trial_agentstream() { :; }
      # shellcheck source=scripts/build-commands.sh
      source "${BUILD_COMMANDS}"
      workflow_trial_range cursor luna-low - 1 1 : 2>/dev/null
      [[ "\${MODEL_CONFIG:-}" == "luna-low" ]] || exit 3
      [[ "\${MODEL_SLUG:-}" == "gpt-5.6-luna-low-fast" ]] || exit 4
      printf ok-spec-resolve\\n
    `;
    const r = spawnSync("bash", ["-c", bash], { cwd: REPO_ROOT, encoding: "utf8", env: process.env });
    assert.equal(r.status, 0, `${r.stderr}\n${r.stdout}`);
    assert.match(r.stdout, /ok-spec-resolve/);
  });

  it("workflow_trial_range claude haiku-5-5 resolves [SC-CAT-ALIAS]", () => {
    const bash = `
      export ECHO_EXEC=:
      workflow_trial_agentstream() { :; }
      # shellcheck source=scripts/build-commands.sh
      source "${BUILD_COMMANDS}"
      workflow_trial_range claude haiku-5-5 medium 1 1 : 2>/dev/null
      [[ "\${MODEL_SLUG:-}" == "claude-haiku-5-5" ]] || exit 3
      [[ "\${MODEL_CONFIG:-}" == "claude-haiku-5-5" ]] || exit 4
      [[ "\${MODEL_EFFORT:-}" == "medium" ]] || exit 5
      printf ok-haiku-alias\\n
    `;
    const r = spawnSync("bash", ["-c", bash], { cwd: REPO_ROOT, encoding: "utf8", env: process.env });
    assert.equal(r.status, 0, `${r.stderr}\n${r.stdout}`);
    assert.match(r.stdout, /ok-haiku-alias/);
  });

  it("workflow_trial_range unknown config id fails before loop [SC-SPEC-UNKNOWN]", () => {
    const bash = `
      _wf_calls=0
      workflow_trial_agentstream() { _wf_calls=$((_wf_calls + 1)); }
      # shellcheck source=scripts/build-commands.sh
      source "${BUILD_COMMANDS}"
      workflow_trial_range cursor not-a-real-id - 1 1 : 2>/dev/null || true
      [[ "\${_wf_calls}" -eq 0 ]] || exit 2
      printf ok-unknown\\n
    `;
    const r = spawnSync("bash", ["-c", bash], { cwd: REPO_ROOT, encoding: "utf8", env: process.env });
    assert.equal(r.status, 0, `${r.stderr}\n${r.stdout}`);
    assert.match(r.stdout, /ok-unknown/);
  });

  it("workflow_trial_range warns on cursor composer plus effort [SC-RANGE-WARN]", () => {
    const bash = `
      export ECHO_EXEC=:
      workflow_trial_agentstream() { :; }
      # shellcheck source=scripts/build-commands.sh
      source "${BUILD_COMMANDS}"
      workflow_trial_range cursor composer-2.5 medium 1 1 : 2>&1
    `;
    const r = spawnSync("bash", ["-c", bash], { cwd: REPO_ROOT, encoding: "utf8", env: process.env });
    assert.equal(r.status, 0, r.stderr);
    const out = `${r.stderr}\n${r.stdout}`;
    const matches = out.match(/DIAGNOSTIC: workflow_trial_range: MODEL_EFFORT=medium ignored/g);
    assert.ok(matches);
    assert.equal(matches.length, 1);
  });

  it("orchestrator sources proof manifest gate inc [REQ-WF_TRIAL_RANGE_PROOF_MANIFEST_MANDATE]", () => {
    const src = fs.readFileSync(SCRIPT, "utf8");
    assert.ok(src.includes("wf-trial-proof-manifest-gate.inc.sh"));
    assert.ok(fs.existsSync(PROOF_MANIFEST_GATE_INC));
    assert.ok(fs.existsSync(PROOF_MANIFEST_GATE_MJS));
  });

  it("help documents default proof manifest gate and SKIP [SC-RPM-06]", () => {
    const r = runScript(["--help"]);
    assert.match(r.stderr, /Proof manifest gate default on/);
    assert.match(r.stderr, /WF_TRIAL_SKIP_PROOF_MANIFEST/);
    assert.doesNotMatch(r.stderr, /WF_TRIAL_REQUIRE_PROOF_MANIFEST/);
  });

  it("help documents phase handoff gate and SKIP [SC-WF-PHG-03]", () => {
    const r = runScript(["--help"]);
    assert.match(r.stderr, /Phase handoff gate default on/);
    assert.match(r.stderr, /WF_TRIAL_SKIP_PHASE_HANDOFF_GATE/);
  });

  it("orchestrator sources phase handoff gate inc [REQ-WF_TRIAL_PHASE_HANDOFF_GATE]", () => {
    const src = fs.readFileSync(SCRIPT, "utf8");
    assert.ok(src.includes("wf-trial-phase-handoff-gate.inc.sh"));
    assert.ok(fs.existsSync(PHASE_HANDOFF_GATE_INC));
    assert.ok(fs.existsSync(PRODUCT_REQ_INC));
  });

  it("wf_trial_phase_handoff_gate_check fails when handoffs missing [SC-WF-PHG-01]", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "wf-phg-"));
    try {
      const token = "REQ-PHG-FIXTURE";
      const ev = path.join(tmp, "tied-project/working", token, "evidence");
      fs.mkdirSync(ev, { recursive: true });
      fs.writeFileSync(
        path.join(ev, "phase-handoff-add-feature.md"),
        "- **request_token:** `REQ-PHG-FIXTURE`\n",
      );
      const bash = `
        # shellcheck source=scripts/lib/wf-trial-phase-handoff-gate.inc.sh
        source "${PHASE_HANDOFF_GATE_INC}"
        unset WF_TRIAL_SKIP_PHASE_HANDOFF_GATE
        wf_trial_phase_handoff_gate_check "${tmp}" "${REPO_ROOT}"
      `;
      const r = spawnSync("bash", ["-c", bash], { cwd: REPO_ROOT, encoding: "utf8", env: process.env });
      assert.notEqual(r.status, 0);
      assert.match(r.stderr, /phase handoff gate: missing/);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("wf_trial_resolve_product_req_token table REQ token row [SC-WF-PHG-06]", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "wf-phg-table-"));
    try {
      const token = "REQ-PHG-TABLE-TOKEN";
      const ev = path.join(tmp, "tied-project/working", token, "evidence");
      fs.mkdirSync(ev, { recursive: true });
      fs.writeFileSync(
        path.join(ev, "phase-handoff-add-feature.md"),
        `| Field | Value |\n| --- | --- |\n| REQ token | \`${token}\` |\n`,
      );
      const bash = `
        # shellcheck source=scripts/lib/wf-trial-product-req.inc.sh
        source "${PRODUCT_REQ_INC}"
        wf_trial_resolve_product_req_token "${tmp}"
      `;
      const r = spawnSync("bash", ["-c", bash], { cwd: REPO_ROOT, encoding: "utf8", env: process.env });
      assert.equal(r.status, 0, r.stderr);
      assert.equal(r.stdout.trim(), token);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("wf_trial_resolve_product_req_token table REQ row only [SC-WF-PHG-06]", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "wf-phg-req-col-"));
    try {
      const token = "REQ-PHG-TABLE-REQ-COL";
      const ev = path.join(tmp, "tied-project/working", token, "evidence");
      fs.mkdirSync(ev, { recursive: true });
      fs.writeFileSync(
        path.join(ev, "phase-handoff-add-feature.md"),
        `| REQ | \`${token}\` |\n`,
      );
      const bash = `
        # shellcheck source=scripts/lib/wf-trial-product-req.inc.sh
        source "${PRODUCT_REQ_INC}"
        wf_trial_resolve_product_req_token "${tmp}"
      `;
      const r = spawnSync("bash", ["-c", bash], { cwd: REPO_ROOT, encoding: "utf8", env: process.env });
      assert.equal(r.status, 0, r.stderr);
      assert.equal(r.stdout.trim(), token);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("wf_trial_resolve_product_req_token dirname fallback [SC-WF-PHG-06]", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "wf-phg-dirfb-"));
    try {
      const token = "REQ-PHG-DIR-FALLBACK";
      const ev = path.join(tmp, "tied-project/working", token, "evidence");
      fs.mkdirSync(ev, { recursive: true });
      fs.writeFileSync(path.join(ev, "phase-handoff-add-feature.md"), "# empty handoff body\n");
      const bash = `
        # shellcheck source=scripts/lib/wf-trial-product-req.inc.sh
        source "${PRODUCT_REQ_INC}"
        wf_trial_resolve_product_req_token "${tmp}"
      `;
      const r = spawnSync("bash", ["-c", bash], { cwd: REPO_ROOT, encoding: "utf8", env: process.env });
      assert.equal(r.status, 0, r.stderr);
      assert.equal(r.stdout.trim(), token);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("wf_trial_phase_handoff_gate_check happy without package.json [SC-WF-PHG-06]", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "wf-phg-happy-"));
    try {
      const token = "REQ-PHG-GATE-HAPPY";
      const ev = path.join(tmp, "tied-project/working", token, "evidence");
      fs.mkdirSync(ev, { recursive: true });
      fs.writeFileSync(
        path.join(ev, "phase-handoff-add-feature.md"),
        `| REQ token | \`${token}\` |\n`,
      );
      fs.writeFileSync(path.join(ev, "phase-handoff-refine-plan.md"), "ok\n");
      fs.writeFileSync(path.join(ev, "phase-handoff-build-plan.md"), "ok\n");
      const bash = `
        # shellcheck source=scripts/lib/wf-trial-phase-handoff-gate.inc.sh
        source "${PHASE_HANDOFF_GATE_INC}"
        unset WF_TRIAL_SKIP_PHASE_HANDOFF_GATE
        wf_trial_phase_handoff_gate_check "${tmp}" "${REPO_ROOT}"
      `;
      const r = spawnSync("bash", ["-c", bash], { cwd: REPO_ROOT, encoding: "utf8", env: process.env });
      assert.equal(r.status, 0, `${r.stderr}\n${r.stdout}`);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("wf_trial_phase_handoff_gate_check resolve diagnostics [SC-WF-PHG-06]", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "wf-phg-diag-"));
    try {
      const orch = path.join(tmp, "tied-project/working/wf-trial-orchestrator-run");
      fs.mkdirSync(orch, { recursive: true });
      const unparsed = path.join(tmp, "tied-project/working/NOT-A-REQ-FOLDER", "evidence");
      fs.mkdirSync(unparsed, { recursive: true });
      fs.writeFileSync(path.join(unparsed, "phase-handoff-add-feature.md"), "no parseable token here\n");
      const bash = `
        # shellcheck source=scripts/lib/wf-trial-phase-handoff-gate.inc.sh
        source "${PHASE_HANDOFF_GATE_INC}"
        unset WF_TRIAL_SKIP_PHASE_HANDOFF_GATE
        wf_trial_phase_handoff_gate_check "${tmp}" "${REPO_ROOT}"
      `;
      const r = spawnSync("bash", ["-c", bash], { cwd: REPO_ROOT, encoding: "utf8", env: process.env });
      assert.notEqual(r.status, 0, "expected resolve failure");
      assert.match(r.stderr, /could not resolve product REQ/);
      assert.match(r.stderr, /wf-trial-orchestrator-run/);
      assert.match(r.stderr, /found-unparsed:/);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("WF_TRIAL_SKIP_PHASE_HANDOFF_GATE=1 skips phase handoff gate [SC-WF-PHG-04]", () => {
    const bash = `
      # shellcheck source=scripts/lib/wf-trial-phase-handoff-gate.inc.sh
      source "${PHASE_HANDOFF_GATE_INC}"
      export WF_TRIAL_SKIP_PHASE_HANDOFF_GATE=1
      wf_trial_phase_handoff_gate_check /nonexistent "${REPO_ROOT}"
      printf ok-skip\\n
    `;
    const r = spawnSync("bash", ["-c", bash], { cwd: REPO_ROOT, encoding: "utf8", env: process.env });
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /ok-skip/);
  });

  it("materialize_wf_trial_minimal_checklist_tracker copy-if-absent [SC-WF-CLP-05]", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "wf-tracker-seed-"));
    try {
      const token = "REQ-TRACKER-SEED";
      const ev = path.join(tmp, "tied-project/working", token, "evidence");
      fs.mkdirSync(ev, { recursive: true });
      fs.writeFileSync(
        path.join(ev, "phase-handoff-add-feature.md"),
        "request_token: REQ-TRACKER-SEED\n",
      );
      const bash = `
        # shellcheck source=scripts/lib/wf-trial-product-req.inc.sh
        source "${PRODUCT_REQ_INC}"
        materialize_wf_trial_minimal_checklist_tracker "${tmp}" "${REPO_ROOT}"
        test -f "${tmp}/tied-project/working/${token}/checklist-tracker.yaml"
      `;
      const r = spawnSync("bash", ["-c", bash], { cwd: REPO_ROOT, encoding: "utf8", env: process.env });
      assert.equal(r.status, 0, `${r.stderr}\n${r.stdout}`);
      const tracker = fs.readFileSync(
        path.join(tmp, "tied-project/working", token, "checklist-tracker.yaml"),
        "utf8",
      );
      assert.match(tracker, /REQ-TRACKER-SEED/);
      assert.match(tracker, /verification-gate/);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("gate enabled without env vars [SC-RPM-01]", () => {
    const bash = `
      # shellcheck source=scripts/lib/wf-trial-proof-manifest-gate.inc.sh
      source "${PROOF_MANIFEST_GATE_INC}"
      unset WF_TRIAL_SKIP_PROOF_MANIFEST
      wf_trial_proof_manifest_gate_enabled || exit 1
      printf ok-gate-enabled\\n
    `;
    const r = spawnSync("bash", ["-c", bash], { cwd: REPO_ROOT, encoding: "utf8", env: process.env });
    assert.equal(r.status, 0, `${r.stderr}\n${r.stdout}`);
    assert.match(r.stdout, /ok-gate-enabled/);
  });

  it("shell sources omit WF_TRIAL_REQUIRE_PROOF_MANIFEST [SC-RPM-01]", () => {
    const buildCommands = fs.readFileSync(BUILD_COMMANDS, "utf8");
    const gateInc = fs.readFileSync(PROOF_MANIFEST_GATE_INC, "utf8");
    assert.doesNotMatch(buildCommands, /WF_TRIAL_REQUIRE_PROOF_MANIFEST/);
    assert.doesNotMatch(gateInc, /WF_TRIAL_REQUIRE_PROOF_MANIFEST/);
  });

  it("gate applies to WF-03 (G5 all PROMPT-WF)", () => {
    const bash = `
      # shellcheck source=scripts/lib/wf-trial-proof-manifest-gate.inc.sh
      source "${PROOF_MANIFEST_GATE_INC}"
      wf_trial_proof_manifest_gate_applies WF-03 || exit 1
      wf_trial_proof_manifest_gate_applies WF-13 && exit 2
      printf ok-gate-applies\\n
    `;
    const r = spawnSync("bash", ["-c", bash], { cwd: REPO_ROOT, encoding: "utf8", env: process.env });
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /ok-gate-applies/);
  });

  it("dry-run skips proof manifest gate [SC-RPM-02]", () => {
    const workspace = fs.mkdtempSync(path.join(os.tmpdir(), "wf-trial-gate-dry-"));
    const r = runScript(["wf-09", "--dry-run", "--workspace", workspace]);
    assert.equal(r.status, 0, `${r.stderr}\n${r.stdout}`);
  });

  it("workflow_trial_range exports MODEL_EFFORT in shell [REQ-WF_TRIAL_MODEL_EFFORT]", () => {
    const bash = `
      workflow_trial_agentstream() { :; }
      # shellcheck source=scripts/build-commands.sh
      source "${BUILD_COMMANDS}"
      workflow_trial_range cursor luna medium 1 1 : 2>/dev/null || true
      [[ "\${MODEL_EFFORT:-}" == "medium" ]] || exit 1
      [[ "\${MODEL_SLUG:-}" == "gpt-5.6-luna-medium-fast" ]] || exit 3
      workflow_trial_range cursor luna-low - 1 1 : 2>/dev/null || true
      [[ -z "\${MODEL_EFFORT+x}" ]] || [[ -z "\${MODEL_EFFORT:-}" ]] || exit 2
      printf ok-range-effort\\n
    `;
    const r = spawnSync("bash", ["-c", bash], { cwd: REPO_ROOT, encoding: "utf8", env: process.env });
    assert.equal(r.status, 0, `${r.stderr}\n${r.stdout}`);
    assert.match(r.stdout, /ok-range-effort/);
  });

  it("orchestrator sources abort signal inc [REQ-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL]", () => {
    const src = fs.readFileSync(SCRIPT, "utf8");
    assert.ok(src.includes("wf-trial-abort-signal.inc.sh"));
    assert.ok(fs.existsSync(ABORT_SIGNAL_INC));
  });

  it("wf_trial_classify_incomplete_reason incident 1794504138 [SC-WF-ABS-01]", () => {
    const stdout = fs.readFileSync(FIXTURE_1794504138_STDOUT_TAIL, "utf8");
    const stderr = fs.readFileSync(FIXTURE_1794504138_STDERR, "utf8");
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "wf-abs-fixture-"));
    try {
      const stdoutPath = path.join(tmp, "out.log");
      const stderrPath = path.join(tmp, "err.log");
      fs.writeFileSync(stdoutPath, stdout);
      fs.writeFileSync(stderrPath, stderr);
      const bash = `
        # shellcheck source=scripts/lib/wf-trial-abort-signal.inc.sh
        source "${ABORT_SIGNAL_INC}"
        wf_trial_classify_incomplete_reason_from_logs "${stdoutPath}" "${stderrPath}"
        printf '%s\\n' "$WF_TRIAL_INCOMPLETE_REASON"
        printf '%s\\n' "$WF_TRIAL_INCOMPLETE_TURN"
      `;
      const r = spawnSync("bash", ["-c", bash], { cwd: REPO_ROOT, encoding: "utf8", env: process.env });
      assert.equal(r.status, 0, r.stderr);
      const lines = r.stdout.trim().split("\n");
      assert.equal(lines[0], "claude_session_limit");
      assert.equal(lines[1], "3");
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("wf_trial_classify_incomplete_reason missing session turn 2 [SC-WF-ABS-02]", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "wf-abs-turn2-"));
    try {
      const stderrPath = path.join(tmp, "err.log");
      fs.writeFileSync(
        stderrPath,
        `--- turn 1/4 (new session) ---
session_id=aaa

--- turn 2/4 (new session) ---
ERROR: something else
`,
      );
      const stdoutPath = path.join(tmp, "out.log");
      fs.writeFileSync(stdoutPath, "no limit here\n");
      const bash = `
        # shellcheck source=scripts/lib/wf-trial-abort-signal.inc.sh
        source "${ABORT_SIGNAL_INC}"
        wf_trial_classify_incomplete_reason_from_logs "${stdoutPath}" "${stderrPath}"
        printf '%s\\n' "$WF_TRIAL_INCOMPLETE_REASON"
        printf '%s\\n' "$WF_TRIAL_INCOMPLETE_TURN"
      `;
      const r = spawnSync("bash", ["-c", bash], { cwd: REPO_ROOT, encoding: "utf8", env: process.env });
      assert.equal(r.status, 0, r.stderr);
      const lines = r.stdout.trim().split("\n");
      assert.equal(lines[0], "turn_missing_session_id");
      assert.equal(lines[1], "2");
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("phase handoff gate skips when provider abort and no product REQ [SC-WF-ABS-05]", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "wf-abs-gate-skip-"));
    try {
      fs.mkdirSync(path.join(tmp, "tied-project/working"), { recursive: true });
      const bash = `
        # shellcheck source=scripts/lib/wf-trial-phase-handoff-gate.inc.sh
        source "${PHASE_HANDOFF_GATE_INC}"
        export WF_TRIAL_INCOMPLETE_REASON=claude_session_limit
        export WF_TRIAL_INCOMPLETE_TURN=1
        unset WF_TRIAL_SKIP_PHASE_HANDOFF_GATE
        wf_trial_phase_handoff_gate_check "${tmp}" "${REPO_ROOT}"
      `;
      const r = spawnSync("bash", ["-c", bash], { cwd: REPO_ROOT, encoding: "utf8", env: process.env });
      assert.equal(r.status, 0, r.stderr);
      assert.match(r.stderr, /skipped \(incomplete batch; no product REQ\)/);
      assert.doesNotMatch(r.stderr, /ERROR: WF trial phase handoff gate: could not resolve product REQ/);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("post-classifier highlight before incomplete_reason DIAGNOSTIC [SC-WF-ABS-06]", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "wf-abs-hl-order-"));
    try {
      const evRel = "tied-project/working/wf-trial-orchestrator-run/evidence";
      const ev = path.join(tmp, evRel);
      fs.mkdirSync(ev, { recursive: true });
      const stdout = fs.readFileSync(FIXTURE_1794504138_STDOUT_TAIL, "utf8");
      fs.writeFileSync(path.join(ev, "process.stdout.log"), stdout);
      fs.writeFileSync(path.join(ev, "process.stderr.log"), fs.readFileSync(FIXTURE_1794504138_STDERR, "utf8"));
      const bash = `
        # shellcheck source=scripts/lib/wf-trial-abort-signal.inc.sh
        source "${ABORT_SIGNAL_INC}"
        wf_trial_abort_signal_apply_workspace "${tmp}"
      `;
      const r = spawnSync("bash", ["-c", bash], { cwd: REPO_ROOT, encoding: "utf8", env: process.env });
      assert.equal(r.status, 0, r.stderr);
      const errIdx = r.stderr.indexOf(
        "DIAGNOSTIC: wf_trial_incomplete_reason=claude_session_limit",
      );
      const headlineIdx = r.stderr.indexOf(
        "ERROR: WF trial stopped: Claude session capacity limit",
      );
      assert.ok(headlineIdx >= 0, r.stderr);
      assert.ok(errIdx >= 0, r.stderr);
      assert.ok(headlineIdx < errIdx, `highlight ${headlineIdx} diag ${errIdx}`);
      assert.match(r.stderr, /session limit/);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("preflight blocks on smoke session limit without STRICT [SC-WF-ABS-07]", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "wf-abs-preflight-limit-"));
    try {
      const working = path.join(tmp, "tied-project/working");
      fs.mkdirSync(working, { recursive: true });
      const limitDetail =
        "You've hit your session limit · resets 2:20pm (America/Los_Angeles)";
      fs.writeFileSync(
        path.join(working, "tied-claude-client-validation.v1.json"),
        JSON.stringify(
          {
            schema_version: "tied-claude-client-validation.v1",
            ok: false,
            checks: [
              {
                id: "claude_code_interactive_smoke",
                status: "fail",
                detail: limitDetail,
              },
            ],
          },
          null,
          2,
        ),
      );
      const bash = `
        # shellcheck source=scripts/lib/wf-trial-claude-preflight.inc.sh
        source "${PREFLIGHT_INC}"
        unset WF_TRIAL_STRICT_PREFLIGHT
        wf_trial_handle_claude_validation_exit 1 "${tmp}"
        echo exit=$?
      `;
      const r = spawnSync("bash", ["-c", bash], { cwd: REPO_ROOT, encoding: "utf8", env: process.env });
      assert.equal(r.status, 0, r.stderr);
      assert.match(r.stdout, /exit=1/);
      assert.match(r.stderr, /ERROR: WF trial stopped: Claude session capacity limit/);
      assert.doesNotMatch(
        r.stderr,
        /continuing may weaken MCP parity/,
      );
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("preflight advisory when validation fails for non-limit reason [SC-WF-ABS-07]", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "wf-abs-preflight-other-"));
    try {
      const working = path.join(tmp, "tied-project/working");
      fs.mkdirSync(working, { recursive: true });
      fs.writeFileSync(
        path.join(working, "tied-claude-client-validation.v1.json"),
        JSON.stringify(
          {
            schema_version: "tied-claude-client-validation.v1",
            ok: false,
            checks: [
              {
                id: "mcp_json_harness_contract",
                status: "fail",
                detail: "TIED_BASE_PATH missing",
              },
            ],
          },
          null,
          2,
        ),
      );
      const bash = `
        # shellcheck source=scripts/lib/wf-trial-claude-preflight.inc.sh
        source "${PREFLIGHT_INC}"
        unset WF_TRIAL_STRICT_PREFLIGHT
        wf_trial_handle_claude_validation_exit 1 "${tmp}"
        echo exit=$?
      `;
      const r = spawnSync("bash", ["-c", bash], { cwd: REPO_ROOT, encoding: "utf8", env: process.env });
      assert.equal(r.status, 0, r.stderr);
      assert.match(r.stdout, /exit=0/);
      assert.match(r.stderr, /continuing may weaken MCP parity/);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("wf_trial_emit_session_limit_highlight contract [SC-WF-ABS-06]", () => {
    const bash = `
      # shellcheck source=scripts/lib/wf-trial-operator-highlight.inc.sh
      source "${OPERATOR_HIGHLIGHT_INC}"
      wf_trial_emit_session_limit_highlight "You've hit your session limit"
    `;
    const r = spawnSync("bash", ["-c", bash], { cwd: REPO_ROOT, encoding: "utf8", env: process.env });
    assert.equal(r.status, 0, r.stderr);
    const lines = r.stderr.split("\n");
    assert.equal(
      lines[0],
      "ERROR: WF trial stopped: Claude session capacity limit",
    );
    assert.match(lines[1], /session limit/);
    assert.match(r.stderr, /harness=cursor/);
  });

  it("proof manifest gate skips when provider abort [SC-WF-ABS-05]", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "wf-abs-proof-skip-"));
    try {
      const bash = `
        # shellcheck source=scripts/lib/wf-trial-proof-manifest-gate.inc.sh
        source "${PROOF_MANIFEST_GATE_INC}"
        export WF_TRIAL_INCOMPLETE_REASON=claude_session_limit
        wf_trial_proof_manifest_gate_check "${tmp}" "WF-10" "${REPO_ROOT}"
      `;
      const r = spawnSync("bash", ["-c", bash], { cwd: REPO_ROOT, encoding: "utf8", env: process.env });
      assert.equal(r.status, 0, r.stderr);
      assert.match(r.stderr, /proof manifest gate: skipped \(incomplete batch/);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("phase handoff gate emits incomplete_reason before ERROR [SC-WF-ABS-04]", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "wf-abs-gate-order-"));
    try {
      const token = "REQ-ABS-GATE-ORDER";
      const ev = path.join(tmp, "tied-project/working", token, "evidence");
      fs.mkdirSync(ev, { recursive: true });
      fs.writeFileSync(
        path.join(ev, "phase-handoff-add-feature.md"),
        `request_token: ${token}\n`,
      );
      const bash = `
        # shellcheck source=scripts/lib/wf-trial-phase-handoff-gate.inc.sh
        source "${PHASE_HANDOFF_GATE_INC}"
        export WF_TRIAL_INCOMPLETE_REASON=claude_session_limit
        export WF_TRIAL_INCOMPLETE_TURN=3
        unset WF_TRIAL_SKIP_PHASE_HANDOFF_GATE
        wf_trial_phase_handoff_gate_check "${tmp}" "${REPO_ROOT}"
      `;
      const r = spawnSync("bash", ["-c", bash], { cwd: REPO_ROOT, encoding: "utf8", env: process.env });
      assert.notEqual(r.status, 0);
      const diagIdx = r.stderr.indexOf("DIAGNOSTIC: wf_trial_incomplete_reason=claude_session_limit");
      const errIdx = r.stderr.indexOf("ERROR: WF trial phase handoff gate:");
      assert.ok(diagIdx >= 0);
      assert.ok(errIdx >= 0);
      assert.ok(diagIdx < errIdx, `diag at ${diagIdx} err at ${errIdx}`);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("live-executor exports emitTurnOperatorLine dual-stream helper [SC-WF-SPT-04]", () => {
    const liveExecutorSrc = fs.readFileSync(
      path.join(REPO_ROOT, "mcp-server/packages/agentstream/src/live-executor.ts"),
      "utf8",
    );
    assert.match(liveExecutorSrc, /export function emitTurnOperatorLine/);
    assert.match(liveExecutorSrc, /writeSync\(1,/);
    assert.match(liveExecutorSrc, /writeSync\(2,/);
    assert.doesNotMatch(
      liveExecutorSrc,
      /stderrAcc \+= `\\n--- turn /,
      "turn banner must use emitTurnOperatorLine, not stderrAcc",
    );
    assert.doesNotMatch(
      liveExecutorSrc,
      /stderrAcc \+= `session_id=\$\{/,
      "session_id operator line must use emitTurnOperatorLine",
    );
  });

  it("emitTurnOperatorLine smoke via tsx [SC-WF-SPT-04]", () => {
    const liveExecutor = path.join(
      REPO_ROOT,
      "mcp-server/packages/agentstream/dist/live-executor.js",
    );
    if (!fs.existsSync(liveExecutor)) {
      const r = spawnSync("npm", ["run", "build"], {
        cwd: path.join(REPO_ROOT, "mcp-server/packages/agentstream"),
        encoding: "utf8",
        env: process.env,
      });
      assert.equal(r.status, 0, r.stderr || r.stdout);
    }
    const code = `
      import { emitTurnOperatorLine } from "./dist/live-executor.js";
      const streams = { stdoutAcc: "", stderrAcc: "keep\\n" };
      const line = "--- turn 1/2 (new session) ---\\n";
      const order = [];
      const writeSync = (fd, buf) => { order.push(fd); return String(buf).length; };
      const r = emitTurnOperatorLine(line, streams, writeSync);
      if (!r.ok) process.exit(2);
      if (streams.stderrAcc !== "keep\\n") process.exit(3);
      if (!streams.stdoutAcc.includes("--- turn 1/2")) process.exit(4);
      if (JSON.stringify(order) !== "[1,2]") process.exit(5);
      console.log("ok-spt-smoke");
    `;
    const r = spawnSync("node", ["--input-type=module", "-e", code], {
      cwd: path.join(REPO_ROOT, "mcp-server/packages/agentstream"),
      encoding: "utf8",
      env: process.env,
    });
    assert.equal(r.status, 0, `${r.stderr}\n${r.stdout}`);
    assert.match(r.stdout, /ok-spt-smoke/);
  });

  it("wf_trial_process_log_set_incomplete_reason merges manifest [SC-WF-ABS-01]", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "wf-abs-manifest-"));
    try {
      const manifest = path.join(tmp, "wf-trial-orchestrator-run.v1.json");
      fs.writeFileSync(
        manifest,
        `${JSON.stringify({ schema: "wf-trial-orchestrator-run.v1", exit_code: 1 }, null, 2)}\n`,
      );
      const bash = `
        # shellcheck source=scripts/lib/wf-trial-process-log.inc.sh
        source "${path.join(REPO_ROOT, "scripts/lib/wf-trial-process-log.inc.sh")}"
        wf_trial_process_log_set_incomplete_reason "${manifest}" claude_session_limit 3
      `;
      const r = spawnSync("bash", ["-c", bash], { cwd: REPO_ROOT, encoding: "utf8", env: process.env });
      assert.equal(r.status, 0, r.stderr);
      const doc = JSON.parse(fs.readFileSync(manifest, "utf8"));
      assert.equal(doc.incomplete_reason, "claude_session_limit");
      assert.equal(doc.incomplete_turn, 3);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("WF_TRIAL_SKIP_PROCESS_LOG=1 skips evidence dir [REQ-WF_TRIAL_ORCHESTRATOR_PROCESS_LOG]", () => {
    if (!fs.existsSync(TIED_CLI)) {
      console.log("DEBUG: skip — built tied CLI missing:", TIED_CLI);
      return;
    }
    const workspace = fs.mkdtempSync(path.join(os.tmpdir(), "wf-trial-skip-"));
    const r = runScript(["wf-02", "--dry-run", "--workspace", workspace], {
      WF_TRIAL_SKIP_PROCESS_LOG: "1",
    });
    assert.equal(r.status, 0, `${r.stderr}\n${r.stdout}`);
    const evidenceDir = path.join(
      workspace,
      "tied-project/working/wf-trial-orchestrator-run/evidence",
    );
    assert.equal(fs.existsSync(evidenceDir), false);
    assert.doesNotMatch(r.stderr, /DIAGNOSTIC: wf-trial process log manifest=/);
  });
});
