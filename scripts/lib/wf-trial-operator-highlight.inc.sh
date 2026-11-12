# [IMPL-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL] [REQ-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL]
# [REQ-TIED_CLI_OPERATOR_OUTPUT_TEXTURE] — session capacity operator stderr highlight

WF_TRIAL_SESSION_LIMIT_HEADLINE='ERROR: WF trial stopped: Claude session capacity limit'

# Returns first line matching session limit (case-insensitive) from file or inline text.
wf_trial_extract_session_limit_line() {
  local source="${1:-}"
  [[ -n "$source" ]] || return 0

  local text=""
  if [[ -f "$source" ]]; then
    text="$(cat "$source" 2>/dev/null || true)"
  else
    text="$source"
  fi
  [[ -n "$text" ]] || return 0

  local line=""
  while IFS= read -r line || [[ -n "$line" ]]; do
    if [[ "$line" =~ [Ss][Ee][Ss][Ss][Ii][Oo][Nn][[:space:]]+[Ll][Ii][Mm][Ii][Tt] ]]; then
      line="${line#"${line%%[![:space:]]*}"}"
      line="${line%"${line##*[![:space:]]}"}"
      printf '%s' "$line"
      return 0
    fi
  done <<<"$text"
  return 0
}

wf_trial_emit_session_limit_highlight() {
  local human_line="${1:-}"
  printf '%s\n' "$WF_TRIAL_SESSION_LIMIT_HEADLINE" >&2
  if [[ -n "$human_line" ]]; then
    printf '  %s\n' "$human_line" >&2
  fi
  printf '%s\n' 'Hint: retry after the limit resets, try another model, or run with harness=cursor.' >&2
  printf '\n' >&2
}
