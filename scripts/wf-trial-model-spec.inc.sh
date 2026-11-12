# wf-trial-model-spec.inc.sh — resolve model ref to MODEL_SLUG / MODEL_CONFIG.
# [REQ-WF_TRIAL_MODEL_SPEC_CLI] [REQ-WF_TRIAL_MODEL_CATALOG_RESOLVE] [REQ-WF_TRIAL_MODEL_COMPOSE]
# [IMPL-WF_TRIAL_MODEL_SPEC_CLI] [IMPL-WF_TRIAL_MODEL_CATALOG_RESOLVE] [IMPL-WF_TRIAL_MODEL_COMPOSE]

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

_wf_trial_cursor_catalog_slug_cli() {
  local root
  root="$(_wf_trial_model_spec_repo_root)"
  printf '%s\n' "${root}/tools/bootstrap/lib/cursor-catalog-model-slug.mjs"
}

# POST: export MODEL_SLUG when harness cursor and slug non-empty
wf_trial_canonicalize_cursor_model_slug() {
  local harness slug cli
  harness="$(printf '%s' "${1:-${HARNESS:-cursor}}" | tr '[:upper:]' '[:lower:]')"
  [[ "$harness" == "cursor" ]] || return 0
  slug="${MODEL_SLUG:-}"
  [[ -n "$slug" ]] || return 0
  cli="$(_wf_trial_cursor_catalog_slug_cli)"
  [[ -f "$cli" ]] || return 0
  MODEL_SLUG="$(node "$cli" canonicalize "$slug")" || return $?
  export MODEL_SLUG
  return 0
}

wf_trial_registry_has_config_id() {
  local config_id="${1:?}"
  local root cli
  root="$(_wf_trial_model_spec_repo_root)"
  cli="$(_wf_trial_model_spec_cli)"
  node "$cli" has "$config_id" 2>/dev/null
}

wf_trial_registry_has_model_ref() {
  local harness="${1:?}"
  local model_ref="${2:?}"
  local effort="${3:--}"
  local cli
  cli="$(_wf_trial_model_spec_cli)"
  node "$cli" has-ref "$harness" "$model_ref" "$effort" 2>/dev/null
}

# PRE: harness cursor|claude; model_ref known or error
# POST: export MODEL_CONFIG MODEL_SLUG WF_TRIAL_DISPOSABLE_MODEL_BUCKET
# FAILURE: return non-zero; ERROR on stderr
wf_trial_resolve_model_ref() {
  local harness="${1:?harness}"
  local model_ref="${2:?model_ref}"
  local effort="${3:--}"
  local cli json rc resolution
  cli="$(_wf_trial_model_spec_cli)"
  [[ -f "$cli" ]] || {
    printf 'ERROR: wf-trial-model-spec CLI missing: %s\n' "$cli" >&2
    return 2
  }
  local err_file
  err_file="$(mktemp "${TMPDIR:-/tmp}/wf-trial-spec.XXXXXX")"
  json="$(node "$cli" resolve-ref "$harness" "$model_ref" "$effort" 2>"$err_file")" || {
    rc=$?
    [[ -s "$err_file" ]] && cat "$err_file" >&2
    rm -f "$err_file"
    return "$rc"
  }
  rm -f "$err_file"
  MODEL_CONFIG="$(node -p "JSON.parse(process.argv[1]).model_config" "$json")" || return $?
  MODEL_SLUG="$(node -p "JSON.parse(process.argv[1]).model_slug" "$json")" || return $?
  export MODEL_CONFIG MODEL_SLUG
  local bucket
  bucket="$(node -p "JSON.parse(process.argv[1]).disposable_model_bucket || ''" "$json" 2>/dev/null || true)"
  if [[ -n "$bucket" ]]; then
    export WF_TRIAL_DISPOSABLE_MODEL_BUCKET="$bucket"
  else
    unset WF_TRIAL_DISPOSABLE_MODEL_BUCKET
  fi
  resolution="$(node -p "JSON.parse(process.argv[1]).resolution || ''" "$json" 2>/dev/null || true)"
  if [[ -n "$resolution" && "$resolution" != "matrix" ]]; then
    printf 'DIAGNOSTIC: wf_trial_model_ref: %s via %s\n' "$model_ref" "$resolution" >&2
  fi
  wf_trial_canonicalize_cursor_model_slug "$harness" || return $?
  return 0
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
  wf_trial_canonicalize_cursor_model_slug "$harness" || return $?
  return 0
}
