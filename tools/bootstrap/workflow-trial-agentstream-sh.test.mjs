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

  it("workflow_trial_range exports MODEL_EFFORT in shell [REQ-WF_TRIAL_MODEL_EFFORT]", () => {
    const bash = `
      # shellcheck source=scripts/build-commands.sh
      source "${BUILD_COMMANDS}"
      workflow_trial_range() { :; }
      # shellcheck source=scripts/build-commands.sh
      source "${BUILD_COMMANDS}"
      workflow_trial_range cursor slug cfg medium 1 1 echo_exec 2>/dev/null || true
      [[ "\${MODEL_EFFORT:-}" == "medium" ]] || exit 1
      workflow_trial_range cursor slug cfg - 1 1 echo_exec 2>/dev/null || true
      [[ -z "\${MODEL_EFFORT+x}" ]] || [[ -z "\${MODEL_EFFORT:-}" ]] || exit 2
      printf ok-range-effort\\n
    `;
    const r = spawnSync("bash", ["-c", bash], { cwd: REPO_ROOT, encoding: "utf8", env: process.env });
    assert.equal(r.status, 0, `${r.stderr}\n${r.stdout}`);
    assert.match(r.stdout, /ok-range-effort/);
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
