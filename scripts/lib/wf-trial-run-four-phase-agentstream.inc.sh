# wf-trial-run-four-phase-agentstream.inc.sh — batch prep, EXIT trap, agentstream invoke + exit capture.
# [REQ-WF_TRIAL_FOUR_PHASE_SHELL_EXIT] [ARCH-WF_TRIAL_FOUR_PHASE_SHELL_EXIT] [IMPL-WF_TRIAL_FOUR_PHASE_SHELL_EXIT]

wf_trial_four_phase_expand_batch_placeholders() {
  local src="$1"
  local dst="$2"
  local harness="${HARNESS:-cursor}"
  export MODEL_SLUG="${MODEL_SLUG:-}"
  export MODEL_CONFIG="${MODEL_CONFIG:-}"
  export MODEL_EFFORT="${MODEL_EFFORT:-}"
  export FEATURE_REMAINDER="${FEATURE_REMAINDER:-}"
  case "$harness" in
    claude) export SKILL_ROOT=".claude/skills" ;;
    *) export SKILL_ROOT=".cursor/skills" ;;
  esac
  export HARNESS="$harness"
  perl -pe '
    s/\{\{MODEL_SLUG\}\}/$ENV{MODEL_SLUG}/g;
    s/\{\{MODEL_CONFIG\}\}/$ENV{MODEL_CONFIG}/g;
    s/\{\{MODEL_EFFORT\}\}/$ENV{MODEL_EFFORT}/g;
    s/\{\{FEATURE_REMAINDER\}\}/$ENV{FEATURE_REMAINDER}/g;
    s/\{\{SKILL_ROOT\}\}/$ENV{SKILL_ROOT}/g;
    s/\{\{HARNESS\}\}/$ENV{HARNESS}/g;
  ' "$src" >"$dst"
}

# Set outvar to expanded batch path and register baked-path EXIT trap. Do not call inside command substitution.
wf_trial_four_phase_prepare_expanded_batch() {
  local batch_template="$1"
  local out_name="$2"
  local _wf_expanded_batch_path
  _wf_expanded_batch_path="$(mktemp -t traditional-four-phase-batch)"
  _wf_expanded_batch_path="${_wf_expanded_batch_path}.yaml"
  trap "rm -f -- '${_wf_expanded_batch_path}'" EXIT
  wf_trial_four_phase_expand_batch_placeholders "$batch_template" "$_wf_expanded_batch_path"
  printf -v "$out_name" '%s' "$_wf_expanded_batch_path"
}

# Run argv as command; return its exit status. Safe under caller set -e (uses set +e internally).
wf_trial_four_phase_run_agentstream() {
  set +e
  "$@"
  local ec=$?
  set -e
  if ((ec > 255)); then
    ec=255
  fi
  return "$ec"
}
