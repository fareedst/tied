# wf-trial-process-log.inc.sh — default-on orchestrator stdout/stderr capture for WF trials.
# [REQ-WF_TRIAL_ORCHESTRATOR_PROCESS_LOG] [ARCH-WF_TRIAL_ORCHESTRATOR_PROCESS_LOG] [IMPL-WF_TRIAL_ORCHESTRATOR_PROCESS_LOG]

WF_TRIAL_PROCESS_LOG_FINALIZED="${WF_TRIAL_PROCESS_LOG_FINALIZED:-0}"
WF_TRIAL_PROCESS_LOG_MANIFEST="${WF_TRIAL_PROCESS_LOG_MANIFEST:-}"
WF_TRIAL_PROCESS_LOG_SCHEMA="wf-trial-orchestrator-run.v1"
WF_TRIAL_PROCESS_LOG_EVIDENCE_REL="tied-project/working/wf-trial-orchestrator-run/evidence"

wf_trial_process_log_enabled() {
  if [[ -n "${WF_TRIAL_SKIP_PROCESS_LOG:-}" && "${WF_TRIAL_SKIP_PROCESS_LOG}" != "0" ]]; then
    return 1
  fi
  return 0
}

wf_trial_process_log_bootstrap_stderr_init() {
  WF_TRIAL_BOOTSTRAP_STDERR="$(mktemp "${TMPDIR:-/tmp}/wf-trial-bootstrap-stderr.XXXXXX")"
  export WF_TRIAL_BOOTSTRAP_STDERR
}

_wf_trial_process_log_iso_utc() {
  date -u +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || date -u +"%Y-%m-%dT%H:%M:%SZ"
}

_wf_trial_process_log_write_json() {
  local manifest_path="$1"
  local payload="$2"
  node -e '
    const fs = require("fs");
    const [path, json] = process.argv.slice(1);
    fs.writeFileSync(path, JSON.stringify(JSON.parse(json), null, 2) + "\n");
  ' "$manifest_path" "$payload"
}

_wf_trial_process_log_merge_finalize() {
  local manifest_path="$1"
  local exit_code="$2"
  local finished_at="$3"
  node -e '
    const fs = require("fs");
    const [path, exitCode, finishedAt] = process.argv.slice(1);
    const doc = JSON.parse(fs.readFileSync(path, "utf8"));
    doc.finished_at = finishedAt;
    doc.exit_code = Number(exitCode);
    fs.writeFileSync(path, JSON.stringify(doc, null, 2) + "\n");
  ' "$manifest_path" "$exit_code" "$finished_at"
}

# shellcheck disable=SC2120
wf_trial_process_log_bind_workspace() {
  local workspace="$1"
  local wf_id="$2"
  local repo_root="$3"
  local harness="$4"
  local model_slug="$5"
  local model_config="$6"
  local disposable_tag="${7:-}"
  local dry_run="${8:-0}"
  local bootstrap_prepended="${9:-0}"
  local model_effort="${10:-}"

  if ! wf_trial_process_log_enabled; then
    return 0
  fi

  local evidence_dir="${workspace}/${WF_TRIAL_PROCESS_LOG_EVIDENCE_REL}"
  mkdir -p "$evidence_dir"

  local stdout_log="${evidence_dir}/process.stdout.log"
  local stderr_log="${evidence_dir}/process.stderr.log"
  local manifest="${evidence_dir}/wf-trial-orchestrator-run.v1.json"

  : >"$stdout_log"
  : >"$stderr_log"

  if [[ "$bootstrap_prepended" == "1" && -n "${WF_TRIAL_BOOTSTRAP_STDERR:-}" && -f "$WF_TRIAL_BOOTSTRAP_STDERR" ]]; then
    cat "$WF_TRIAL_BOOTSTRAP_STDERR" >>"$stderr_log"
    rm -f "$WF_TRIAL_BOOTSTRAP_STDERR"
    unset WF_TRIAL_BOOTSTRAP_STDERR
  fi

  # [REQ-TRIAL_METHODOLOGY_VERSION_READOUT] orchestrator pin — secondary to session evidence file
  if command -v node >/dev/null 2>&1 && [[ -n "$repo_root" && -d "$workspace" ]]; then
    local _wf_meth_ver=""
    _wf_meth_ver="$(
      WF_WS="$workspace" node --input-type=module -e "
import { readTiedMethodologyVersionFromProjectRoot } from '${repo_root}/scripts/lib/read-tied-methodology-version.mjs';
try {
  process.stdout.write(readTiedMethodologyVersionFromProjectRoot(process.env.WF_WS || ''));
} catch { /* optional */ }
" 2>/dev/null
    )" || true
    if [[ -n "$_wf_meth_ver" ]]; then
      printf 'DIAGNOSTIC: tied_methodology_version=%s source=orchestrator_resolver (secondary; session evidence file canonical)\n' \
        "$_wf_meth_ver" >>"$stderr_log"
    fi
  fi

  WF_TRIAL_PROCESS_LOG_MANIFEST="$manifest"
  WF_TRIAL_PROCESS_LOG_FINALIZED=0

  local tag_json="null"
  if [[ -n "$disposable_tag" ]]; then
    tag_json="\"${disposable_tag//\"/\\\"}\""
  fi

  local model_effort_json="null"
  if [[ -n "$model_effort" ]]; then
    model_effort_json="\"${model_effort//\"/\\\"}\""
  fi

  local started_at
  started_at="$(_wf_trial_process_log_iso_utc)"

  local payload
  payload="$(
    cat <<EOF
{"schema":"${WF_TRIAL_PROCESS_LOG_SCHEMA}","orchestrator_script":"workflow-trial-agentstream.sh","repo_root":"${repo_root//\"/\\\"}","wf_id":"${wf_id}","workspace":"${workspace//\"/\\\"}","harness":"${harness}","model_slug":"${model_slug//\"/\\\"}","model_config":"${model_config//\"/\\\"}","model_effort":${model_effort_json},"disposable_tag":${tag_json},"dry_run":$([[ "$dry_run" == "1" ]] && echo true || echo false),"log_capture_default":true,"evidence_rel_dir":"${WF_TRIAL_PROCESS_LOG_EVIDENCE_REL}","files":{"stdout_log":"process.stdout.log","stderr_log":"process.stderr.log","manifest":"wf-trial-orchestrator-run.v1.json"},"bootstrap_stderr_prepended":$([[ "$bootstrap_prepended" == "1" ]] && echo true || echo false),"started_at":"${started_at}","finished_at":null,"exit_code":null}
EOF
  )"
  _wf_trial_process_log_write_json "$manifest" "$payload"

  exec > >(tee -a "$stdout_log") 2> >(tee -a "$stderr_log" >&2)

  trap 'wf_trial_process_log_trap_on_exit' EXIT
}

wf_trial_process_log_trap_on_exit() {
  local ec=$?
  wf_trial_process_log_finalize "$ec"
}

wf_trial_process_log_finalize() {
  local exit_code="${1:-0}"

  if [[ "${WF_TRIAL_PROCESS_LOG_FINALIZED}" == "1" ]]; then
    return 0
  fi
  if [[ -z "${WF_TRIAL_PROCESS_LOG_MANIFEST:-}" || ! -f "$WF_TRIAL_PROCESS_LOG_MANIFEST" ]]; then
    return 0
  fi

  WF_TRIAL_PROCESS_LOG_FINALIZED=1
  local finished_at
  finished_at="$(_wf_trial_process_log_iso_utc)"
  _wf_trial_process_log_merge_finalize "$WF_TRIAL_PROCESS_LOG_MANIFEST" "$exit_code" "$finished_at"
  printf 'DIAGNOSTIC: wf-trial process log manifest=%s\n' "$WF_TRIAL_PROCESS_LOG_MANIFEST" >&2
}

# [REQ-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL] Additive manifest fields when abort classifier runs.
wf_trial_process_log_set_incomplete_reason() {
  local manifest_path="$1"
  local reason="$2"
  local turn="${3:-}"

  [[ -f "$manifest_path" ]] || return 0
  [[ -n "$reason" ]] || return 0

  node -e '
    const fs = require("fs");
    const [path, reason, turn] = process.argv.slice(1);
    const doc = JSON.parse(fs.readFileSync(path, "utf8"));
    if (doc.incomplete_reason) {
      process.exit(0);
    }
    doc.incomplete_reason = reason;
    if (turn !== "") {
      const n = Number(turn);
      if (!Number.isNaN(n)) {
        doc.incomplete_turn = n;
      }
    }
    fs.writeFileSync(path, JSON.stringify(doc, null, 2) + "\n");
  ' "$manifest_path" "$reason" "$turn"
}
