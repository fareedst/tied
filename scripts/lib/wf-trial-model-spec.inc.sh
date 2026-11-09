# wf-trial-model-spec.inc.sh — resolve catalog config id to MODEL_SLUG / MODEL_CONFIG.
# [REQ-WF_TRIAL_MODEL_SPEC_CLI] [IMPL-WF_TRIAL_MODEL_SPEC_CLI]

_wf_trial_model_spec_repo_root() {
  if [[ -n "${WF_TRIAL_MODEL_SPEC_REPO_ROOT:-}" ]]; then
    printf '%s\n' "${WF_TRIAL_MODEL_SPEC_REPO_ROOT}"
    return
  fi
  if [[ -n "${_BUILD_COMMANDS_REPO_ROOT:-}" ]]; then
    printf '%s\n' "${_BUILD_COMMANDS_REPO_ROOT}"
    return
  fi
  if [[ -n "${REPO_ROOT:-}" ]]; then
    printf '%s\n' "${REPO_ROOT}"
    return
  fi
  printf '%s\n' "$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
}

_wf_trial_model_spec_cli() {
  local root
  root="$(_wf_trial_model_spec_repo_root)"
  printf '%s\n' "${root}/tools/bootstrap/lib/wf-trial-model-spec.mjs"
}

wf_trial_registry_has_config_id() {
  local config_id="${1:?}"
  local root cli
  root="$(_wf_trial_model_spec_repo_root)"
  cli="$(_wf_trial_model_spec_cli)"
  node "$cli" has "$config_id" 2>/dev/null
}

# PRE: harness cursor|claude; config_id known or error
# POST: export MODEL_CONFIG MODEL_SLUG
# FAILURE: return non-zero; ERROR on stderr
wf_trial_resolve_model_spec() {
  local harness="${1:?harness}"
  local config_id="${2:?config_id}"
  local root cli json rc
  root="$(_wf_trial_model_spec_repo_root)"
  cli="$(_wf_trial_model_spec_cli)"
  [[ -f "$cli" ]] || {
    printf 'ERROR: wf-trial-model-spec CLI missing: %s\n' "$cli" >&2
    return 2
  }
  local err_file
  err_file="$(mktemp "${TMPDIR:-/tmp}/wf-trial-spec.XXXXXX")"
  json="$(node "$cli" resolve "$harness" "$config_id" 2>"$err_file")" || {
    rc=$?
    [[ -s "$err_file" ]] && cat "$err_file" >&2
    rm -f "$err_file"
    return "$rc"
  }
  rm -f "$err_file"
  MODEL_CONFIG="$(node -p "JSON.parse(process.argv[1]).model_config" "$json")" || return $?
  MODEL_SLUG="$(node -p "JSON.parse(process.argv[1]).model_slug" "$json")" || return $?
  export MODEL_CONFIG MODEL_SLUG
  return 0
}
