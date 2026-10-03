#!/usr/bin/env bash
# [REQ-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-MCP_USAGE_METRICS]
# Operator replay runbook for client 1787507684 / REQ-ROOTJOBS integrated activation.
#
# Satisfies integrated-activation-enforcement-operator-friction-plan.md §7 test matrix:
#   E2E | 1787507684 integrated replay script (working, not CI required initially)
#
# Re-runs the three-phase inquiry → collect → gate sequence using shipped tooling
# (Slices G, P, 2, M, U, A). Does NOT claim H5 complete or mutate audit findings;
# update working/client-1787507684-activation-audit/findings-report.yaml only after
# a human verifies a successful live replay.
#
# Usage:
#   ./replay-integrated-activation.sh [--dry-run] [--check]
#   ./replay-integrated-activation.sh --dry-run
#   TIED_MCP_METRICS_PATH=~/.cursor/logs/tied-mcp-metrics.jsonl ./replay-integrated-activation.sh
#
# Environment (defaults target the 1787507684 pilot client):
#   STDD_REPO_ROOT   — TIED methodology repo (auto-detected from script path)
#   PROJECT_ROOT     — audited client project root
#   REQUEST_TOKEN    — feature REQ token
#   TIED_CLI         — path to tied-cli.sh
#   BUILD_CONFIG     — declarative Mode A mapping (repo-relative to STDD_REPO_ROOT)
#   SCOPE            — implementation block scope id
#   TRACKER_PATH     — agent checklist YAML on the client
#   CITDP_PATH       — working CITDP YAML on the client
#   TIED_MCP_METRICS_PATH — optional metrics JSONL for collect / analyzer

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STDD_REPO_ROOT="${STDD_REPO_ROOT:-$(cd "${SCRIPT_DIR}/../.." && pwd)}"
PROJECT_ROOT="${PROJECT_ROOT:-/Users/fareed/Documents/dev/test/1787507684}"
REQUEST_TOKEN="${REQUEST_TOKEN:-REQ-ROOTJOBS}"
TIED_CLI="${TIED_CLI:-${STDD_REPO_ROOT}/.cursor/skills/tied-yaml/scripts/tied-cli.sh}"
BUILD_CONFIG="${BUILD_CONFIG:-mcp-server/test/fixtures/adversarial-inquiry-go-rootjobs/build-config.yaml}"
SCOPE="${SCOPE:-IMPL-ROOTJOBS_TREE#BUILD_FOREST#165443cef52e47de}"
TRACKER_PATH="${TRACKER_PATH:-${PROJECT_ROOT}/working/${REQUEST_TOKEN}/agent-req-implementation-checklist.yaml}"
CITDP_PATH="${CITDP_PATH:-${PROJECT_ROOT}/working/${REQUEST_TOKEN}/CITDP-${REQUEST_TOKEN}.yaml}"
TIED_MCP_BIN="${TIED_MCP_BIN:-${STDD_REPO_ROOT}/mcp-server/dist/index.js}"
TIED_BASE_PATH="${TIED_BASE_PATH:-${PROJECT_ROOT}/tied}"
TIED_MCP_METRICS_PATH="${TIED_MCP_METRICS_PATH:-${HOME}/.cursor/logs/tied-mcp-metrics.jsonl}"

DRY_RUN=0
CHECK_ONLY=0

usage() {
  sed -n '1,20p' "$0" | tail -n +2
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)
      DRY_RUN=1
      shift
      ;;
    --check)
      CHECK_ONLY=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "ERROR: unknown option: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

BUILD_CONFIG_ABS="${STDD_REPO_ROOT}/${BUILD_CONFIG}"
BUILD_SCRIPT="${STDD_REPO_ROOT}/scripts/build_adversarial_inquiry_from_tied.rb"
ANALYZE_SCRIPT="${STDD_REPO_ROOT}/scripts/analyze_tied_mcp_metrics.rb"

log() {
  echo "==> $*" >&2
}

run_cmd() {
  log "$*"
  if [[ "${DRY_RUN}" -eq 0 ]]; then
    "$@"
  fi
}

require_file() {
  local path="$1"
  local label="$2"
  if [[ ! -e "${path}" ]]; then
    echo "ERROR: missing ${label}: ${path}" >&2
    exit 1
  fi
}

check_prerequisites() {
  local ok=1
  require_file "${TIED_CLI}" "tied-cli.sh" || ok=0
  require_file "${TIED_MCP_BIN}" "built mcp-server dist (run: npm run build --prefix mcp-server)" || ok=0
  require_file "${BUILD_SCRIPT}" "Mode A builder script" || ok=0
  require_file "${BUILD_CONFIG_ABS}" "build-config fixture" || ok=0
  if [[ ! -d "${PROJECT_ROOT}" ]]; then
    echo "ERROR: PROJECT_ROOT not found: ${PROJECT_ROOT}" >&2
    echo "Set PROJECT_ROOT to the audited client checkout." >&2
    ok=0
  fi
  if [[ ! -d "${TIED_BASE_PATH}" ]]; then
    echo "ERROR: client tied/ not found: ${TIED_BASE_PATH}" >&2
    ok=0
  fi
  if [[ ! -f "${TRACKER_PATH}" ]]; then
    echo "ERROR: tracker YAML not found: ${TRACKER_PATH}" >&2
    ok=0
  fi
  if [[ ! -f "${CITDP_PATH}" ]]; then
    echo "ERROR: CITDP YAML not found: ${CITDP_PATH}" >&2
    ok=0
  fi
  if [[ "${ok}" -eq 0 ]]; then
    exit 1
  fi
  log "prerequisites OK"
  log "  STDD_REPO_ROOT=${STDD_REPO_ROOT}"
  log "  PROJECT_ROOT=${PROJECT_ROOT}"
  log "  REQUEST_TOKEN=${REQUEST_TOKEN}"
  log "  TIED_BASE_PATH=${TIED_BASE_PATH}"
}

tied_cli_env=(TIED_BASE_PATH="${TIED_BASE_PATH}" TIED_MCP_BIN="${TIED_MCP_BIN}" TIED_MCP_COLLECT_METRICS=1)

run_tied_cli() {
  local tool="$1"
  local args_json="$2"
  log "TIED_MCP_COLLECT_METRICS=1 ${TIED_CLI} ${tool} ${args_json}"
  if [[ "${DRY_RUN}" -eq 1 ]]; then
    return 0
  fi
  env "${tied_cli_env[@]}" "${TIED_CLI}" "${tool}" "${args_json}"
}

build_mode_a_payload() {
  local phase="$1"
  local run_id="$2"
  local out_file="$3"
  local cmd=(
    ruby "${BUILD_SCRIPT}"
    --build-config "${BUILD_CONFIG_ABS}"
    --project-root "${PROJECT_ROOT}"
    --tied-base-path "${TIED_BASE_PATH}"
    --request-token "${REQUEST_TOKEN}"
    --emit-mode-a
    --scope "${SCOPE}"
    --run-id "${run_id}"
    --phase "${phase}"
    --policy advisory
  )
  log "${cmd[*]} > ${out_file}"
  if [[ "${DRY_RUN}" -eq 1 ]]; then
    return 0
  fi
  "${cmd[@]}" > "${out_file}"
}

assemble_gate_payload() {
  local phase="$1"
  local activation_json="$2"
  local out_file="$3"
  local ruby_cmd
  ruby_cmd="$(cat <<'RUBY'
require "json"
require "yaml"

phase = ARGV[0]
tracker_path = ARGV[1]
citdp_path = ARGV[2]
activation_json = ARGV[3]
out_file = ARGV[4]

tracker_doc = YAML.safe_load(File.read(tracker_path, encoding: "UTF-8"), aliases: true)
citdp_doc = YAML.safe_load(File.read(citdp_path, encoding: "UTF-8"), aliases: true)
citdp_key = citdp_doc.keys.find { |key| key.to_s.start_with?("CITDP-") }
abort("CITDP root key not found in #{citdp_path}") unless citdp_key

main_steps = tracker_doc.fetch("steps", [])
sub_steps = tracker_doc.fetch("sub_procedures", [])
merged_steps = main_steps + sub_steps

activation = JSON.parse(activation_json)
payload = {
  "phase" => phase,
  "tracker" => { "steps" => merged_steps },
  "citdp" => citdp_doc.fetch(citdp_key),
  "activation" => {
    "receipt" => activation.fetch("receipt"),
    "artifacts" => activation.fetch("artifacts"),
    "expected" => activation.fetch("expected"),
  },
}
File.write(out_file, JSON.pretty_generate(payload) + "\n", encoding: "UTF-8")
RUBY
)"
  log "assemble gate payload for phase=${phase} -> ${out_file}"
  if [[ "${DRY_RUN}" -eq 1 ]]; then
    return 0
  fi
  ruby -e "${ruby_cmd}" "${phase}" "${TRACKER_PATH}" "${CITDP_PATH}" "${activation_json}" "${out_file}"
}

run_phase() {
  local phase="$1"
  local run_id="$2"
  local tmp_dir
  tmp_dir="$(mktemp -d "${TMPDIR:-/tmp}/rootjobs-replay-${phase}-XXXXXX")"
  local inquiry_json="${tmp_dir}/inquiry-${phase}.json"
  local gate_json="${tmp_dir}/gate-${phase}.json"
  local gate_out="${PROJECT_ROOT}/working/${REQUEST_TOKEN}/gate-${phase}.json"

  log "--- phase: ${phase} (run_id=${run_id}) ---"

  build_mode_a_payload "${phase}" "${run_id}" "${inquiry_json}"
  if [[ "${DRY_RUN}" -eq 0 ]]; then
    run_tied_cli tied_adversarial_inquiry_run "@${inquiry_json}"
  else
    run_tied_cli tied_adversarial_inquiry_run "@${inquiry_json}"
  fi

  local collect_args
  collect_args="$(cat <<JSON
{"request_token":"${REQUEST_TOKEN}","phase":"${phase}","run_id":"${run_id}","project_root":"${PROJECT_ROOT}","metrics_path":"${TIED_MCP_METRICS_PATH}"}
JSON
)"
  local collect_stdout="${tmp_dir}/collect-${phase}.json"
  if [[ "${DRY_RUN}" -eq 1 ]]; then
    run_tied_cli tied_checklist_activation_collect "${collect_args}"
    run_tied_cli tied_checklist_gate_validate "@${gate_json}"
  else
    run_tied_cli tied_checklist_activation_collect "${collect_args}" | tee "${collect_stdout}"
    assemble_gate_payload "${phase}" "$(cat "${collect_stdout}")" "${gate_json}"
    run_tied_cli tied_checklist_gate_validate "@${gate_json}" | tee "${gate_out}"
  fi

  if [[ "${DRY_RUN}" -eq 0 ]]; then
    rm -rf "${tmp_dir}"
  fi
}

main() {
  check_prerequisites
  if [[ "${CHECK_ONLY}" -eq 1 ]]; then
    exit 0
  fi

  log "1787507684 integrated activation replay (dry_run=${DRY_RUN})"
  run_phase pre_implementation rootjobs-pre-001
  run_phase verification rootjobs-verify-001
  run_phase close_out rootjobs-close-001

  if [[ -n "${TIED_MCP_METRICS_PATH}" && -f "${TIED_MCP_METRICS_PATH}" ]]; then
    run_cmd ruby "${ANALYZE_SCRIPT}" --aggregate --project-root "${PROJECT_ROOT}" "${TIED_MCP_METRICS_PATH}"
  else
    log "skip metrics analyzer (TIED_MCP_METRICS_PATH missing or not a file)"
  fi

  log "replay complete — human must verify gates and update findings-report.yaml for H5"
}

main "$@"
