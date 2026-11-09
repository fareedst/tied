#!/usr/bin/env bash
# workflow-trial-agentstream — bootstrap disposable client, extract PROMPT-WF block, run four-phase agentstream.
# [REQ-TIED_SETUP] [REQ-GOAGENT-FEATURESPEC-BATCH] [REQ-TIED_CLI_OPERATOR_OUTPUT_TEXTURE] [REQ-WF_TRIAL_AGENTSTREAM_DISPOSABLE_TAG] [REQ-WF_TRIAL_MODEL_EFFORT] [REQ-CLAUDE_WF03_LIVE_MATRIX_GAPS] [REQ-WF_TRIAL_FOUR_PHASE_HARDENING] [REQ-WF_TRIAL_ORCHESTRATOR_PROCESS_LOG] [REQ-WF_TRIAL_IMPLEMENTATION_STACK]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
REPO_ROOT_DEFAULT="$(cd "${SCRIPT_DIR}/.." && pwd -P)"
MARKER_REL="tied-install.sh"
CATALOG_REL="docs/demos/catalog-traditional-workflow-trial-prompts.md"
FOUR_PHASE="${SCRIPT_DIR}/run-traditional-four-phase-agentstream.sh"

PROMPT_PREFACE_DEFAULT="Without pausing for user approval, select and execute the implemented products to be more comprehensive and capable. Use Typescript for code. -- "

fail() {
  printf 'ERROR: %s\n' "$1" >&2
  exit "${2:-2}"
}

usage() {
  cat >&2 <<EOF
workflow-trial-agentstream — WF trial orchestrator (bootstrap + catalog extract + four-phase agentstream)

Usage:
  workflow-trial-agentstream.sh WF_ID [--dry-run] [--workspace ABS_PATH]
  workflow-trial-agentstream.sh --help

  WF_ID examples: wf-02, WF-02, PROMPT-WF-02 (catalog PROMPT-WF-01 … PROMPT-WF-08)

Defaults (override via env): MODEL_SLUG=composer-2.5-fast MODEL_CONFIG=composer-2.5 HARNESS=cursor MODEL_EFFORT unset (workflow_trial_range 4th arg: low|medium|high|xhigh|max or -)
  WF_TRIAL_STRICT_PREFLIGHT=1 fails closed when HARNESS=claude and Claude client validation returns non-zero (default: DIAGNOSTIC and continue).
  WF_TRIAL_SKIP_RECONCILE_PREFLIGHT=1 skips store mcp-server/dist check before live four-phase.
  WF_TRIAL_STRICT_RECONCILE=1 fails closed when mcp-server/dist/index.js is missing (default: DIAGNOSTIC and continue).
  Process log capture is on by default; WF_TRIAL_SKIP_PROCESS_LOG=1 disables stdout/stderr files under
  tied-project/working/wf-trial-orchestrator-run/evidence/ on the client.
  WF_TRIAL_SKIP_IMPLEMENTATION_STACK=1 skips TypeScript fixture seed and WF-specific preload (matrix comparability waived).

Disposable bootstrap (no --workspace): client dir under TIED_TEST_ROOT is
  {epoch}-wf-agentstream-{wf-id}-{harness}-{modelBucket}
  modelBucket from MODEL_CONFIG (else MODEL_SLUG), lowercase, dots and hyphens removed.

Run mode: live four-phase agentstream by default (four agent sessions). Use --dry-run first to verify --model wiring.

Requires: GNU awk (gawk), built store CLI (./build-workspace.sh), gawk on PATH.
EOF
}

normalize_wf_id() {
  local raw="$1"
  raw="${raw#PROMPT-}"
  raw="${raw#prompt-}"
  raw="$(printf '%s' "$raw" | tr '[:lower:]' '[:upper:]')"
  if [[ ! "$raw" =~ ^WF-0[1-8]$ ]]; then
    fail "invalid WF id (expected WF-01 … WF-08): $1"
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
    -h | --help)
      usage
      exit 0
      ;;
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

if [[ -z "$WF_ID" ]]; then
  usage
  fail "WF_ID is required"
fi

command -v gawk >/dev/null 2>&1 || fail "gawk not found (install GNU awk, e.g. brew install gawk)"

WF_NORM="$(normalize_wf_id "$WF_ID")"
CATALOG="${REPO_ROOT}/${CATALOG_REL}"
[[ -f "$CATALOG" && -r "$CATALOG" ]] || fail "catalog missing: $CATALOG"

export MODEL_SLUG="${MODEL_SLUG:-composer-2.5-fast}"
export MODEL_CONFIG="${MODEL_CONFIG:-composer-2.5}"
export HARNESS="${HARNESS:-cursor}"

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
if wf_trial_implementation_stack_enabled; then
  wf_trial_apply_implementation_stack "$WORKSPACE" "$REPO_ROOT"
else
  printf 'DIAGNOSTIC: WF_TRIAL_SKIP_IMPLEMENTATION_STACK=1; skipping stack seed and WF preload\n' >&2
  materialize_disposable_preload_contract "$WORKSPACE"
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
exit "$FOUR_PHASE_EXIT"
