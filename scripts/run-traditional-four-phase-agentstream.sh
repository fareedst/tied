#!/usr/bin/env bash
# run-traditional-four-phase-agentstream — four prompt-type turns via feature-spec batch (no full checklist).
# [REQ-GOAGENT-FEATURESPEC-BATCH] [REQ-TIED_CLI_OPERATOR_OUTPUT_TEXTURE] [IMPL-TIED_BUILD_COMMANDS_HOW_TEXTURE]
# Texture aligned with tools/bootstrap/lib/console.mjs; see docs/demos/traditional-four-phase-agentstream.yaml
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
REPO_ROOT_DEFAULT="$(cd "${SCRIPT_DIR}/.." && pwd -P)"
MARKER_REL="tied-install.sh"

# --- Operator texture (stderr-first; plain precedence per ARCH-TIED_CLI_OPERATOR_OUTPUT_TEXTURE) ---
_PLAIN_CLI=0
_HELP_STDOUT_CLI=0
_USE_TEXTURE=0
_HELP_FD=2
_R=''
_B=''
_D=''
_CY=''
_GN=''
_YL=''
_RD=''
_HR_CHAR=''
_SECTION_PREFIX=''

_texture_init() {
  local plain=0
  if [[ "${_PLAIN_CLI}" == "1" || "${TIED_CLI_PLAIN:-}" == "1" || -n "${NO_COLOR:-}" ]]; then
    plain=1
  elif [[ ! -t 2 ]]; then
    plain=1
  fi
  if [[ "${_HELP_STDOUT_CLI}" == "1" || "${TIED_CLI_HELP_STDOUT:-}" == "1" ]]; then
    _HELP_FD=1
  else
    _HELP_FD=2
  fi
  if [[ "$plain" == "1" ]]; then
    _USE_TEXTURE=0
    _R=''
    _B=''
    _D=''
    _CY=''
    _GN=''
    _YL=''
    _RD=''
    _HR_CHAR="$(printf '%*s' 56 '' | tr ' ' '-')"
    _SECTION_PREFIX=''
  else
    _USE_TEXTURE=1
    _R=$'\033[0m'
    _B=$'\033[1m'
    _D=$'\033[2m'
    _CY=$'\033[36m'
    _GN=$'\033[32m'
    _YL=$'\033[33m'
    _RD=$'\033[31m'
    _HR_CHAR="$(printf '\342\224\200%.0s' {1..56})"
    _SECTION_PREFIX=$'\342\226\266 '
  fi
}

_out_help() {
  printf '%s\n' "$@" >&"${_HELP_FD}"
}

_hr() {
  if [[ "${_USE_TEXTURE}" == "1" ]]; then
    _out_help "${_D}${_HR_CHAR}${_R}"
  else
    _out_help "${_HR_CHAR}"
  fi
}

_hr_err() {
  if [[ "${_USE_TEXTURE}" == "1" ]]; then
    printf '%s\n' "${_D}${_HR_CHAR}${_R}" >&2
  else
    printf '%s\n' "${_HR_CHAR}" >&2
  fi
}

_title() {
  _out_help ""
  _out_help "${_B}$*${_R}"
}

_section() {
  _out_help "${_B}${_CY}${_SECTION_PREFIX}${_R}${_B}$*${_R}"
}

_dim() {
  _out_help "  ${_D}$*${_R}"
}

_note() {
  _dim "• $*"
}

fail() {
  local msg=$1
  shift
  printf '\n%s %s\n' "${_RD}ERROR:${_R}" "$msg" >&2
  if (($# > 0)); then
    printf '%s\n' "${_B}Hints:${_R}" >&2
    local hint
    for hint in "$@"; do
      printf '  • %s\n' "$hint" >&2
    done
  fi
  _hr_err
  exit 2
}

_warn() {
  printf '%s\n' "${_YL}WARN:${_R} $*" >&2
}

_diag() {
  printf '%s\n' "${_D}DIAGNOSTIC:${_R} $*" >&2
}

if [[ -n "${REPO_ROOT:-}" ]]; then
  case "${REPO_ROOT}" in
    /*) ;;
    *)
      printf 'DIAGNOSTIC: REPO_ROOT must be absolute, got: %s\n' "${REPO_ROOT}" >&2
      exit 1
      ;;
  esac
else
  REPO_ROOT="${REPO_ROOT_DEFAULT}"
fi

assert_repo_root() {
  local marker_path="${REPO_ROOT}/${MARKER_REL}"
  if [[ ! -e "${marker_path}" ]]; then
    _diag "repo marker missing: expected ${marker_path} (REPO_ROOT=${REPO_ROOT})"
    exit 1
  fi
  cd -- "${REPO_ROOT}" || exit 1
}

usage() {
  _title "Traditional four-phase agentstream"
  _dim "Four prompt-type turns via feature-spec batch (no default agent-req-implementation-checklist)."
  _hr
  _section "Examples"
  _dim "WORKSPACE=/path/to/disposable-client MODEL_SLUG=composer-2.5-fast \\"
  _dim "  ./scripts/run-traditional-four-phase-agentstream.sh --dry-run | rg '\"--model\"'"
  _out_help ""
  _section "Environment"
  _dim "WORKSPACE          Absolute path to disposable client root"
  _dim "MODEL_SLUG         Passed to agentstream --model (required for live runs)"
  _dim "FEATURE_REMAINDER  Product invocation remainder (multi-line ok)"
  _dim "MODEL_CONFIG       Optional model bucket for PLAN header evidence"
  _dim "HARNESS            cursor (default) or claude"
  _dim "BATCH_YAML         Batch template (default: docs/demos/traditional-four-phase-agentstream.yaml)"
  _out_help ""
  _section "Safety"
  _dim "Live runs: WORKSPACE must lie under TIED_TEST_ROOT (default ~/Documents/dev/test),"
  _dim "or set TRADITIONAL_FOUR_PHASE_ALLOW_NON_DISPOSABLE=1."
  _out_help ""
  _section "Options"
  _dim "-d, --dry-run       agentstream dry-run (MODEL_SLUG defaults to composer-2.5-fast if unset)"
  _dim "-h, --help          This help (stderr default; use --stdout for stdout)"
  _dim "-p, --plain         Plain output (no ANSI; ASCII rules)"
  _dim "    --no-color      Same as --plain"
  _dim "    --stdout        Write help to stdout (or TIED_CLI_HELP_STDOUT=1)"
  _out_help ""
  _section "Hints"
  _note "Missing built CLI: run ./build-workspace.sh from the TIED store root."
  _note "Claude live: export AGENTSTREAM_CLAUDE_LIVE_OK=1 when HARNESS=claude and not dry-run."
  _note "Plain mode: NO_COLOR, TIED_CLI_PLAIN=1, --plain, or non-TTY stderr."
  _hr
  _out_help ""
}

require_directory() {
  local label="$1"
  local path="$2"
  [[ -d "$path" ]] || fail "$label is not a directory: $path"
}

expand_batch_placeholders() {
  local src="$1"
  local dst="$2"
  local harness="${HARNESS:-cursor}"
  export MODEL_SLUG="${MODEL_SLUG:-}"
  export MODEL_CONFIG="${MODEL_CONFIG:-}"
  export FEATURE_REMAINDER="${FEATURE_REMAINDER:-}"
  case "$harness" in
    claude) export SKILL_ROOT=".claude/skills" ;;
    *) export SKILL_ROOT=".cursor/skills" ;;
  esac
  perl -pe '
    s/\{\{MODEL_SLUG\}\}/$ENV{MODEL_SLUG}/g;
    s/\{\{MODEL_CONFIG\}\}/$ENV{MODEL_CONFIG}/g;
    s/\{\{FEATURE_REMAINDER\}\}/$ENV{FEATURE_REMAINDER}/g;
    s/\{\{SKILL_ROOT\}\}/$ENV{SKILL_ROOT}/g;
  ' "$src" >"$dst"
}

assert_disposable_workspace() {
  local ws="$1"
  if [[ "${TRADITIONAL_FOUR_PHASE_ALLOW_NON_DISPOSABLE:-}" == "1" ]]; then
    return 0
  fi
  local test_root="${TIED_TEST_ROOT:-${HOME}/Documents/dev/test}"
  local ws_real test_real
  ws_real="$(cd -- "$ws" && pwd -P)"
  if [[ ! -d "$test_root" ]]; then
    fail "live run refused: WORKSPACE not under TIED_TEST_ROOT ($test_root missing)." \
      "Set TRADITIONAL_FOUR_PHASE_ALLOW_NON_DISPOSABLE=1 to override." \
      "Use a disposable client under TIED_TEST_ROOT (default ~/Documents/dev/test)."
  fi
  test_real="$(cd -- "$test_root" && pwd -P)"
  case "$ws_real" in
    "$test_real"/*) return 0 ;;
    *)
      fail "live run refused: WORKSPACE must be a disposable client under ${test_real} (got ${ws_real})." \
        "Set TRADITIONAL_FOUR_PHASE_ALLOW_NON_DISPOSABLE=1 to override." \
        "Use a path under ${test_real}."
      ;;
  esac
}

resolve_preload_contract() {
  local ws="$1"
  local candidates=(
    "${ws}/tied-project/agent-preload-contract.yaml"
    "${ws}/tied/agent-preload-contract.yaml"
    "${ws}/agent-preload-contract.yaml"
    "${ws}/tied-bundle/docs/agent-preload-contract-template.yaml"
  )
  local p
  for p in "${candidates[@]}"; do
    if [[ -f "$p" && -r "$p" ]]; then
      printf '%s' "$p"
      return 0
    fi
  done
  return 1
}

print_launch_banner() {
  local harness="$1"
  local model_slug="$2"
  local workspace="$3"
  local dry_run="$4"
  local batch_path="$5"
  printf '\n%s\n' "${_B}Traditional four-phase agentstream${_R}" >&2
  _hr_err
  printf '%s\n' "${_B}${_CY}${_SECTION_PREFIX}${_R}${_B}Launch${_R}" >&2
  _diag "harness=${harness} model=${model_slug} workspace=${workspace} dry_run=${dry_run}"
  _diag "batch=${batch_path}"
  _hr_err
}

main() {
  local dry_run=0
  local want_help=0

  while (($# > 0)); do
    case "$1" in
      -d | --dry-run)
        dry_run=1
        shift
        ;;
      -h | --help)
        want_help=1
        shift
        ;;
      -p | --plain | --no-color)
        _PLAIN_CLI=1
        shift
        ;;
      --stdout)
        _HELP_STDOUT_CLI=1
        shift
        ;;
      *)
        _texture_init
        fail "unknown argument: $1" "Run with --help for usage."
        ;;
    esac
  done

  _texture_init

  if ((want_help)); then
    usage
    exit 0
  fi

  assert_repo_root

  local workspace="${WORKSPACE:-}"
  [[ -n "$workspace" ]] || fail "WORKSPACE is required (absolute disposable client root)"
  case "$workspace" in
    /*) ;;
    *) fail "WORKSPACE must be an absolute path: $workspace" ;;
  esac
  require_directory "WORKSPACE" "$workspace"

  local batch_template="${BATCH_YAML:-${REPO_ROOT}/docs/demos/traditional-four-phase-agentstream.yaml}"
  [[ -f "$batch_template" && -r "$batch_template" ]] || fail "BATCH_YAML is not readable: $batch_template"

  local harness="${HARNESS:-cursor}"
  case "$harness" in
    cursor | claude) ;;
    *) fail "HARNESS must be cursor or claude (got: $harness)" ;;
  esac

  if ((dry_run)); then
    MODEL_SLUG="${MODEL_SLUG:-composer-2.5-fast}"
    FEATURE_REMAINDER="${FEATURE_REMAINDER:-Dry-run placeholder product remainder.}"
  else
    [[ -n "${MODEL_SLUG:-}" ]] || fail "MODEL_SLUG is required for live runs"
    [[ -n "${FEATURE_REMAINDER:-}" ]] || fail "FEATURE_REMAINDER is required for live runs"
    assert_disposable_workspace "$workspace"
    if [[ "$harness" == "claude" && "${AGENTSTREAM_CLAUDE_LIVE_OK:-}" != "1" ]]; then
      fail "Claude live runs require AGENTSTREAM_CLAUDE_LIVE_OK=1 (after local agentstream tests are green)" \
        "Export AGENTSTREAM_CLAUDE_LIVE_OK=1 when HARNESS=claude and not dry-run."
    fi
  fi

  local expanded_batch
  expanded_batch="$(mktemp -t traditional-four-phase-batch)"
  expanded_batch="${expanded_batch}.yaml"
  trap 'rm -f "$expanded_batch"' EXIT
  expand_batch_placeholders "$batch_template" "$expanded_batch"

  local tied_cli="${REPO_ROOT}/mcp-server/packages/cli/dist/index.js"
  if [[ ! -f "$tied_cli" ]]; then
    fail "built tied CLI not found: $tied_cli" \
      "Run ./build-workspace.sh from the TIED store root." \
      "Or: cd mcp-server && npm run build"
  fi

  local -a cmd=(node "$tied_cli" agentstream -w "$workspace" --harness "$harness" --model "$MODEL_SLUG")
  ((dry_run)) && cmd+=(-d)
  cmd+=(-y --skip-tied-mcp-preflight)
  cmd+=(-b "$expanded_batch")
  cmd+=(
    --checklist-var "MODEL_CONFIG=${MODEL_CONFIG:-}"
    --checklist-var "MODEL_SLUG=${MODEL_SLUG}"
    --checklist-var "FEATURE_REMAINDER=${FEATURE_REMAINDER:-}"
  )

  local preload
  if preload="$(resolve_preload_contract "$workspace")"; then
    cmd+=(-p "$preload")
    case "$preload" in
      */tied-bundle/docs/agent-preload-contract-template.yaml)
        _diag "preload: using tied-bundle template (no tied-project/agent-preload-contract.yaml in client)"
        ;;
    esac
  else
    _warn "no preload contract under WORKSPACE (tied-project, tied/, or tied-bundle template); continuing without -p"
  fi

  print_launch_banner "$harness" "$MODEL_SLUG" "$workspace" "$dry_run" "$expanded_batch"

  # Default: WF trials are not W5 harness tests ([REQ-TIED_JEV_DECISION_COPROCESSOR])
  if [[ "${TRADITIONAL_FOUR_PHASE_JEV_HARNESS:-}" != "1" ]]; then
    unset AGENTSTREAM_JEV_HARNESS
  fi

  exec "${cmd[@]}"
}

main "$@"
