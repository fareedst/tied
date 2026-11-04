# [IMPL-CLAUDE_WF03_LIVE_MATRIX_GAPS] [REQ-CLAUDE_WF03_LIVE_MATRIX_GAPS]
# wf_trial_handle_claude_validation_exit — advisory vs strict preflight after validation script.

wf_trial_handle_claude_validation_exit() {
  local validation_exit="$1"
  if [[ "$validation_exit" -eq 0 ]]; then
    return 0
  fi
  if [[ -n "${WF_TRIAL_STRICT_PREFLIGHT:-}" && "${WF_TRIAL_STRICT_PREFLIGHT}" != "0" ]]; then
    printf 'ERROR: Claude client validation failed (WF_TRIAL_STRICT_PREFLIGHT=%s)\n' "${WF_TRIAL_STRICT_PREFLIGHT}" >&2
    return 1
  fi
  printf 'DIAGNOSTIC: Claude client validation failed or claude CLI unavailable; continuing may weaken MCP parity\n' >&2
  return 0
}
