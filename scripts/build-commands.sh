# build-commands.sh

export TIED_MCP_COLLECT_METRICS=1

# echo_exec

if ! command -v echo_exec >/dev/null 2>&1; then
  echo_exec() {
    local dir=

    case ${1-} in
      --cd)
        [[ $# -ge 3 && -n ${2-} ]] || return 2
        dir=$2
        shift 2
        ;;
      --cd=*)
        dir=${1#--cd=}
        [[ -n $dir ]] || return 2
        shift
        ;;
      --)
        shift
        ;;
    esac

    [[ $# -gt 0 ]] || return 2

    if [[ -n $dir ]]; then
      (
        cd -- "$dir" || exit $?
        "$@"
      )
    else
      "$@"
    fi
  }
fi

export ECHO_EXEC_CMD=1
export ECHO_EXEC_TIME=1
export ECHO_EXEC_TIME_UTC='%H:%M:%S'

# bkpdir

alias bi='bkpdir inc'
alias b.='bkpdir .'

# TIED

alias tied-cli=.cursor/skills/tied-yaml/scripts/tied-cli.sh

lint-tied () {
  scripts/lint_yaml.sh -F tied
}
alias lint-reorder=scripts/lint.sh

alias build-agentstream='echo_exec --cd tools/agentstream go build -o agentstream ./cmd/agentstream'
alias build-mcp='echo_exec --cd mcp-server bun install && echo_exec --cd mcp-server bun run build'
alias test-mcp='echo_exec --cd mcp-server bun run test'

test-tied-client () {
  DN=$(date +%s)
  cd ~/Documents/dev/test
  mkdir -p "$DN"
  _new_tied_test_client "$DN" ../../chatgpt/stdd
}

_new_tied_test_client () {
  local client_dir="$1"
  local source_root="$2"

  set -euo pipefail
  cd -- "$client_dir"
  "$source_root/copy_files.sh"
  "$source_root/scripts/lint_yaml.sh" -F tied
  agent mcp enable tied-yaml
  git init
  git add .
  git commit -m TIED
}

test-tied-feature-onboarding () (
  set -euo pipefail
  local client_dir="$1"
  local init_result
  local new_result
  local build_result
  local feature_id
  local feature_slug
  local manifest_path

  init_result=$(cd -- "$client_dir" && .cursor/skills/tied-yaml/scripts/tied.sh init)
  jq -e '.ok == true and .command == "init" and .mutated_configuration == false' \
    <<<"$init_result" >/dev/null

  new_result=$(cd -- "$client_dir" && .cursor/skills/tied-yaml/scripts/tied.sh \
    feature new "Add count-lines CLI")
  jq -e '.ok == true and .result.outcome == "created"' <<<"$new_result" >/dev/null
  feature_id=$(jq -er '.result.manifest.feature_id' <<<"$new_result")
  feature_slug=$(jq -er '.result.manifest.slug' <<<"$new_result")

  build_result=$(cd -- "$client_dir" && .cursor/skills/tied-yaml/scripts/tied.sh \
    feature build "$feature_id")
  jq -e --arg feature_id "$feature_id" \
    '.ok == true and .result.feature == $feature_id' \
    <<<"$build_result" >/dev/null

  manifest_path="$client_dir/tied/features/$feature_id-$feature_slug/feature.yaml"
  test -f "$manifest_path"
  FEATURE_ID="$feature_id" yq -e \
    '.feature_id == strenv(FEATURE_ID) and .status == "draft" and .revision == 1' \
    "$manifest_path" >/dev/null

  printf 'Feature onboarding smoke passed: %s\nClient: %s\n' "$feature_id" "$client_dir"
)

test-tied-feature-lifecycle () (
  set -euo pipefail
  local client_dir="$1"
  local new_result
  local feature_id
  local revision=1
  local command
  local tool
  local args
  local expected_state
  local result
  local manifest_path
  local feature_slug

  new_result=$(cd -- "$client_dir" && .cursor/skills/tied-yaml/scripts/tied.sh \
    feature new "Exercise feature lifecycle")
  feature_id=$(jq -er '.result.manifest.feature_id' <<<"$new_result")
  feature_slug=$(jq -er '.result.manifest.slug' <<<"$new_result")

  for command in specify refine plan tasks verify close_out; do
    case "$command" in
      specify) expected_state=refining ;;
      refine) expected_state=specified ;;
      plan) expected_state=planned ;;
      tasks) expected_state=tasked ;;
      verify) expected_state=verifying ;;
      close_out) expected_state=closed ;;
    esac

    case "$command" in
      specify) tool=feature_specify ;;
      refine) tool=feature_refine ;;
      plan) tool=feature_plan ;;
      tasks) tool=feature_tasks ;;
      verify) tool=feature_verify ;;
      close_out) tool=feature_close_out ;;
    esac

    args=$(jq -cn --arg feature_identifier "$feature_id" \
      --argjson expected_revision "$revision" \
      --arg command "$command" '
      {
        feature_identifier: $feature_identifier,
        expected_revision: $expected_revision,
        command_input: (
          if $command == "plan" then {validated: true}
          elif $command == "tasks" then {planned: true}
          elif $command == "verify" then {tasked: true}
          elif $command == "close_out" then {verified: true}
          else {}
          end
        )
      }
    ')
    if [[ "$command" == "specify" || "$command" == "refine" ]]; then
      result=$(cd -- "$client_dir" && \
        .cursor/skills/tied-yaml/scripts/feature-orchestrator.sh "$command" \
        --feature "$feature_id" --revision "$revision")
    else
      result=$(cd -- "$client_dir" && \
        .cursor/skills/tied-yaml/scripts/tied-cli.sh "$tool" "$args")
    fi
    jq -e --arg expected_state "$expected_state" \
      --argjson expected_revision "$((revision + 1))" \
      '.ok == true and .current_state == $expected_state and .revision == $expected_revision' \
      <<<"$result" >/dev/null
    revision=$((revision + 1))
  done

  manifest_path="$client_dir/tied/features/$feature_id-$feature_slug/feature.yaml"
  test -f "$manifest_path"
  FEATURE_ID="$feature_id" yq -e \
    '.feature_id == strenv(FEATURE_ID) and .status == "closed" and .revision == 7' \
    "$manifest_path" >/dev/null

  printf 'Feature lifecycle smoke passed: %s\nClient: %s\n' "$feature_id" "$client_dir"
)

unalias how 2>/dev/null || true
how () {
  # print a summary of the commands above
  echo "Summary of commands:"
  echo "--------------------------------"
  echo "bi: backup inc"
  echo "b.: backup . (current directory)"
  echo "tied-cli: tied-yaml CLI tool"
  echo "lint-tied: lint tied-yaml files"
  echo "lint-reorder: lint reorder tied-yaml files"
  echo "build-agentstream: build agentstream binary"
  echo "build-mcp: build mcp-server binary"
  echo "test-mcp: test mcp-server binary"
  echo "test-tied-feature-onboarding: smoke-test tied init/new/build in a fresh client"
  echo "test-tied-feature-lifecycle: smoke-test all feature lifecycle transitions"
}