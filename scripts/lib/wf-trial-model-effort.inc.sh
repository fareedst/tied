# wf-trial-model-effort.inc.sh — MODEL_EFFORT validation for WF trial orchestrator.
# [REQ-WF_TRIAL_MODEL_EFFORT] [IMPL-WF_TRIAL_MODEL_EFFORT]

wf_trial_model_effort_allowed() {
  printf '%s' 'low medium high xhigh max'
}

# PRE: raw may be empty, -, or a level name
# POST: unset MODEL_EFFORT when empty/-; else export validated lowercase level
# FAILURE: return 1 and ERROR to stderr when invalid
wf_trial_validate_model_effort() {
  local raw="${1:-}"
  raw="$(printf '%s' "$raw" | tr '[:upper:]' '[:lower:]')"
  if [[ -z "$raw" || "$raw" == "-" ]]; then
    unset MODEL_EFFORT
    return 0
  fi
  case " $(wf_trial_model_effort_allowed) " in
    *" $raw "*) export MODEL_EFFORT="$raw"; return 0 ;;
    *)
      printf 'ERROR: invalid MODEL_EFFORT (expected %s or -): %s\n' \
        "$(wf_trial_model_effort_allowed | tr ' ' '|')" "$1" >&2
      return 1
      ;;
  esac
}

# Strip . and - for disposable tag suffix (effort only).
normalize_wf_trial_effort_suffix() {
  local raw="${MODEL_EFFORT:-}"
  [[ -n "$raw" ]] || return 0
  printf '%s' "$raw" | tr '[:upper:]' '[:lower:]' | tr -d '.-'
}
