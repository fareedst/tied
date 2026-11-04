# wf-trial-disposable-tag.inc.sh — disposable --tag for workflow-trial-agentstream bootstrap.
# [REQ-WF_TRIAL_AGENTSTREAM_DISPOSABLE_TAG] [IMPL-WF_TRIAL_AGENTSTREAM_DISPOSABLE_TAG]
# Requires normalize_wf_tag_suffix(wf_id) when sourced from workflow-trial-agentstream.sh.

normalize_wf_trial_model_suffix() {
  local raw="${MODEL_CONFIG:-}"
  if [[ -z "$raw" ]]; then
    raw="${MODEL_SLUG:-composer-2.5-fast}"
  fi
  printf '%s' "$raw" | tr '[:upper:]' '[:lower:]' | tr -d '.-'
}

build_wf_trial_disposable_tag() {
  local wf_id="$1"
  local harness model wf_suffix
  wf_suffix="$(normalize_wf_tag_suffix "$wf_id")"
  harness="$(printf '%s' "${HARNESS:-cursor}" | tr '[:upper:]' '[:lower:]')"
  model="$(normalize_wf_trial_model_suffix)"
  printf 'wf-agentstream-%s-%s-%s' "$wf_suffix" "$harness" "$model"
}
