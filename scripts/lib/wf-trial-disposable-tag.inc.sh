# wf-trial-disposable-tag.inc.sh — disposable --tag for workflow-trial-agentstream bootstrap.
# [REQ-WF_TRIAL_AGENTSTREAM_DISPOSABLE_TAG] [REQ-WF_TRIAL_MODEL_EFFORT] [REQ-WF_TRIAL_RANGE_CANONICAL_INPUT]
# [IMPL-WF_TRIAL_AGENTSTREAM_DISPOSABLE_TAG] [IMPL-WF_TRIAL_MODEL_EFFORT] [IMPL-WF_TRIAL_RANGE_CANONICAL_INPUT]
# Requires normalize_wf_tag_suffix(wf_id) when sourced from workflow-trial-agentstream.sh.

normalize_wf_trial_model_suffix() {
  if [[ -n "${WF_TRIAL_DISPOSABLE_MODEL_BUCKET:-}" ]]; then
    printf '%s' "$WF_TRIAL_DISPOSABLE_MODEL_BUCKET"
    return 0
  fi
  local raw="${MODEL_CONFIG:-}"
  local effort_suffix=""
  if [[ -z "$raw" ]]; then
    raw="${MODEL_SLUG:-composer-2.5-fast}"
  fi
  if declare -F normalize_wf_trial_effort_suffix >/dev/null 2>&1; then
    effort_suffix="$(normalize_wf_trial_effort_suffix)"
  fi
  printf '%s%s' "$(printf '%s' "$raw" | tr '[:upper:]' '[:lower:]' | tr -d '.-')" "$effort_suffix"
}

build_wf_trial_disposable_tag() {
  local wf_id="$1"
  local harness model wf_suffix
  wf_suffix="$(normalize_wf_tag_suffix "$wf_id")"
  harness="$(printf '%s' "${HARNESS:-cursor}" | tr '[:upper:]' '[:lower:]')"
  model="$(normalize_wf_trial_model_suffix)"
  printf 'wf-agentstream-%s-%s-%s' "$wf_suffix" "$harness" "$model"
}
