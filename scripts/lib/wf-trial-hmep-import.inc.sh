# wf-trial-hmep-import.inc.sh — post-cell harness-eval import for workflow_trial_range
# [REQ-WF_TRIAL_RANGE_HMEP_AUTO_INGEST] [IMPL-WF_TRIAL_RANGE_HMEP_AUTO_INGEST] [ARCH-WF_TRIAL_RANGE_HMEP_AUTO_INGEST]

WF_TRIAL_HMEP_STREAM_JSON_REL="tied-project/working/wf-trial-orchestrator-run/evidence/stream-json"

wf_trial_hmep_capture_range_enabled() {
  if [[ -n "${WF_TRIAL_SKIP_HMEP_CAPTURE:-}" && "${WF_TRIAL_SKIP_HMEP_CAPTURE}" != "0" ]]; then
    return 1
  fi
  [[ "${WF_TRIAL_HMEP_CAPTURE:-}" == "1" ]]
}

# Minimal tag suffix for build_wf_trial_disposable_tag when sourced outside workflow-trial-agentstream.sh
if ! declare -F normalize_wf_tag_suffix >/dev/null 2>&1; then
  normalize_wf_tag_suffix() {
    local raw="$1"
    raw="${raw#PROMPT-}"
    raw="${raw#prompt-}"
    printf '%s' "$(printf '%s' "$raw" | tr '[:upper:]' '[:lower:]')"
  }
fi

wf_trial_resolve_latest_client_for_tag() {
  local wf_id="$1"
  local test_root="${TIED_TEST_ROOT:-${HOME}/Documents/dev/test}"
  local tag disposable_tag
  # shellcheck source=lib/wf-trial-disposable-tag.inc.sh
  source "${BASH_SOURCE%/*}/wf-trial-disposable-tag.inc.sh"
  tag="$(build_wf_trial_disposable_tag "$wf_id")"
  disposable_tag="$(ls -td "${test_root}"/*-"${tag}" 2>/dev/null | head -1 || true)"
  printf '%s' "$disposable_tag"
}

wf_trial_hmep_import_cell() {
  local wf_id="$1"
  local store_root cli client_root trial_id stream_dir import_rc=0
  local -a jsonl_args=()

  if ! wf_trial_hmep_capture_range_enabled; then
    return 0
  fi

  client_root="$(wf_trial_resolve_latest_client_for_tag "$wf_id")"
  if [[ -z "$client_root" || ! -d "$client_root" ]]; then
    printf 'DIAGNOSTIC: hmep_import skip missing client for %s\n' "$wf_id" >&2
    return 0
  fi

  local repo_root="${TIED_STORE_ROOT:-${WF_TRIAL_HMEP_REPO_ROOT:-}}"
  if [[ -z "$repo_root" ]]; then
    repo_root="$(cd "${BASH_SOURCE%/*}/../.." && pwd -P)"
  fi
  cli="${repo_root}/mcp-server/packages/harness-eval/dist/cli/main.js"
  if [[ ! -f "$cli" ]]; then
    printf 'DIAGNOSTIC: hmep_import skip missing harness-eval dist (%s)\n' "$cli" >&2
    return 0
  fi

  trial_id="$(basename "$client_root")"
  store_root="${HARNESS_EVAL_STORE:-${TIED_STORE_ROOT:-$repo_root}/tied-bundle/reports/harness-eval}"
  stream_dir="${client_root}/${WF_TRIAL_HMEP_STREAM_JSON_REL}"

  if [[ -d "$stream_dir" ]]; then
    local f
    shopt -s nullglob
    local jsonl_files=("$stream_dir"/*.jsonl)
    shopt -u nullglob
    for f in "${jsonl_files[@]}"; do
      [[ -f "$f" ]] || continue
      jsonl_args+=(--jsonl "$f")
    done
  fi

  local import_out=""
  set +e
  if ((${#jsonl_args[@]} > 0)); then
    import_out="$(
      node "$cli" events import --wf-client "$client_root" --trial-id "$trial_id" \
        --store "$store_root" "${jsonl_args[@]}" 2>&1
    )"
  else
    import_out="$(
      node "$cli" events import --wf-client "$client_root" --trial-id "$trial_id" \
        --store "$store_root" 2>&1
    )"
  fi
  import_rc=$?
  set -e
  if [[ -n "$import_out" ]]; then
    printf '%s\n' "$import_out" >&2
  fi
  if [[ "$import_out" == *"observations_inserted="* ]]; then
    printf 'DIAGNOSTIC: hmep_import %s\n' \
      "$(printf '%s' "$import_out" | grep -E '^TRACE: import wf-client' | tail -1)" >&2
  fi

  if ((import_rc != 0)); then
    printf 'DIAGNOSTIC: hmep_import exit_code=%s trial_id=%s\n' "$import_rc" "$trial_id" >&2
    if [[ -n "${WF_TRIAL_STRICT_HMEP_IMPORT:-}" && "${WF_TRIAL_STRICT_HMEP_IMPORT}" != "0" ]]; then
      return "$import_rc"
    fi
  fi
  return 0
}
