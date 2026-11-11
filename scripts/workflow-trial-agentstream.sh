#!/usr/bin/env bash
# workflow-trial-agentstream — bootstrap disposable client, extract PROMPT-WF block, run four-phase agentstream.
# [REQ-TIED_SETUP] [REQ-GOAGENT-FEATURESPEC-BATCH] [REQ-TIED_CLI_OPERATOR_OUTPUT_TEXTURE] [REQ-WF_TRIAL_AGENTSTREAM_OPERATOR_HELP] [REQ-WF_TRIAL_AGENTSTREAM_DISPOSABLE_TAG] [REQ-WF_TRIAL_MODEL_EFFORT] [REQ-WF_TRIAL_MODEL_SPEC_CLI] [REQ-WF_TRIAL_COMPOSITION_PROMPTS] [REQ-CLAUDE_WF03_LIVE_MATRIX_GAPS] [REQ-WF_TRIAL_FOUR_PHASE_HARDENING] [REQ-WF_TRIAL_ORCHESTRATOR_PROCESS_LOG] [REQ-WF_TRIAL_IMPLEMENTATION_STACK] [REQ-WF_TRIAL_RANGE_PROOF_MANIFEST_MANDATE] [REQ-WF_TRIAL_MINIMAL_CHECKLIST_PLAYBOOK] [REQ-WF_TRIAL_PHASE_HANDOFF_GATE]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"

# shellcheck source=lib/wf-trial-agentstream-help.inc.sh
source "${SCRIPT_DIR}/lib/wf-trial-agentstream-help.inc.sh"
if wf_trial_help_argv_is_help_only "$@"; then
  wf_trial_help_stream_init "${WF_TRIAL_HELP_STDOUT_CLI:-0}"
  wf_trial_help_plain_init "${WF_TRIAL_HELP_PLAIN_CLI:-0}"
  wf_trial_agentstream_print_help
  exit 0
fi

REPO_ROOT_DEFAULT="$(cd "${SCRIPT_DIR}/.." && pwd -P)"
MARKER_REL="tied-install.sh"
CATALOG_REL="docs/demos/catalog-traditional-workflow-trial-prompts.md"
FOUR_PHASE="${SCRIPT_DIR}/run-traditional-four-phase-agentstream.sh"

PROMPT_PREFACE_DEFAULT="Without pausing for user approval, select and execute the implemented products to be more comprehensive and capable. Use Typescript for code. -- "

fail() {
  printf 'ERROR: %s\n' "$1" >&2
  exit "${2:-2}"
}

normalize_wf_id() {
  local raw="$1"
  raw="${raw#PROMPT-}"
  raw="${raw#prompt-}"
  raw="$(printf '%s' "$raw" | tr '[:lower:]' '[:upper:]')"
  if [[ ! "$raw" =~ ^WF-(0[1-9]|1[0-2])$ ]]; then
    fail "invalid WF id (expected WF-01 … WF-12): $1"
  fi
  printf '%s' "$raw"
}

normalize_wf_tag_suffix() {
  normalize_wf_id "$1" | tr '[:upper:]' '[:lower:]'
}

# shellcheck source=lib/wf-trial-disposable-tag.inc.sh
source "${SCRIPT_DIR}/lib/wf-trial-disposable-tag.inc.sh"

extract_feature_remainder() {
  local wf_id="$1"
  local catalog="$2"
  gawk -v wf="$wf_id" '
    BEGIN { hdr = "### PROMPT-" wf }
    $0 == hdr { insec = 1; next }
    insec && /^### PROMPT-WF-/ { exit }
    insec && /^```text$/ { intext = 1; next }
    insec && intext && /^```$/ { exit }
    insec && intext { print }
  ' "$catalog"
}

REPO_ROOT="${REPO_ROOT:-$REPO_ROOT_DEFAULT}"
if [[ -e "${REPO_ROOT}/${MARKER_REL}" ]]; then
  :
else
  REPO_ROOT="$REPO_ROOT_DEFAULT"
fi
[[ -e "${REPO_ROOT}/${MARKER_REL}" ]] || fail "not a TIED store root: ${REPO_ROOT}"

DRY_RUN=0
WORKSPACE_ARG=""
WF_ID=""

while (($# > 0)); do
  case "$1" in
    --dry-run)
      DRY_RUN=1
      shift
      ;;
    --workspace)
      WORKSPACE_ARG="${2:?--workspace requires absolute path}"
      shift 2
      ;;
    --)
      shift
      break
      ;;
    -*)
      fail "unknown option: $1"
      ;;
    *)
      if [[ -z "$WF_ID" ]]; then
        WF_ID="$1"
        shift
      else
        fail "unexpected argument: $1"
      fi
      ;;
  esac
done

[[ -n "$WF_ID" ]] || fail "WF_ID is required (workflow-trial-agentstream --help)"

command -v gawk >/dev/null 2>&1 || fail "gawk not found (install GNU awk, e.g. brew install gawk)"

WF_NORM="$(normalize_wf_id "$WF_ID")"
CATALOG="${REPO_ROOT}/${CATALOG_REL}"
[[ -f "$CATALOG" && -r "$CATALOG" ]] || fail "catalog missing: $CATALOG"

export HARNESS="${HARNESS:-cursor}"

# [REQ-WF_TRIAL_MODEL_SPEC_CLI] Resolve catalog config id when MODEL_SLUG unset.
# shellcheck source=lib/wf-trial-model-spec.inc.sh
source "${SCRIPT_DIR}/lib/wf-trial-model-spec.inc.sh"
if [[ -z "${MODEL_SLUG:-}" ]]; then
  _wf_trial_resolve_id="${WF_TRIAL_CONFIG_ID:-${MODEL_CONFIG:-}}"
  if [[ -n "$_wf_trial_resolve_id" ]] && wf_trial_registry_has_model_ref "$HARNESS" "$_wf_trial_resolve_id"; then
    wf_trial_resolve_model_ref "$HARNESS" "$_wf_trial_resolve_id" || fail "model ref resolve failed for ${_wf_trial_resolve_id}"
  fi
  unset _wf_trial_resolve_id
fi

export MODEL_SLUG="${MODEL_SLUG:-composer-2.5-fast}"
export MODEL_CONFIG="${MODEL_CONFIG:-composer-2.5}"
wf_trial_canonicalize_cursor_model_slug "$HARNESS" || fail "MODEL_SLUG canonicalize failed"

# shellcheck source=lib/wf-trial-model-effort.inc.sh
source "${SCRIPT_DIR}/lib/wf-trial-model-effort.inc.sh"
wf_trial_validate_model_effort "${MODEL_EFFORT:--}" || fail "invalid MODEL_EFFORT"

BOOTSTRAP_PREPENDED=0
TAG=""

if [[ -n "$WORKSPACE_ARG" ]]; then
  case "$WORKSPACE_ARG" in
    /*) export WORKSPACE="$WORKSPACE_ARG" ;;
    *) fail "WORKSPACE must be an absolute path: $WORKSPACE_ARG" ;;
  esac
  [[ -d "$WORKSPACE" ]] || fail "WORKSPACE is not a directory: $WORKSPACE"
else
  TEST_ROOT="${TIED_TEST_ROOT:-${HOME}/Documents/dev/test}"
  TAG="$(build_wf_trial_disposable_tag "$WF_ID")"
  # shellcheck source=lib/wf-trial-process-log.inc.sh
  source "${SCRIPT_DIR}/lib/wf-trial-process-log.inc.sh"
  if wf_trial_process_log_enabled; then
    wf_trial_process_log_bootstrap_stderr_init
    BOOTSTRAP_PREPENDED=1
    WORKSPACE="$(
      node "${REPO_ROOT}/tools/bootstrap/new-tied-client.mjs" \
        --disposable --out-path \
        --source-root "${REPO_ROOT}" \
        --test-root "${TEST_ROOT}" \
        --tag "${TAG}" 2>"${WF_TRIAL_BOOTSTRAP_STDERR}"
    )"
  else
    WORKSPACE="$(
      node "${REPO_ROOT}/tools/bootstrap/new-tied-client.mjs" \
        --disposable --out-path \
        --source-root "${REPO_ROOT}" \
        --test-root "${TEST_ROOT}" \
        --tag "${TAG}"
    )"
  fi
  export WORKSPACE
fi

if [[ -z "${WF_TRIAL_PROCESS_LOG_SCHEMA:-}" ]]; then
  # shellcheck source=lib/wf-trial-process-log.inc.sh
  source "${SCRIPT_DIR}/lib/wf-trial-process-log.inc.sh"
fi

wf_trial_process_log_bind_workspace \
  "$WORKSPACE" "$WF_NORM" "$REPO_ROOT" "${HARNESS}" "${MODEL_SLUG}" "${MODEL_CONFIG}" \
  "${TAG}" "$DRY_RUN" "$BOOTSTRAP_PREPENDED" "${MODEL_EFFORT:-}"

BODY="$(extract_feature_remainder "$WF_NORM" "$CATALOG")"
[[ -n "$BODY" ]] || fail "empty catalog extract for PROMPT-${WF_NORM} (check ${CATALOG})"

PROMPT_PREFACE="${PROMPT_PREFACE:-$PROMPT_PREFACE_DEFAULT}"
export FEATURE_REMAINDER="${PROMPT_PREFACE}${BODY}"

printf 'DEBUG: workflow-trial-agentstream wf=%s workspace=%s dry_run=%s harness=%s disposable_tag=%s model_effort=%s\n' \
  "$WF_NORM" "$WORKSPACE" "$DRY_RUN" "${HARNESS:-cursor}" "${TAG:-—}" "${MODEL_EFFORT:-—}" >&2

# shellcheck source=lib/wf-trial-four-phase-hardening.inc.sh
source "${SCRIPT_DIR}/lib/wf-trial-four-phase-hardening.inc.sh"
# shellcheck source=lib/wf-trial-implementation-stack.inc.sh
source "${SCRIPT_DIR}/lib/wf-trial-implementation-stack.inc.sh"
# shellcheck source=lib/wf-trial-proof-manifest-gate.inc.sh
source "${SCRIPT_DIR}/lib/wf-trial-proof-manifest-gate.inc.sh"
# shellcheck source=lib/wf-trial-phase-handoff-gate.inc.sh
source "${SCRIPT_DIR}/lib/wf-trial-phase-handoff-gate.inc.sh"
if wf_trial_implementation_stack_enabled; then
  wf_trial_apply_implementation_stack "$WORKSPACE" "$REPO_ROOT"
else
  printf 'DIAGNOSTIC: WF_TRIAL_SKIP_IMPLEMENTATION_STACK=1; skipping stack seed and WF preload\n' >&2
  materialize_disposable_preload_contract "$WORKSPACE"
fi
if wf_trial_proof_manifest_gate_enabled; then
  wf_trial_seed_proof_manifest_scaffold "$WORKSPACE" "$WF_NORM" "$REPO_ROOT"
fi

if [[ "$DRY_RUN" -eq 0 ]]; then
  wf_trial_reconcile_preflight "$REPO_ROOT" || fail "WF trial reconcile preflight blocked (WF_TRIAL_STRICT_RECONCILE)"
fi

if [[ "${HARNESS:-cursor}" == "claude" && "$DRY_RUN" -eq 0 ]]; then
  # shellcheck source=scripts/lib/wf-trial-claude-preflight.inc.sh
  source "${REPO_ROOT}/scripts/lib/wf-trial-claude-preflight.inc.sh"
  VALIDATION="${REPO_ROOT}/scripts/run-tied-claude-client-validation.mjs"
  if [[ -f "$VALIDATION" ]]; then
    VALIDATION_EXIT=0
    node "$VALIDATION" --client-root "$WORKSPACE" --no-agentstream-dry-run --with-claude-code-interactive-smoke || VALIDATION_EXIT=$?
    wf_trial_handle_claude_validation_exit "$VALIDATION_EXIT" || fail "Claude client validation preflight blocked (WF_TRIAL_STRICT_PREFLIGHT)"
  else
    printf 'DIAGNOSTIC: run-tied-claude-client-validation.mjs missing; skip Claude preflight\n' >&2
  fi
fi

ARGS=()
((DRY_RUN)) && ARGS+=(--dry-run)

FOUR_PHASE_EXIT=0
bash "$FOUR_PHASE" "${ARGS[@]}" || FOUR_PHASE_EXIT=$?
wf_trial_process_log_finalize "$FOUR_PHASE_EXIT"
PHASE_HANDOFF_EXIT=0
GATE_EXIT=0
STRICT_CLOSEOUT_EXIT=0
if ((DRY_RUN == 0)); then
  materialize_wf_trial_minimal_checklist_tracker "$WORKSPACE" "$REPO_ROOT"
  wf_trial_phase_handoff_gate_check "$WORKSPACE" "$REPO_ROOT" || PHASE_HANDOFF_EXIT=$?
  wf_trial_proof_manifest_gate_check "$WORKSPACE" "$WF_NORM" "$REPO_ROOT" || GATE_EXIT=$?
  wf_trial_strict_closeout_preflight_check "$WORKSPACE" "$REPO_ROOT" || STRICT_CLOSEOUT_EXIT=$?
fi
if ((FOUR_PHASE_EXIT != 0)); then
  exit "$FOUR_PHASE_EXIT"
fi
if ((PHASE_HANDOFF_EXIT != 0)); then
  exit "$PHASE_HANDOFF_EXIT"
fi
if ((GATE_EXIT != 0)); then
  exit "$GATE_EXIT"
fi
exit "$STRICT_CLOSEOUT_EXIT"
