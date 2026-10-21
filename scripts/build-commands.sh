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
  local root="${_BUILD_COMMANDS_REPO_ROOT}"
  if [[ -d "${root}/tied-project" ]]; then
    "${_BUILD_COMMANDS_DIR}/lint_yaml.sh" -F tied-project -F tied-bundle
  else
    "${_BUILD_COMMANDS_DIR}/lint_yaml.sh" -F tied
  fi
}
alias lint-tied=lint_tied

lint_reorder() {
  "${_BUILD_COMMANDS_DIR}/lint.sh" "$@"
}
alias lint-reorder=lint_reorder

validate_tied() {
  local default_base="${_BUILD_COMMANDS_REPO_ROOT}/tied-project"
  if [[ ! -d "$default_base" && -d "${_BUILD_COMMANDS_REPO_ROOT}/tied" ]]; then
    default_base="${_BUILD_COMMANDS_REPO_ROOT}/tied"
  fi
  local base_path="${TIED_BASE_PATH:-$default_base}"
  local mcp_bin="${TIED_MCP_BIN:-${_BUILD_COMMANDS_REPO_ROOT}/mcp-server/dist/index.js}"
  local consistency_args='{"check_pseudocode":true,"check_detail_files":true}'
  TIED_BASE_PATH="$base_path" TIED_MCP_BIN="$mcp_bin" \
    tied_cli tied_validate_consistency "$consistency_args"
}
alias validate-tied=validate_tied

pseudocode_validate() {
  tied_cli pseudocode_validate "$@"
}
alias pseudocode-validate=pseudocode_validate

validate_vocab() {
  ruby "${_BUILD_COMMANDS_DIR}/validate_vocab_index.rb" \
    "${_BUILD_COMMANDS_REPO_ROOT}"
}
alias validate-vocab=validate_vocab

# --- Build ---

build_agentstream() {
  echo_exec --cd "${_BUILD_COMMANDS_REPO_ROOT}/mcp-server" npm run build -w @tied/agentstream
  echo_exec --cd "${_BUILD_COMMANDS_REPO_ROOT}/mcp-server" npm run build -w @tied/cli
}
alias build-agentstream=build_agentstream

build_mcp() {
  echo_exec --cd "${_BUILD_COMMANDS_REPO_ROOT}/mcp-server" npm install
  echo_exec --cd "${_BUILD_COMMANDS_REPO_ROOT}/mcp-server" npm run build
}
alias build-mcp=build_mcp

build_workspace() {
  echo_exec "${_BUILD_COMMANDS_REPO_ROOT}/build-workspace.sh"
}
alias build-workspace=build_workspace

build_all() {
  build_workspace
}
alias build-all=build_all

# --- Test / verify ---

test_mcp() {
  echo_exec --cd "${_BUILD_COMMANDS_REPO_ROOT}/mcp-server" npm run test
}
alias test-mcp=test_mcp

test_tied_cli_smoke() {
  local root="${_BUILD_COMMANDS_REPO_ROOT}"
  local cli="${root}/mcp-server/packages/cli/dist/index.js"
  echo "DEBUG: test-all CLI smoke: tied --help"
  echo_exec node "$cli" --help
  echo "DEBUG: test-all CLI smoke: tied yaml --help"
  echo_exec node "$cli" yaml --help
  echo "DEBUG: test-all CLI smoke: tied agentstream --help"
  echo_exec node "$cli" agentstream --help
  # `tied mcp` is stdio-only (no --help); bootstrap copy-files has no --help flag.
  echo "DEBUG: test-all CLI smoke: verify mcp + bootstrap dispatch targets exist"
  test -f "${root}/mcp-server/dist/index.js"
  test -f "${root}/tools/bootstrap/install-layers.mjs"
  test -f "${root}/tools/bootstrap/lint-stale-layout.mjs"
  test -f "${root}/tied-install.sh"
  test -f "${root}/tied-install.cmd"
  test -f "${root}/tied-install.ps1"
  test -f "${root}/tools/bootstrap/tied-install-dispatch.mjs"
  test -f "${root}/mcp-server/packages/yaml-cli/dist/index.js"
  test -f "${root}/mcp-server/packages/agentstream/dist/index.js"
}

test_agentstream() {
  echo_exec --cd "${_BUILD_COMMANDS_REPO_ROOT}/mcp-server" npm run build -w @tied/agentstream
  echo_exec --cd "${_BUILD_COMMANDS_REPO_ROOT}/mcp-server" npm run test -w @tied/agentstream
}
alias test-agentstream=test_agentstream

verify_agentstream_parity() {
  echo_exec --cd "${_BUILD_COMMANDS_REPO_ROOT}/mcp-server" npm run build
  echo_exec --cd "${_BUILD_COMMANDS_REPO_ROOT}/mcp-server" npm run test -w @tied/agentstream
}
alias verify-agentstream-parity=verify_agentstream_parity

# [REQ-TIED_CLAUDE_HARNESS] [IMPL-TIED_CLAUDE_HARNESS] Dual-harness bootstrap contract (copy-files Claude paths).
test_bootstrap_claude_harness() {
  local root="${_BUILD_COMMANDS_REPO_ROOT}"
  if [[ ! -f "${root}/mcp-server/dist/index.js" ]]; then
    echo "DEBUG: test-bootstrap-claude-harness: building mcp-server (dist prerequisite)"
    build_mcp
  fi
  echo_exec node --test "${root}/tools/bootstrap/lib/claude-harness.test.mjs"
}
alias test-bootstrap-claude-harness=test_bootstrap_claude_harness

# [REQ-TIED_LAYERED_CLIENT_INSTALL] [IMPL-TIED_LAYERED_CLIENT_INSTALL] Layered tied-install unit/composition tests.
test_bootstrap_layered_install() {
  local root="${_BUILD_COMMANDS_REPO_ROOT}"
  if [[ ! -f "${root}/mcp-server/dist/index.js" ]]; then
    echo "DEBUG: test-bootstrap-layered-install: building mcp-server (dist prerequisite)"
    build_mcp
  fi
  echo_exec node --test \
    "${root}/tools/bootstrap/lib/install-options.test.mjs" \
    "${root}/tools/bootstrap/lib/layers/install-manifest.test.mjs" \
    "${root}/tools/bootstrap/lib/layers/mcp-layer.test.mjs" \
    "${root}/tools/bootstrap/lib/layers/verify-store.test.mjs" \
    "${root}/tools/bootstrap/lib/layers/store.test.mjs" \
    "${root}/tools/bootstrap/lib/layers/gitignore-block.test.mjs" \
    "${root}/tools/bootstrap/lib/layers/skills-linked.test.mjs" \
    "${root}/tools/bootstrap/install-layers.integration.test.mjs" \
    "${root}/tools/bootstrap/tied-install-dispatch.test.mjs" \
    "${root}/tools/bootstrap/windows-shims.test.mjs" \
    "${root}/tools/bootstrap/lib/lint-stale-layout.test.mjs" \
    "${root}/tools/bootstrap/lib/layout.test.mjs" \
    "${root}/tools/bootstrap/lib/migrate-layout.test.mjs" \
    "${root}/tools/bootstrap/lib/project-config.test.mjs" \
    "${root}/scripts/tied-new-client-audit.test.mjs"
}
alias test-bootstrap-layered-install=test_bootstrap_layered_install

lint_stale_layout() {
  local root="${_BUILD_COMMANDS_REPO_ROOT}"
  echo_exec node "${root}/tools/bootstrap/lint-stale-layout.mjs" "${root}"
}
alias lint-stale-layout=lint_stale_layout

check_docs_vocab_links() {
  local root="${_BUILD_COMMANDS_REPO_ROOT}"
  echo_exec node "${root}/tools/bootstrap/lib/check-docs-vocab-links.mjs" "${root}"
}
alias check-docs-vocab-links=check_docs_vocab_links

verify_install_matrix_doc() {
  local root="${_BUILD_COMMANDS_REPO_ROOT}"
  echo_exec node "${root}/tools/bootstrap/lib/render-install-resource-matrix.mjs"
}
alias verify-install-matrix-doc=verify_install_matrix_doc

test_all() {
  local rc=0
  (
    set -euo pipefail
    echo "DEBUG: test-all step 1/9: build_mcp"
    build_mcp || exit 1
    echo "DEBUG: test-all step 2/9: test_mcp"
    test_mcp || exit 1
    echo "DEBUG: test-all step 3/9: test_bootstrap_layered_install"
    test_bootstrap_layered_install || exit 1
    echo "DEBUG: test-all step 4/9: verify_install_matrix_doc"
    verify_install_matrix_doc || exit 1
    echo "DEBUG: test-all step 5/9: test_tied_cli_smoke"
    test_tied_cli_smoke || exit 1
    echo "DEBUG: test-all step 6/9: validate_tied"
    validate_tied || exit 1
    echo "DEBUG: test-all step 7/9: validate_vocab"
    validate_vocab || exit 1
    echo "DEBUG: test-all step 7/9: lint_stale_layout"
    lint_stale_layout || exit 1
    echo "DEBUG: test-all step 8/9: check_docs_vocab_links"
    check_docs_vocab_links || exit 1
    echo "DEBUG: test-all step 9/9: lint_tied"
    lint_tied || exit 1
    echo "DEBUG: test-all completed successfully"
  ) || rc=$?
  if (( rc != 0 )); then
    echo "DEBUG: test-all failed (exit ${rc})" >&2
  fi
  return "$rc"
}
alias test-all=test_all

# --- Close-out gates (REQ checklist + evidence envelope) ---

run_close_out_gates() {
  echo_exec node "${_BUILD_COMMANDS_REPO_ROOT}/tools/bootstrap/templates/run-close-out-gates.mjs" \
    --project-root "${_BUILD_COMMANDS_REPO_ROOT}" "$@"
}
alias run-close-out-gates=run_close_out_gates

_tfl_resolve_committed_tracker_rel() {
  local token="$1"
  local root="${_BUILD_COMMANDS_REPO_ROOT}"
  if [[ -f "${root}/tied-project/working/${token}/checklist-tracker.yaml" ]]; then
    echo "tied-project/working/${token}/checklist-tracker.yaml"
  elif [[ -f "${root}/tied-project/working/${token}/checklist-tracker.yaml" ]]; then
    echo "tied-project/working/${token}/checklist-tracker.yaml"
  else
    echo "working/${token}/checklist-tracker.yaml"
  fi
}

_tfl_resolve_working_citdp_rel() {
  local token="$1"
  local root="${_BUILD_COMMANDS_REPO_ROOT}"
  if [[ -f "${root}/tied-project/working/${token}/CITDP-${token}.yaml" ]]; then
    echo "tied-project/working/${token}/CITDP-${token}.yaml"
  elif [[ -f "${root}/tied-project/working/${token}/CITDP-${token}.yaml" ]]; then
    echo "tied-project/working/${token}/CITDP-${token}.yaml"
  elif [[ -f "${root}/working/${token}/CITDP-${token}.yaml" ]]; then
    echo "working/${token}/CITDP-${token}.yaml"
  else
    echo ""
  fi
}

close_out_req() {
  local token="${1:?usage: close-out-req REQ-TOKEN [extra run-close-out-gates flags...]}"
  shift
  local root="${_BUILD_COMMANDS_REPO_ROOT}"
  local tracker
  tracker="$(_tfl_resolve_committed_tracker_rel "${token}")"
  local citdp=""

  if [[ ! -f "${root}/${tracker}" ]]; then
    echo "close-out-req: missing tracker: ${root}/${tracker}" >&2
    return 2
  fi
  if [[ -f "${root}/tied-project/citdp/CITDP-${token}.yaml" ]]; then
    citdp="tied-project/citdp/CITDP-${token}.yaml"
  elif citdp="$(_tfl_resolve_working_citdp_rel "${token}")" && [[ -n "${citdp}" ]]; then
    :
  else
    echo "close-out-req: no CITDP at tied-project/citdp/CITDP-${token}.yaml or committed working CITDP draft" >&2
    return 2
  fi

  local run_id="close-out-${token}-$(date -u +%Y%m%dT%H%M%SZ)"
  run_close_out_gates \
    --request-token "$token" \
    --tracker-path "$tracker" \
    --citdp-path "$citdp" \
    --phase close_out \
    --run-id "$run_id" \
    --sync-dispositions \
    --reconcile \
    --envelope-blocking \
    "$@"
}
alias close-out-req=close_out_req

# --- Feature-orchestration smoke clients ---

# [REQ-TIED_NEW_CLIENT_ADHERENCE] [REQ-TIED_SETUP] Layer A G4 audit after bootstrap (fail closed).
_run_new_client_onboarding_audit() {
  local source_root="$1"
  local client_dir="$2"
  # [REQ-TIED_FACTORY_ONBOARDING_WORKING_PATH] Mirror committedWorkingFileRel / undivided fallback (no Node spawn).
  local report_path=""
  if [[ -d "${client_dir}/tied-project/working" ]]; then
    report_path="${client_dir}/tied-project/working/tied-new-client-audit.v1.json"
  elif [[ -d "${client_dir}/working" ]]; then
    report_path="${client_dir}/working/tied-new-client-audit.v1.json"
  else
    report_path="${client_dir}/tied-project/working/tied-new-client-audit.v1.json"
  fi

  if [[ "${TIED_SKIP_NEW_CLIENT_AUDIT:-}" == "1" || "${TIED_SKIP_NEW_CLIENT_AUDIT:-}" == "true" ]]; then
    echo "DEBUG: skipping new-client onboarding audit (TIED_SKIP_NEW_CLIENT_AUDIT)"
    return 0
  fi

  mkdir -p "$(dirname "${report_path}")"
  echo_exec node "${source_root}/scripts/run-tied-new-client-audit.mjs" \
    --client-root "${client_dir}" \
    --json-out "${report_path}"
  printf 'Onboarding audit (onboarding-adherent): %s\n' "$report_path"
}

_new_tied_test_client() {
  local client_dir="$1"
  local source_root="$2"
  shift 2 || true
  local rc=0

  node "${source_root}/tools/bootstrap/new-tied-client.mjs" \
    --source-root "${source_root}" \
    "$@" \
    "${client_dir}" || rc=$?
  return "$rc"
}

new_tied_client() {
  local client_dir="${1:?usage: new-tied-client CLIENT_DIR [TIED_REPO_ROOT]}"
  local source_root="${2:-${TIED_REPO_ROOT:-${_BUILD_COMMANDS_REPO_ROOT}}}"
  _new_tied_test_client "$client_dir" "$source_root"
}
alias new-tied-client=new_tied_client

make_new_tied_client() {
  local test_root="${TIED_TEST_ROOT:-${HOME}/Documents/dev/test}"
  local source_root="${TIED_REPO_ROOT:-${_BUILD_COMMANDS_REPO_ROOT}}"
  local dn
  dn=$(date +%s)
  mkdir -p "$test_root/$dn"
  _new_tied_test_client "$test_root/$dn" "$source_root" "$@"
  printf 'Disposable TIED client: %s/%s\n' "$test_root" "$dn"
}
alias test-new-tied-client=make_new_tied_client
alias setx-test-new-tied-client='( set -x; make_new_tied_client ); echo "rc=$?"'

new_claude_tied_client() {
  local client_dir="${1:?usage: new-claude-tied-client CLIENT_DIR [TIED_REPO_ROOT]}"
  local source_root="${2:-${TIED_REPO_ROOT:-${_BUILD_COMMANDS_REPO_ROOT}}}"
  node "${source_root}/tools/bootstrap/new-tied-client.mjs" \
    --harness claude --with-agentstream-dry-run \
    --source-root "${source_root}" "${client_dir}"
}
alias new-claude-tied-client=new_claude_tied_client

make_new_claude_tied_client() {
  local test_root="${TIED_TEST_ROOT:-${HOME}/Documents/dev/test}"
  local source_root="${TIED_REPO_ROOT:-${_BUILD_COMMANDS_REPO_ROOT}}"
  node "${source_root}/tools/bootstrap/new-tied-client.mjs" \
    --disposable --harness claude --with-agentstream-dry-run \
    --source-root "${source_root}" --test-root "${test_root}"
}
alias test-new-claude-tied-client=make_new_claude_tied_client

validate_claude_tied_client() {
  local client_dir="${1:?usage: validate-claude-tied-client CLIENT_DIR [TIED_REPO_ROOT]}"
  local source_root="${2:-${TIED_REPO_ROOT:-${_BUILD_COMMANDS_REPO_ROOT}}}"
  node "${source_root}/scripts/run-tied-claude-client-validation.mjs" \
    --client-root "${client_dir}" --source-root "${source_root}" --with-agentstream-dry-run
}
alias validate-claude-tied-client=validate_claude_tied_client

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
. "${_BUILD_COMMANDS_DIR}/_build_commands_cli_guide.inc.sh"
