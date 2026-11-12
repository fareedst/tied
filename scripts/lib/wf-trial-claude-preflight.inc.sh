# [IMPL-CLAUDE_WF03_LIVE_MATRIX_GAPS] [REQ-CLAUDE_WF03_LIVE_MATRIX_GAPS]
# [IMPL-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL] [REQ-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL]
# wf_trial_handle_claude_validation_exit — advisory vs strict preflight after validation script.

# shellcheck source=scripts/lib/wf-trial-operator-highlight.inc.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)/wf-trial-operator-highlight.inc.sh"

wf_trial_claude_validation_report_path() {
  local client_root="${1:?client_root}"
  if [[ -d "${client_root}/tied-project/working" ]]; then
    printf '%s' "${client_root}/tied-project/working/tied-claude-client-validation.v1.json"
  elif [[ -d "${client_root}/working" ]]; then
    printf '%s' "${client_root}/working/tied-claude-client-validation.v1.json"
  else
    printf '%s' "${client_root}/tied-project/working/tied-claude-client-validation.v1.json"
  fi
}

_wf_trial_claude_smoke_detail_from_report() {
  local report_path="$1"
  [[ -f "$report_path" ]] || return 0
  if ! command -v python3 >/dev/null 2>&1; then
    return 0
  fi
  python3 - "$report_path" <<'PY' 2>/dev/null || true
import json
import sys

path = sys.argv[1]
with open(path, encoding="utf-8") as f:
    doc = json.load(f)
for check in doc.get("checks", []):
    if check.get("id") == "claude_code_interactive_smoke":
        detail = check.get("detail")
        if detail:
            sys.stdout.write(str(detail))
        break
PY
}

_wf_trial_detail_indicates_session_limit() {
  local detail="${1:-}"
  [[ -n "$detail" ]] || return 1
  if [[ "$detail" =~ [Ss][Ee][Ss][Ss][Ii][Oo][Nn][[:space:]]+[Ll][Ii][Mm][Ii][Tt] ]]; then
    return 0
  fi
  return 1
}

wf_trial_handle_claude_validation_exit() {
  local validation_exit="$1"
  local client_root="${2:-}"

  if [[ "$validation_exit" -eq 0 ]]; then
    return 0
  fi

  if [[ -n "$client_root" ]]; then
    local report_path smoke_detail human_line
    report_path="$(wf_trial_claude_validation_report_path "$client_root")"
    smoke_detail="$(_wf_trial_claude_smoke_detail_from_report "$report_path")"
    if _wf_trial_detail_indicates_session_limit "$smoke_detail"; then
      human_line="$(wf_trial_extract_session_limit_line "$smoke_detail")"
      wf_trial_emit_session_limit_highlight "$human_line"
      return 1
    fi
  fi

  if [[ -n "${WF_TRIAL_STRICT_PREFLIGHT:-}" && "${WF_TRIAL_STRICT_PREFLIGHT}" != "0" ]]; then
    printf 'ERROR: Claude client validation failed (WF_TRIAL_STRICT_PREFLIGHT=%s)\n' "${WF_TRIAL_STRICT_PREFLIGHT}" >&2
    return 1
  fi
  printf 'DIAGNOSTIC: Claude client validation failed or claude CLI unavailable; continuing may weaken MCP parity\n' >&2
  return 0
}
