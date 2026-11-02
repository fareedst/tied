#!/usr/bin/env bash
# workflow-trial-agentstream — bootstrap disposable client, extract PROMPT-WF block, run four-phase agentstream.
# [REQ-TIED_SETUP] [REQ-GOAGENT-FEATURESPEC-BATCH] [REQ-TIED_CLI_OPERATOR_OUTPUT_TEXTURE]
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

Defaults (override via env): MODEL_SLUG=composer-2.5-fast MODEL_CONFIG=composer-2.5 HARNESS=cursor

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

if [[ -n "$WORKSPACE_ARG" ]]; then
  case "$WORKSPACE_ARG" in
    /*) export WORKSPACE="$WORKSPACE_ARG" ;;
    *) fail "WORKSPACE must be an absolute path: $WORKSPACE_ARG" ;;
  esac
  [[ -d "$WORKSPACE" ]] || fail "WORKSPACE is not a directory: $WORKSPACE"
else
  TEST_ROOT="${TIED_TEST_ROOT:-${HOME}/Documents/dev/test}"
  TAG="wf-agentstream-$(normalize_wf_tag_suffix "$WF_ID")"
  WORKSPACE="$(
    node "${REPO_ROOT}/tools/bootstrap/new-tied-client.mjs" \
      --disposable --out-path \
      --source-root "${REPO_ROOT}" \
      --test-root "${TEST_ROOT}" \
      --tag "${TAG}"
  )"
  export WORKSPACE
fi

BODY="$(extract_feature_remainder "$WF_NORM" "$CATALOG")"
[[ -n "$BODY" ]] || fail "empty catalog extract for PROMPT-${WF_NORM} (check ${CATALOG})"

export MODEL_SLUG="${MODEL_SLUG:-composer-2.5-fast}"
export MODEL_CONFIG="${MODEL_CONFIG:-composer-2.5}"
export HARNESS="${HARNESS:-cursor}"
PROMPT_PREFACE="${PROMPT_PREFACE:-$PROMPT_PREFACE_DEFAULT}"
export FEATURE_REMAINDER="${PROMPT_PREFACE}${BODY}"

printf 'DEBUG: workflow-trial-agentstream wf=%s workspace=%s dry_run=%s\n' \
  "$WF_NORM" "$WORKSPACE" "$DRY_RUN" >&2

ARGS=()
((DRY_RUN)) && ARGS+=(--dry-run)

exec bash "$FOUR_PHASE" "${ARGS[@]}"
