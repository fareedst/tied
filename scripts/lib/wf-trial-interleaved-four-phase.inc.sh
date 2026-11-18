# wf-trial-interleaved-four-phase.inc.sh — four agentstream invokes with post-turn-1 tracker reconcile.
# [REQ-WF_TRIAL_SLIM_TRACKER_INTER_TURN] [REQ-WF_TRIAL_INTERLEAVED_RESUME_CAPTURE]
# [REQ-WF_TRIAL_FOUR_PHASE_SHELL_EXIT]

wf_trial_interleaved_seed_enabled() {
  [[ "${WF_TRIAL_SKIP_INTERLEAVED_TRACKER_SEED:-}" == "1" ]] && return 1
  return 0
}

wf_trial_parse_session_id_from_stdout_file() {
  wf_trial_parse_session_id_from_capture_file "$1"
}

wf_trial_parse_session_id_from_capture_file() {
  local file="$1"
  [[ -f "$file" ]] || return 1
  gawk '/^session_id=/ { sub(/^session_id=/, ""); gsub(/[[:space:]]+$/, ""); print; exit }' "$file"
}

# stdout first, then stderr (SC-WF-SPT-03 may leave session_id only on fd 2).
wf_trial_parse_session_id_from_turn_capture() {
  local stdout_file="$1"
  local stderr_file="$2"
  local sid=""
  sid="$(wf_trial_parse_session_id_from_capture_file "$stdout_file" || true)"
  if [[ -n "$sid" ]]; then
    printf '%s' "$sid"
    return 0
  fi
  sid="$(wf_trial_parse_session_id_from_capture_file "$stderr_file" || true)"
  if [[ -n "$sid" ]]; then
    printf '%s' "$sid"
    return 0
  fi
  return 1
}

# Run one turn per agentstream process; reconcile after order 1 when enabled.
# Returns agentstream exit status (0-255).
wf_trial_four_phase_run_interleaved() {
  local store_root="$1"
  local workspace="$2"
  shift 2
  local -a base_cmd=("$@")
  local order=1 session_id="" ec=0 stdout_file stderr_file reconcile_ran=0
  stdout_file="$(mktemp -t wf-trial-interleaved-stdout)"
  stderr_file="$(mktemp -t wf-trial-interleaved-stderr)"
  _wf_trial_interleaved_rm_capture_files() {
    rm -f -- "${stdout_file}" "${stderr_file}"
  }

  for order in 1 2 3 4; do
    operator_stderr_line DIAGNOSTIC "WF trial interleaved phase ${order}/4"
    : >"$stdout_file"
    : >"$stderr_file"
    local -a turn_cmd=("${base_cmd[@]}" --feature-spec-batch-order "$order")
    if [[ "$order" -gt 1 ]]; then
      [[ -n "$session_id" ]] || {
        printf 'ERROR: WF trial interleaved: missing session_id after turn %s\n' "$((order - 1))" >&2
        _wf_trial_interleaved_rm_capture_files
        return 1
      }
      turn_cmd+=(--resume "$session_id")
    fi
    set +e
    wf_trial_four_phase_run_agentstream "${turn_cmd[@]}" >"$stdout_file" 2>"$stderr_file"
    ec=$?
    set -e
    if ((ec != 0)); then
      _wf_trial_interleaved_rm_capture_files
      return "$ec"
    fi
    session_id="$(wf_trial_parse_session_id_from_turn_capture "$stdout_file" "$stderr_file" || true)"
    if [[ "$order" -eq 1 ]]; then
      wf_trial_reconcile_slim_checklist_tracker "$workspace" "$store_root" || {
        _wf_trial_interleaved_rm_capture_files
        return $?
      }
      reconcile_ran=1
    fi
  done

  if ((reconcile_ran)); then
    operator_stderr_line DIAGNOSTIC "WF trial interleaved: four-phase batch complete (reconcile after turn 1)"
  fi
  _wf_trial_interleaved_rm_capture_files
  return 0
}