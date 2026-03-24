#!/usr/bin/env bash

##
# run-feature-batch
#
# Run the ATDD agent stream helper for a feature spec batch.
#
# Supports both short and long options on macOS Bash 3.2 by combining
# `getopts` with a long-option shim.
#
# Usage:
#   run-feature-batch [options] [FEATURE_SPEC_BATCH_YAML]
#
# Options:
#   -d, --dry-run
#   -s, --session-id ID
#   -o, --select-order N
#   -w, --workspace PATH
#   -r, --runner PATH
#   -c, --lead-checklist-yaml PATH
#   -p, --prompt-file PATH
#   -b, --feature-spec-batch-yaml PATH
#   -h, --help
#
# Defaults:
#   workspace:              $HOME/Documents/dev/swift/CursorHookViewer
#   runner:                 <repo>/tools/agent-stream/run_agent_stream.rb (resolved from this script)
#   lead checklist yaml:    $HOME/Documents/dev/chatgpt/stdd/docs/agent-req-implementation-checklist.yaml
#   prompt file:            $workspace/agent-preload-contract.yaml
#   feature spec batch:     $workspace/prompts/all.yaml
#

set -o errexit
set -o nounset
set -o pipefail

usage() {
  cat <<'EOF'
Usage:
  run-feature-batch [options] [FEATURE_SPEC_BATCH_YAML]

Options:
  -d, --dry-run
      Pass --dry-run to the Ruby runner.

  -s, --session-id ID
      Provide a session ID.

  -o, --select-order N
      Select a feature spec batch order.

  -w, --workspace PATH
      Project workspace directory.

  -r, --runner PATH
      Path to run_agent_stream.rb.

  -c, --lead-checklist-yaml PATH
      Path to agent-req-implementation-checklist.yaml.

  -p, --prompt-file PATH
      Path to agent-preload-contract.yaml.

  -b, --feature-spec-batch-yaml PATH
      Path to feature spec batch YAML.

  -h, --help
      Show this help.

Positional Arguments:
  FEATURE_SPEC_BATCH_YAML
      Alternate way to provide the feature spec batch YAML path.
      Cannot be used together with --feature-spec-batch-yaml.

Examples:
  run-feature-batch
  run-feature-batch --dry-run
  run-feature-batch --select-order 2
  run-feature-batch ~/Documents/dev/swift/CursorHookViewer/prompts/1-2.yaml
  run-feature-batch --workspace ~/Documents/dev/swift/CursorHookViewer
  run-feature-batch --dry-run --select-order 2 --feature-spec-batch-yaml ~/Documents/dev/swift/CursorHookViewer/prompts/1-2.yaml
EOF
}

fail() {
  printf 'run-feature-batch: %s\n' "$1" >&2
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
  local default_workspace="$HOME/Documents/dev/swift/CursorHookViewer"
  local default_runner="${_repo_root}/tools/agent-stream/run_agent_stream.rb"
  local default_checklist="${_repo_root}/docs/agent-req-implementation-checklist.yaml"

  local dry_run=0
  local session_id=""
  local select_order=""
  local workspace="$default_workspace"
  local runner="$default_runner"
  local lead_checklist_yaml="$default_checklist"
  local prompt_file=""
  local feature_spec_batch_yaml=""

  local prompt_file_explicit=0
  local feature_spec_batch_yaml_explicit=0

  local opt=""
  local long_opt=""
  local opt_value=""

  while getopts ":hds:o:w:r:c:p:b:-:" opt; do
    case "$opt" in
      h)
        usage
        exit 0
        ;;

      d)
        dry_run=1
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
        runner="$OPTARG"
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

          session-id|select-order|workspace|runner|lead-checklist-yaml|prompt-file|feature-spec-batch-yaml)
            if [[ -z "$opt_value" ]]; then
              [[ "${!OPTIND:-}" == "" || "${!OPTIND:-}" == -* ]] && fail "missing value for --$long_opt"
              opt_value="${!OPTIND}"
              OPTIND=$((OPTIND + 1))
            fi

            case "$long_opt" in
              session-id)
                session_id="$opt_value"
                ;;
              select-order)
                select_order="$opt_value"
                ;;
              workspace)
                workspace="$opt_value"
                ;;
              runner)
                runner="$opt_value"
                ;;
              lead-checklist-yaml)
                lead_checklist_yaml="$opt_value"
                ;;
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

  if (( prompt_file_explicit == 0 )); then
    prompt_file="$workspace/agent-preload-contract.yaml"
  fi

  if (( feature_spec_batch_yaml_explicit == 0 )); then
    feature_spec_batch_yaml="$workspace/prompts/all.yaml"
  fi

  require_directory "workspace" "$workspace"
  require_readable_file "runner" "$runner"
  require_readable_file "lead checklist yaml" "$lead_checklist_yaml"
  require_readable_file "prompt file" "$prompt_file"
  require_readable_file "feature spec batch yaml" "$feature_spec_batch_yaml"

  local -a cmd
  cmd=(ruby "$runner")

  (( dry_run )) && cmd+=(--dry-run)
  [[ -n "$session_id" ]] && cmd+=(--session-id "$session_id")
  cmd+=(--workspace "$workspace")
  cmd+=(--lead-checklist-yaml "$lead_checklist_yaml")
  [[ -n "$select_order" ]] && cmd+=(--feature-spec-batch-order "$select_order")
  cmd+=(--prompt-file "$prompt_file")
  cmd+=(--feature-spec-batch-yaml "$feature_spec_batch_yaml")

  "${cmd[@]}"
}

main "$@"
