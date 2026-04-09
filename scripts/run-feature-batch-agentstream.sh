#!/usr/bin/env bash

##
# run-feature-batch-agentstream
#
# Same CLI surface as run-feature-batch.sh, but invokes the Go tools/agentstream
# binary (or go run) instead of Ruby run_agent_stream.rb.
#
# Environment:
#   AGENTSTREAM  If set, path to a prebuilt agentstream executable (skips go run).
#   AGENTSTREAM_SKIP_TIED_MCP_PREFLIGHT=1  Skip Go agentstream static MCP preflight (non-TTY runs
#                without .cursor/mcp.json exit unless you set this or invoke agentstream with -y).
#
# Unsupported vs Ruby path:
#   -r / --runner      Ignored with a warning (no Ruby runner).
#
# REQ: REQ-GOAGENT-CLI-CONFIG
# IMPL: IMPL-GOAGENT-CLI-CMD
##

set -o errexit
set -o nounset
set -o pipefail

usage() {
  cat <<'EOF'
Usage:
  run-feature-batch-agentstream [options] [FEATURE_SPEC_BATCH_YAML]

Same options as run-feature-batch.sh, except:
  -r / --runner       Ignored (warning only).

Go-only (forwarded to agentstream):
  --lead-checklist-from-step ID   Optional inclusive lower main-step id
  --lead-checklist-to-step ID     Optional inclusive upper main-step id

Mid-batch resume: -f / --first-turn N (1-based) is passed through to Go agentstream; when N>1,
also pass -s / --session-id with the session to resume.

Environment:
  AGENTSTREAM        Path to agentstream binary; if unset, uses: go run -C <repo>/tools/agentstream ./cmd/agentstream
  AGENTSTREAM_SKIP_TIED_MCP_PREFLIGHT=1  Bypass tied-yaml mcp.json preflight (see tools/agentstream/README.md)

See run-feature-batch.sh --help for flag meanings.
EOF
}

fail() {
  printf 'run-feature-batch-agentstream: %s\n' "$1" >&2
  exit "${2:-2}"
}

require_value() {
  local opt_name="$1"
  local opt_value="${2:-}"
  [[ -n "$opt_value" ]] || fail "missing value for $opt_name"
}

require_readable_file() {
  local label="$1"
  local path="$2"
  [[ -f "$path" && -r "$path" ]] || fail "$label is not a readable file: $path"
}

require_directory() {
  local label="$1"
  local path="$2"
  [[ -d "$path" ]] || fail "$label is not a directory: $path"
}

main() {
  local _script_dir
  _script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  local _repo_root
  _repo_root="$(cd "${_script_dir}/.." && pwd)"
  local _go_module="${_repo_root}/tools/agentstream"

  local dry_run=0
  local session_id=""
  local first_turn=""
  local select_order=""
  local workspace="."
  local runner_ignored=0
  local lead_checklist_yaml="${_repo_root}/docs/agent-req-implementation-checklist.yaml"
  local lead_checklist_from_step=""
  local lead_checklist_to_step=""
  local prompt_file=""
  local feature_spec_batch_yaml=""

  local prompt_file_explicit=0
  local feature_spec_batch_yaml_explicit=0

  local opt=""
  local long_opt=""
  local opt_value=""

  while getopts ":hf:ds:o:w:r:c:p:b:-:" opt; do
    case "$opt" in
      h)
        usage
        exit 0
        ;;
      d)
        dry_run=1
        ;;
      f)
        require_value "-f|--first-turn" "${OPTARG:-}"
        first_turn="$OPTARG"
        ;;
      s)
        require_value "-s|--session-id" "${OPTARG:-}"
        session_id="$OPTARG"
        ;;
      o)
        require_value "-o|--select-order" "${OPTARG:-}"
        select_order="$OPTARG"
        ;;
      w)
        require_value "-w|--workspace" "${OPTARG:-}"
        workspace="$OPTARG"
        ;;
      r)
        require_value "-r|--runner" "${OPTARG:-}"
        runner_ignored=1
        ;;
      c)
        require_value "-c|--lead-checklist-yaml" "${OPTARG:-}"
        lead_checklist_yaml="$OPTARG"
        ;;
      p)
        require_value "-p|--prompt-file" "${OPTARG:-}"
        prompt_file="$OPTARG"
        prompt_file_explicit=1
        ;;
      b)
        require_value "-b|--feature-spec-batch-yaml" "${OPTARG:-}"
        feature_spec_batch_yaml="$OPTARG"
        feature_spec_batch_yaml_explicit=1
        ;;
      -)
        long_opt="${OPTARG%%=*}"
        opt_value=""
        if [[ "$OPTARG" == *=* ]]; then
          opt_value="${OPTARG#*=}"
        fi
        case "$long_opt" in
          help)
            usage
            exit 0
            ;;
          dry-run)
            dry_run=1
            ;;
          session-id|select-order|first-turn|workspace|runner|lead-checklist-yaml|lead-checklist-from-step|lead-checklist-to-step|prompt-file|feature-spec-batch-yaml)
            if [[ -z "$opt_value" ]]; then
              [[ "${!OPTIND:-}" == "" || "${!OPTIND:-}" == -* ]] && fail "missing value for --$long_opt"
              opt_value="${!OPTIND}"
              OPTIND=$((OPTIND + 1))
            fi
            case "$long_opt" in
              session-id) session_id="$opt_value" ;;
              first-turn) first_turn="$opt_value" ;;
              select-order) select_order="$opt_value" ;;
              workspace) workspace="$opt_value" ;;
              runner) runner_ignored=1 ;;
              lead-checklist-yaml) lead_checklist_yaml="$opt_value" ;;
              lead-checklist-from-step) lead_checklist_from_step="$opt_value" ;;
              lead-checklist-to-step) lead_checklist_to_step="$opt_value" ;;
              prompt-file)
                prompt_file="$opt_value"
                prompt_file_explicit=1
                ;;
              feature-spec-batch-yaml)
                feature_spec_batch_yaml="$opt_value"
                feature_spec_batch_yaml_explicit=1
                ;;
            esac
            ;;
          "")
            fail "invalid option --"
            ;;
          *)
            fail "unknown option: --$long_opt"
            ;;
        esac
        ;;
      :)
        case "$OPTARG" in
          f) fail "missing value for -f|--first-turn" ;;
          s) fail "missing value for -s|--session-id" ;;
          o) fail "missing value for -o|--select-order" ;;
          w) fail "missing value for -w|--workspace" ;;
          r) fail "missing value for -r|--runner" ;;
          c) fail "missing value for -c|--lead-checklist-yaml" ;;
          p) fail "missing value for -p|--prompt-file" ;;
          b) fail "missing value for -b|--feature-spec-batch-yaml" ;;
          *) fail "missing option argument" ;;
        esac
        ;;
      \?)
        fail "unknown option: -$OPTARG"
        ;;
    esac
  done

  shift $((OPTIND - 1))

  if (($# > 1)); then
    fail "unexpected extra arguments: $*"
  fi

  if (($# == 1)); then
    (( feature_spec_batch_yaml_explicit == 0 )) || fail "positional FEATURE_SPEC_BATCH_YAML cannot be used with --feature-spec-batch-yaml"
    feature_spec_batch_yaml="$1"
    feature_spec_batch_yaml_explicit=1
  fi

  if (( runner_ignored )); then
    printf 'run-feature-batch-agentstream: warning: ignoring -r/--runner (Go agentstream has no Ruby runner)\n' >&2
  fi

  if (( prompt_file_explicit == 0 )); then
    prompt_file="$workspace/agent-preload-contract.yaml"
    [[ -f $prompt_file ]] || prompt_file=""
  fi

  if (( feature_spec_batch_yaml_explicit == 0 )); then
    feature_spec_batch_yaml="$workspace/prompts/all.yaml"
    [[ -f $feature_spec_batch_yaml ]] || feature_spec_batch_yaml=""
  fi

  require_directory "workspace" "$workspace"
  [[ -d "${_go_module}" ]] || fail "Go module not found: ${_go_module}"
  require_readable_file "lead checklist yaml" "$lead_checklist_yaml"
  [[ -n $prompt_file ]] && require_readable_file "prompt file" "$prompt_file"
  [[ -n $feature_spec_batch_yaml ]] && require_readable_file "feature spec batch yaml" "$feature_spec_batch_yaml"

  local -a cmd
  if [[ -n "${AGENTSTREAM:-}" ]]; then
    [[ -f "$AGENTSTREAM" && -x "$AGENTSTREAM" ]] || fail "AGENTSTREAM is not an executable file: $AGENTSTREAM"
    cmd=("$AGENTSTREAM")
  else
    cmd=(go run -C "${_go_module}" ./cmd/agentstream)
  fi

  (( dry_run )) && cmd+=(-d)
  [[ -n "$session_id" ]] && cmd+=(-s "$session_id")
  [[ -n "$first_turn" ]] && cmd+=(-f "$first_turn")
  cmd+=(-w "$workspace")
  cmd+=(-c "$lead_checklist_yaml")
  [[ -n "$lead_checklist_from_step" ]] && cmd+=(--lead-checklist-from-step "$lead_checklist_from_step")
  [[ -n "$lead_checklist_to_step" ]] && cmd+=(--lead-checklist-to-step "$lead_checklist_to_step")
  [[ -n "$select_order" ]] && cmd+=(-o "$select_order")
  [[ -n "$prompt_file" ]] && cmd+=(-p "$prompt_file")
  cmd+=(-b "$feature_spec_batch_yaml")

  exec "${cmd[@]}"
}

main "$@"
