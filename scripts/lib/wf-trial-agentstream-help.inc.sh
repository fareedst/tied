# [IMPL-WF_TRIAL_AGENTSTREAM_OPERATOR_HELP] [ARCH-WF_TRIAL_AGENTSTREAM_OPERATOR_HELP] [REQ-WF_TRIAL_AGENTSTREAM_OPERATOR_HELP]
# [REQ-TIED_CLI_OPERATOR_OUTPUT_TEXTURE] Styled operator help for workflow-trial-agentstream.sh

_WF_HELP_USE_TEXTURE=0
_WF_HELP_FD=2
_WF_B=''
_WF_D=''
_WF_C=''
_WF_R=''
_WF_HR_CHAR=''
_WF_SECTION_PREFIX=''

_wf_help_out() {
  printf '%s\n' "$@" >&"${_WF_HELP_FD}"
}

_wf_help_err() {
  printf '%s\n' "$@" >&2
}

wf_trial_help_stream_init() {
  local stdout_cli="${1:-0}"
  if [[ "${stdout_cli}" == "1" || "${TIED_CLI_HELP_STDOUT:-}" == "1" ]]; then
    _WF_HELP_FD=1
  else
    _WF_HELP_FD=2
  fi
}

wf_trial_help_plain_init() {
  local plain_cli="${1:-0}"
  local plain=0
  if [[ "${plain_cli}" == "1" || "${TIED_CLI_PLAIN:-}" == "1" || -n "${NO_COLOR:-}" ]]; then
    plain=1
  elif [[ ! -t "${_WF_HELP_FD}" ]]; then
    plain=1
  fi
  if [[ "$plain" == "1" ]]; then
    _WF_HELP_USE_TEXTURE=0
    _WF_B=''
    _WF_D=''
    _WF_C=''
    _WF_R=''
    _WF_HR_CHAR="$(printf '%*s' 56 '' | tr ' ' '-')"
    _WF_SECTION_PREFIX=''
  else
    _WF_HELP_USE_TEXTURE=1
    _WF_B=$'\033[1m'
    _WF_D=$'\033[2m'
    _WF_C=$'\033[36m'
    _WF_R=$'\033[0m'
    _WF_HR_CHAR="$(printf '\342\224\200%.0s' {1..56})"
    _WF_SECTION_PREFIX=$'\342\226\266 '
  fi
}

_wf_help_title() {
  _wf_help_out "${_WF_B}workflow-trial-agentstream — WF trial orchestrator${_WF_R}"
}

_wf_help_header() {
  _wf_help_out "${_WF_B}${_WF_C}${_WF_SECTION_PREFIX}$1${_WF_R}"
  _wf_help_hr
}

_wf_help_cmd() {
  local name="$1"
  shift
  local desc="$*"
  local pad=$((26 - ${#name}))
  if (( pad < 1 )); then
    pad=1
  fi
  if [[ "${_WF_HELP_USE_TEXTURE}" == "1" ]]; then
    _wf_help_out "  ${_WF_B}${name}${_WF_R}$(printf '%*s' "$pad" '')${_WF_D}${desc}${_WF_R}"
  else
    _wf_help_out "$(printf '  %-*s %s' 26 "$name" "$desc")"
  fi
}

_wf_help_note() {
  if [[ "${_WF_HELP_USE_TEXTURE}" == "1" ]]; then
    _wf_help_out "  ${_WF_D}$*${_WF_R}"
  else
    _wf_help_out "  $*"
  fi
}

_wf_help_hr() {
  if [[ "${_WF_HELP_USE_TEXTURE}" == "1" ]]; then
    _wf_help_out "${_WF_D}${_WF_HR_CHAR}${_WF_R}"
  else
    _wf_help_out "${_WF_HR_CHAR}"
  fi
}

_wf_help_render_body() {
  local line
  while IFS= read -r line || [[ -n "$line" ]]; do
    if [[ -z "$line" ]]; then
      _wf_help_out ""
      continue
    fi
    if [[ "$line" =~ ^[[:space:]][[:space:]]*([^[:space:]]+)[[:space:]][[:space:]]+(.*)$ ]]; then
      _wf_help_cmd "${BASH_REMATCH[1]}" "${BASH_REMATCH[2]}"
    elif [[ "$line" =~ ^[[:space:]]+(.*)$ ]]; then
      _wf_help_note "${BASH_REMATCH[1]}"
    else
      _wf_help_out "$line"
    fi
  done
}

wf_trial_agentstream_print_help() {
  _wf_help_title
  _wf_help_out ""
  _wf_help_note "Bootstrap disposable client, extract PROMPT-WF catalog block, run four-phase agentstream."
  _wf_help_out ""
  _wf_help_header "Usage"
  _wf_help_cmd "workflow-trial-agentstream" "WF_ID [--dry-run] [--workspace ABS_PATH]"
  _wf_help_cmd "workflow_trial_agentstream" "same via source scripts/build-commands.sh"
  _wf_help_note "WF_ID: wf-01 … wf-08 (or PROMPT-WF-NN)"
  _wf_help_out ""
  _wf_help_header "Examples"
  _wf_help_cmd "workflow-trial-agentstream" "wf-03 --dry-run"
  _wf_help_cmd "HARNESS=claude" "workflow-trial-agentstream wf-03 --dry-run"
  _wf_help_cmd "source" "scripts/build-commands.sh && workflow_trial_agentstream wf-02"
  _wf_help_out ""
  _wf_help_header "Batch helper"
  _wf_help_note "workflow_trial_range HARNESS CONFIG_ID EFFORT END START (registry: docs/demos/wf-trial-model-specs.yaml)"
  _wf_help_note "EFFORT: low|medium|high|xhigh|max or -; Claude -> --effort; Cursor -> slug tier on --model"
  _wf_help_out ""
  _wf_help_header "Environment"
  _wf_help_cmd "MODEL_SLUG" "default composer-2.5-fast"
  _wf_help_cmd "MODEL_CONFIG" "default composer.2.5"
  _wf_help_cmd "HARNESS" "cursor (default) or claude"
  _wf_help_cmd "MODEL_EFFORT" "from workflow_trial_range or export"
  _wf_help_cmd "TIED_TEST_ROOT" "disposable client parent (default ~/Documents/dev/test)"
  _wf_help_note "WF_TRIAL_SKIP_PROCESS_LOG=1 · WF_TRIAL_SKIP_IMPLEMENTATION_STACK=1"
  _wf_help_note "WF_TRIAL_STRICT_PREFLIGHT=1 · WF_TRIAL_STRICT_RECONCILE=1"
  _wf_help_note "AGENTSTREAM_CURSOR_MODEL_BRACKET_EFFORT=0 disables Cursor slug rewrite · see vocab/agentstream.md"
  _wf_help_out ""
  _wf_help_header "Related"
  _wf_help_cmd "how" "smoke   (after source build-commands.sh)"
  _wf_help_note "Catalog: docs/demos/catalog-traditional-workflow-trial-prompts.md"
  _wf_help_note "Prerequisite for live runs: ./build-workspace.sh (store CLI + gawk on PATH)"
  _wf_help_out ""
  _wf_help_note "Help flags: -h, --help; empty argv prints this screen."
  _wf_help_note "Global: --plain, --stdout · env NO_COLOR, TIED_CLI_PLAIN, TIED_CLI_HELP_STDOUT"
}

# Return 0 when argv is help-only (empty or global help/texture flags only).
# Return 1 when the orchestrator should run. Sets WF_TRIAL_HELP_STDOUT_CLI / WF_TRIAL_HELP_PLAIN_CLI on 0.
wf_trial_help_argv_is_help_only() {
  local stdout_cli=0 plain_cli=0
  local arg

  if (($# == 0)); then
    WF_TRIAL_HELP_STDOUT_CLI=0
    WF_TRIAL_HELP_PLAIN_CLI=0
    return 0
  fi

  for arg in "$@"; do
    case "$arg" in
      -h | --help) ;;
      --plain | -p | --no-color)
        plain_cli=1
        ;;
      --stdout)
        stdout_cli=1
        ;;
      --dry-run | --workspace | --)
        return 1
        ;;
      -*)
        return 1
        ;;
      *)
        return 1
        ;;
    esac
  done

  WF_TRIAL_HELP_STDOUT_CLI="$stdout_cli"
  WF_TRIAL_HELP_PLAIN_CLI="$plain_cli"
  return 0
}
