# wf-trial-abort-signal.inc.sh — classify four-phase aborts from orchestrator process logs.
# [REQ-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL] [IMPL-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL]

# shellcheck source=scripts/lib/wf-trial-process-log.inc.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)/wf-trial-process-log.inc.sh"

WF_TRIAL_ABORT_EVIDENCE_REL="tied-project/working/wf-trial-orchestrator-run/evidence"

wf_trial_abort_signal_log_paths() {
  local ws="$1"
  WF_TRIAL_ABORT_STDOUT="${ws}/${WF_TRIAL_ABORT_EVIDENCE_REL}/process.stdout.log"
  WF_TRIAL_ABORT_STDERR="${ws}/${WF_TRIAL_ABORT_EVIDENCE_REL}/process.stderr.log"
  WF_TRIAL_ABORT_MANIFEST="${ws}/${WF_TRIAL_ABORT_EVIDENCE_REL}/wf-trial-orchestrator-run.v1.json"
}

# Prints turn number (1-4) when a turn banner is not followed by session_id= before next banner or EOF.
wf_trial_abort_signal_detect_missing_session_turn() {
  local stderr_file="$1"
  [[ -f "$stderr_file" ]] || return 0

  local line="" turn="" pending=0 missing=""
  while IFS= read -r line || [[ -n "$line" ]]; do
    if [[ "$line" =~ ^---[[:space:]]turn[[:space:]]+([0-9]+)/4 ]]; then
      if [[ "$pending" -eq 1 && -n "$turn" ]]; then
        missing="$turn"
      fi
      turn="${BASH_REMATCH[1]}"
      pending=1
    elif [[ "$pending" -eq 1 && "$line" =~ ^session_id= ]]; then
      pending=0
      turn=""
    fi
  done <"$stderr_file"

  if [[ "$pending" -eq 1 && -n "$turn" ]]; then
    missing="$turn"
  fi

  if [[ -n "$missing" ]]; then
    printf '%s' "$missing"
  fi
}

# Sets WF_TRIAL_INCOMPLETE_REASON and optional WF_TRIAL_INCOMPLETE_TURN when signals are present.
wf_trial_abort_signal_analyze_workspace() {
  local ws="$1"
  unset WF_TRIAL_INCOMPLETE_REASON WF_TRIAL_INCOMPLETE_TURN
  export WF_TRIAL_INCOMPLETE_REASON=""
  export WF_TRIAL_INCOMPLETE_TURN=""

  wf_trial_abort_signal_log_paths "$ws"

  local session_limit=0
  if [[ -f "$WF_TRIAL_ABORT_STDOUT" ]] && grep -qi 'session limit' "$WF_TRIAL_ABORT_STDOUT" 2>/dev/null; then
    session_limit=1
  fi

  local missing_turn=""
  missing_turn="$(wf_trial_abort_signal_detect_missing_session_turn "$WF_TRIAL_ABORT_STDERR")"

  if [[ "$session_limit" -eq 1 ]]; then
    export WF_TRIAL_INCOMPLETE_REASON="claude_session_limit"
    if [[ -n "$missing_turn" ]]; then
      export WF_TRIAL_INCOMPLETE_TURN="$missing_turn"
    fi
    return 0
  fi

  if [[ -n "$missing_turn" ]]; then
    export WF_TRIAL_INCOMPLETE_REASON="turn_missing_session_id"
    export WF_TRIAL_INCOMPLETE_TURN="$missing_turn"
    return 0
  fi

  return 0
}

wf_trial_abort_signal_emit_diagnostic() {
  if [[ -z "${WF_TRIAL_INCOMPLETE_REASON:-}" ]]; then
    return 0
  fi
  if [[ -n "${WF_TRIAL_INCOMPLETE_TURN:-}" ]]; then
    printf 'DIAGNOSTIC: wf_trial_incomplete_reason=%s incomplete_turn=%s\n' \
      "$WF_TRIAL_INCOMPLETE_REASON" "$WF_TRIAL_INCOMPLETE_TURN" >&2
  else
    printf 'DIAGNOSTIC: wf_trial_incomplete_reason=%s\n' "$WF_TRIAL_INCOMPLETE_REASON" >&2
  fi
}

wf_trial_abort_signal_apply_workspace() {
  local ws="$1"
  wf_trial_abort_signal_analyze_workspace "$ws"
  wf_trial_abort_signal_emit_diagnostic
  if [[ -n "${WF_TRIAL_INCOMPLETE_REASON:-}" && -f "${WF_TRIAL_ABORT_MANIFEST:-}" ]]; then
    wf_trial_process_log_set_incomplete_reason \
      "$WF_TRIAL_ABORT_MANIFEST" "$WF_TRIAL_INCOMPLETE_REASON" "${WF_TRIAL_INCOMPLETE_TURN:-}"
  fi
}

# Expose for tests: classify from explicit log paths (stdout stderr).
wf_trial_classify_incomplete_reason_from_logs() {
  local stdout_file="$1"
  local stderr_file="$2"
  unset WF_TRIAL_INCOMPLETE_REASON WF_TRIAL_INCOMPLETE_TURN
  export WF_TRIAL_INCOMPLETE_REASON=""
  export WF_TRIAL_INCOMPLETE_TURN=""

  local session_limit=0
  if [[ -f "$stdout_file" ]] && grep -qi 'session limit' "$stdout_file" 2>/dev/null; then
    session_limit=1
  fi

  local missing_turn=""
  missing_turn="$(wf_trial_abort_signal_detect_missing_session_turn "$stderr_file")"

  if [[ "$session_limit" -eq 1 ]]; then
    export WF_TRIAL_INCOMPLETE_REASON="claude_session_limit"
    [[ -n "$missing_turn" ]] && export WF_TRIAL_INCOMPLETE_TURN="$missing_turn"
    return 0
  fi
  if [[ -n "$missing_turn" ]]; then
    export WF_TRIAL_INCOMPLETE_REASON="turn_missing_session_id"
    export WF_TRIAL_INCOMPLETE_TURN="$missing_turn"
  fi
}
