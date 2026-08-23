# build-commands.sh — sourced shell helpers for the TIED methodology repository.
# Usage (from repo root):  source scripts/build-commands.sh
# Guide:                  how            # full CLI map
#                          how build      # one section

export TIED_MCP_COLLECT_METRICS=1
export TIED_MCP_COLLECT_METRICS_VAL=1

if [ -z "${BASH_VERSION:-}" ]; then
  echo "build-commands.sh: requires bash (not sh/dash). Try: bash -lc 'source scripts/build-commands.sh'" >&2
  return 2 2>/dev/null || exit 2
fi

shopt -s expand_aliases 2>/dev/null || true

_BUILD_COMMANDS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
_BUILD_COMMANDS_REPO_ROOT="$(cd "${_BUILD_COMMANDS_DIR}/.." && pwd)"

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

# --- Backup ---

alias bi='bkpdir inc'
alias b.='bkpdir .'

# --- TIED YAML ---
# POSIX bash rejects hyphenated function names; use underscore defs + hyphen aliases.

tied_cli() {
  "${_BUILD_COMMANDS_REPO_ROOT}/.cursor/skills/tied-yaml/scripts/tied-cli.sh" "$@"
}
alias tied-cli=tied_cli

lint_tied() {
  "${_BUILD_COMMANDS_DIR}/lint_yaml.sh" -F tied
}
alias lint-tied=lint_tied

lint_reorder() {
  "${_BUILD_COMMANDS_DIR}/lint.sh" "$@"
}
alias lint-reorder=lint_reorder

validate_tied() {
  local base_path="${TIED_BASE_PATH:-${_BUILD_COMMANDS_REPO_ROOT}/tied}"
  local mcp_bin="${TIED_MCP_BIN:-${_BUILD_COMMANDS_REPO_ROOT}/mcp-server/dist/index.js}"
  local consistency_args='{"check_pseudocode":true,"check_detail_files":true}'
  TIED_BASE_PATH="$base_path" TIED_MCP_BIN="$mcp_bin" \
    tied_cli tied_validate_consistency "$consistency_args"
}
alias validate-tied=validate_tied

validate_vocab() {
  ruby "${_BUILD_COMMANDS_DIR}/validate_vocab_index.rb" \
    "${_BUILD_COMMANDS_REPO_ROOT}"
}
alias validate-vocab=validate_vocab

# --- Build ---

build_agentstream() {
  echo_exec --cd "${_BUILD_COMMANDS_REPO_ROOT}/tools/agentstream" \
    go build -trimpath -buildvcs=false -ldflags="-buildid=" \
    -o agentstream ./cmd/agentstream
}
alias build-agentstream=build_agentstream

build_mcp() {
  echo_exec --cd "${_BUILD_COMMANDS_REPO_ROOT}/mcp-server" bun install
  echo_exec --cd "${_BUILD_COMMANDS_REPO_ROOT}/mcp-server" bun run build
}
alias build-mcp=build_mcp

build_all() {
  build_mcp
  build_agentstream
}
alias build-all=build_all

# --- Test / verify ---

test_mcp() {
  echo_exec --cd "${_BUILD_COMMANDS_REPO_ROOT}/mcp-server" bun run test
}
alias test-mcp=test_mcp

test_agentstream() {
  echo_exec --cd "${_BUILD_COMMANDS_REPO_ROOT}/tools/agentstream" go test ./...
}
alias test-agentstream=test_agentstream

verify_agentstream_parity() {
  "${_BUILD_COMMANDS_DIR}/verify-agentstream-dry-run-parity.sh"
}
alias verify-agentstream-parity=verify_agentstream_parity

# --- Feature-orchestration smoke clients ---

_new_tied_test_client() {
  local client_dir="$1"
  local source_root="$2"

  set -euo pipefail
  mkdir -p -- "$(dirname -- "$client_dir")"
  cd -- "$client_dir"
  "${source_root}/copy_files.sh"
  "${source_root}/scripts/lint_yaml.sh" -F tied
  agent mcp enable tied-yaml
  git init
  git add .
  git commit -m TIED
}

new_tied_client() {
  local client_dir="${1:?usage: new-tied-client CLIENT_DIR [TIED_SOURCE_ROOT]}"
  local source_root="${2:-${TIED_SOURCE_ROOT:-${_BUILD_COMMANDS_REPO_ROOT}}}"
  _new_tied_test_client "$client_dir" "$source_root"
}
alias new-tied-client=new_tied_client

make_new_tied_client() {
  local test_root="${TIED_TEST_ROOT:-${HOME}/Documents/dev/test}"
  local source_root="${TIED_SOURCE_ROOT:-${_BUILD_COMMANDS_REPO_ROOT}}"
  local dn
  dn=$(date +%s)
  mkdir -p "$test_root/$dn"
  _new_tied_test_client "$test_root/$dn" "$source_root"
  printf 'Disposable TIED client: %s/%s\n' "$test_root" "$dn"
}
alias test-new-tied-client=make_new_tied_client
alias setx-test-new-tied-client='( set -x; make_new_tied_client ); echo "rc=$?"'

test_tied_feature_onboarding() (
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
alias test-tied-feature-onboarding=test_tied_feature_onboarding

test_tied_feature_lifecycle() (
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
alias test-tied-feature-lifecycle=test_tied_feature_lifecycle

# --- CLI guide ---

_how_usage() {
  cat <<'EOF'
build-commands.sh — TIED repo shell helpers

  source scripts/build-commands.sh     load functions (from repo root)
  how                                  full command map
  how TOPIC                            one section (backup|build|test|tied|vocab|agentstream|smoke|drivers|env)

Prerequisites for smoke tests: build-mcp, node, jq, yq, git, agent CLI.
Runbook: docs/tied-feature-extended-demo.md
EOF
}

_how_backup() {
  cat <<'EOF'
Backup
  bi                         backup increment (bkpdir inc)
  b.                         backup current directory (bkpdir .)
EOF
}

_how_build() {
  cat <<'EOF'
Build
  build-mcp                  bun install + tsc in mcp-server/
  build-agentstream          reproducible Go binary (tools/agentstream/agentstream)
                             flags: -trimpath -buildvcs=false -buildid=
  build-all                  build-mcp then build-agentstream
EOF
}

_how_test() {
  cat <<'EOF'
Test / verify
  test-mcp                   mcp-server unit/composition tests (bun run test)
  test-agentstream           go test ./... in tools/agentstream
  verify-agentstream-parity  Ruby vs Go dry-run prompt parity smoke
EOF
}

_how_tied() {
  cat <<'EOF'
TIED YAML
  tied-cli TOOL [JSON]       MCP tool surface via tied-cli.sh
                             e.g. tied-cli yaml_index_list_tokens '{"index":"requirements"}'
  lint-tied                  lint all project tied/**/*.yaml
  lint-reorder [args]        scripts/lint.sh (list reorder policy)
  validate-tied              tied_validate_consistency (pseudo-code + detail checks)
                             honors TIED_BASE_PATH, TIED_MCP_BIN (defaults: ./tied, mcp-server/dist)
EOF
}

_how_vocab() {
  cat <<'EOF'
Vocabulary index
  validate-vocab             scripts/validate_vocab_index.rb on tied/vocab layers
                             touchpoint 3 gate before traceable commit
EOF
}

_how_agentstream() {
  cat <<'EOF'
Agentstream (after build-agentstream)
  tools/agentstream/agentstream --help
  AGENTSTREAM=path           used by batch drivers when set

  scripts/run-feature-batch-agentstream.sh   Go batch runner (Ruby-flag parity)
  scripts/feature-relay.sh TITLE GOAL BEHAVIOR [agentstream flags...]
  scripts/tasd.sh NAME [target] [flags...]     disposable client + lead checklist

  MCP preflight is off by default; opt in with --tied-mcp-preflight or
  AGENTSTREAM_TIED_MCP_PREFLIGHT=1 (see tools/agentstream/README.md).
EOF
}

_how_smoke() {
  cat <<'EOF'
Feature-orchestration smoke (disposable clients)
  new-tied-client DIR [SOURCE]   copy_files.sh + lint + agent mcp enable + git init
  test-new-tied-client           same under $TIED_TEST_ROOT/<timestamp>
                                 default test root: ~/Documents/dev/test
  test-tied-feature-onboarding CLIENT_DIR
  test-tied-feature-lifecycle CLIENT_DIR

  Typical sequence:
    DEMO=$(mktemp -d "${TMPDIR:-/tmp}/tied-feature-demo.XXXXXX")
    new-tied-client "$DEMO"
    test-tied-feature-onboarding "$DEMO"
    test-tied-feature-lifecycle "$DEMO"
EOF
}

_how_drivers() {
  cat <<'EOF'
Related repo scripts (not wrapped here)
  ./copy_files.sh TARGET       bootstrap TIED into a client project
  scripts/lint_yaml.sh FILE    canonicalize/lint one or more YAML paths
  scripts/yaml_semantic_compare.rb
  scripts/analyze_tied_mcp_metrics.rb   offline MCP metrics JSONL analysis
  scripts/run-feature-batch.sh          Ruby agent-stream batch runner

  Client onboarding CLI (inside a bootstrapped project):
    .cursor/skills/tied-yaml/scripts/tied.sh init
    .cursor/skills/tied-yaml/scripts/tied.sh feature new "Title"
    .cursor/skills/tied-yaml/scripts/feature-orchestrator.sh specify|refine ...
EOF
}

_how_env() {
  cat <<'EOF'
Environment (this script sets TIED_MCP_COLLECT_METRICS=1 on source)
  TIED_BASE_PATH             tied/ directory for tied-cli and MCP
  TIED_MCP_BIN               path to mcp-server/dist/index.js
  TIED_SOURCE_ROOT           TIED repo root for new-tied-client / test-new-tied-client
  TIED_TEST_ROOT             parent dir for test-new-tied-client (default ~/Documents/dev/test)
  AGENTSTREAM                prebuilt agentstream binary for batch drivers
  AGENTSTREAM_TIED_MCP_PREFLIGHT=1   opt-in MCP preflight before live agent turns

Quality matrix: tied/docs/quality-assurance-commands.md
EOF
}

_how_all() {
  _how_usage
  echo
  _how_backup
  echo
  _how_build
  echo
  _how_test
  echo
  _how_tied
  echo
  _how_vocab
  echo
  _how_agentstream
  echo
  _how_smoke
  echo
  _how_drivers
  echo
  _how_env
}

unalias how 2>/dev/null || true
how() {
  local topic="${1:-all}"
  case "$topic" in
    all|help|-h|--help) _how_all ;;
    backup) _how_backup ;;
    build) _how_build ;;
    test|verify) _how_test ;;
    tied|yaml) _how_tied ;;
    vocab|vocabulary) _how_vocab ;;
    agentstream|go) _how_agentstream ;;
    smoke|feature|orchestration) _how_smoke ;;
    drivers|scripts) _how_drivers ;;
    env|environment) _how_env ;;
    *)
      echo "how: unknown topic: $topic" >&2
      echo "Topics: all, backup, build, test, tied, vocab, agentstream, smoke, drivers, env" >&2
      return 2
      ;;
  esac
}
