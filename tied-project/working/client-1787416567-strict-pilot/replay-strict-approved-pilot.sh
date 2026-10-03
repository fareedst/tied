#!/usr/bin/env bash
# [REQ-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
# Strict-approved pilot runbook for client 1787416567 / REQ-VOLUMESTATS-CLI.
#
# Mirrors H5 replay shape (inquiry → collect → gate) with strict-candidate
# promotion to strict-approved. human_approval in inquiry JSON must use camelCase
# keys (approvedScope, waiverOwner, …) until LEAP maps snake_case in MCP handler.
# and sponsor human approval pass; negative control without approval first.
#
# Usage:
#   ./replay-strict-approved-pilot.sh [--dry-run] [--check]
#
# Environment:
#   STDD_REPO_ROOT   — TIED methodology repo (auto-detected)
#   PROJECT_ROOT     — pilot client root (default 1787416567)
#   REQUEST_TOKEN    — client feature REQ (default REQ-VOLUMESTATS-CLI)
#   METHODOLOGY_REQ  — stdd slice REQ (default REQ-TIED_ADVERSARIAL_INQUIRY)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STDD_REPO_ROOT="${STDD_REPO_ROOT:-$(cd "${SCRIPT_DIR}/../.." && pwd)}"
PROJECT_ROOT="${PROJECT_ROOT:-/Users/fareed/Documents/dev/test/1787416567}"
REQUEST_TOKEN="${REQUEST_TOKEN:-REQ-VOLUMESTATS-CLI}"
METHODOLOGY_REQ="${METHODOLOGY_REQ:-REQ-TIED_ADVERSARIAL_INQUIRY}"
TIED_CLI="${TIED_CLI:-${STDD_REPO_ROOT}/.cursor/skills/tied-yaml/scripts/tied-cli.sh}"
TIED_MCP_BIN="${TIED_MCP_BIN:-${STDD_REPO_ROOT}/mcp-server/dist/index.js}"
TIED_BASE_PATH_CLIENT="${TIED_BASE_PATH_CLIENT:-${PROJECT_ROOT}/tied}"
TIED_BASE_PATH_STDD="${TIED_BASE_PATH_STDD:-${STDD_REPO_ROOT}/tied}"
TIED_MCP_METRICS_PATH="${TIED_MCP_METRICS_PATH:-${HOME}/.cursor/logs/tied-mcp-metrics.jsonl}"
BUILD_MODE_A="${STDD_REPO_ROOT}/scripts/build_adversarial_inquiry_mode_a.rb"
ANALYZE_SCRIPT="${STDD_REPO_ROOT}/scripts/analyze_tied_mcp_metrics.rb"
INPUT_DIR="${SCRIPT_DIR}/inputs"
EVIDENCE_DIR="${SCRIPT_DIR}/evidence"
STDD_GATE_DIR="${STDD_REPO_ROOT}/working/${METHODOLOGY_REQ}"
TRACKER_PATH="${STDD_GATE_DIR}/${METHODOLOGY_REQ}_sliceS_tracker.yaml"
CITDP_PATH="${STDD_GATE_DIR}/CITDP-${METHODOLOGY_REQ}-sliceS.yaml"
SCOPE="${SCOPE:-IMPL-VOLUMESTATS-CLI#RUN_VOLUMESTATS}"
METHODOLOGY_SCOPE="${METHODOLOGY_SCOPE:-IMPL-ROOTJOBS_TREE#BUILD_FOREST#165443cef52e47de}"

DRY_RUN=0
CHECK_ONLY=0

HUMAN_APPROVAL_JSON='{
  "reviewer": "sponsor",
  "approvedScope": ["'"${SCOPE}"'"],
  "thresholds": { "precision": 0.9, "reviewerAgreement": 0.8 },
  "waiverOwner": "sponsor",
  "waiverExpiry": "2026-09-30",
  "rollbackCriteria": "Disable strict-approved when pilot window expires or two budget breaches occur.",
  "approvalRevision": "sliceS-rev-1",
  "citdpRecord": "CITDP-REQ-TIED_ADVERSARIAL_INQUIRY-sliceS"
}'

ELIGIBILITY_JSON='{
  "eligible": true,
  "diagnostics": [],
  "proofBoundary": "human_decision"
}'

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) DRY_RUN=1; shift ;;
    --check) CHECK_ONLY=1; shift ;;
    -h|--help)
      sed -n '1,18p' "$0" | tail -n +2
      exit 0
      ;;
    *) echo "ERROR: unknown option: $1" >&2; exit 1 ;;
  esac
done

log() { echo "==> $*" >&2; }

run_cmd() {
  log "$*"
  if [[ "${DRY_RUN}" -eq 0 ]]; then "$@"; fi
}

require_file() {
  if [[ ! -e "$1" ]]; then
    echo "ERROR: missing $2: $1" >&2
    exit 1
  fi
}

check_prerequisites() {
  require_file "${TIED_CLI}" "tied-cli.sh"
  require_file "${TIED_MCP_BIN}" "mcp-server dist"
  require_file "${BUILD_MODE_A}" "Mode A builder"
  require_file "${INPUT_DIR}/volumestats-graph.json" "VolumeStats graph fixture"
  require_file "${INPUT_DIR}/volumestats-fidelity.json" "VolumeStats fidelity fixture"
  require_file "${TRACKER_PATH}" "slice S tracker"
  require_file "${CITDP_PATH}" "slice S CITDP"
  require_file "${PROJECT_ROOT}/tied" "client tied/"
  mkdir -p "${EVIDENCE_DIR}"
  log "prerequisites OK"
}

run_tied_cli_client() {
  local tool="$1"
  local args_json="$2"
  log "CLIENT TIED_MCP_COLLECT_METRICS=1 ${TIED_CLI} --client 1787416567 ${tool}"
  if [[ "${DRY_RUN}" -eq 1 ]]; then return 0; fi
  env TIED_BASE_PATH="${TIED_BASE_PATH_CLIENT}" TIED_MCP_BIN="${TIED_MCP_BIN}" \
    TIED_MCP_COLLECT_METRICS=1 TIED_MCP_METRICS_CLIENT=1787416567 \
    "${TIED_CLI}" --client 1787416567 "${tool}" "${args_json}"
}

run_tied_cli_stdd() {
  local tool="$1"
  local args_json="$2"
  log "STDD ${TIED_CLI} ${tool}"
  if [[ "${DRY_RUN}" -eq 1 ]]; then return 0; fi
  env TIED_BASE_PATH="${TIED_BASE_PATH_STDD}" TIED_MCP_BIN="${TIED_MCP_BIN}" \
    TIED_MCP_COLLECT_METRICS=1 \
    "${TIED_CLI}" "${tool}" "${args_json}"
}

build_client_inquiry() {
  local phase="$1"
  local run_id="$2"
  local policy="$3"
  local out_file="$4"
  local extra_json="${5:-}"
  local provenance_file
  provenance_file="$(mktemp "${TMPDIR:-/tmp}/vs-prov-XXXXXX.json")"
  ruby -rjson -e '
    doc = JSON.parse(File.read(ARGV[0]))
    doc["runId"] = ARGV[1]
    doc["phase"] = ARGV[2]
    doc["policy"] = ARGV[3]
    File.write(ARGV[4], JSON.pretty_generate(doc) + "\n")
  ' "${INPUT_DIR}/volumestats-provenance-template.json" "${run_id}" "${phase}" "${policy}" "${provenance_file}"

  local cmd=(
    ruby "${BUILD_MODE_A}"
    --graph "${INPUT_DIR}/volumestats-graph.json"
    --fidelity "${INPUT_DIR}/volumestats-fidelity.json"
    --provenance "${provenance_file}"
    --scope "${SCOPE}"
    --project-root "${PROJECT_ROOT}"
    --request-token "${REQUEST_TOKEN}"
    --run-id "${run_id}"
    --phase "${phase}"
    --policy "${policy}"
  )
  log "${cmd[*]} > ${out_file}"
  if [[ "${DRY_RUN}" -eq 1 ]]; then rm -f "${provenance_file}"; return 0; fi
  local base_payload
  base_payload="$("${cmd[@]}")"
  if [[ -n "${extra_json}" ]]; then
    ruby -rjson -e '
      base = JSON.parse(STDIN.read)
      extra = JSON.parse(ARGV[0])
      base.merge!(extra)
      puts JSON.pretty_generate(base)
    ' "${extra_json}" <<< "${base_payload}" > "${out_file}"
  else
    printf '%s\n' "${base_payload}" > "${out_file}"
  fi
  rm -f "${provenance_file}"
}

build_methodology_inquiry() {
  local phase="$1"
  local run_id="$2"
  local policy="$3"
  local out_file="$4"
  local fixture_root="${STDD_REPO_ROOT}/mcp-server/test/fixtures/adversarial-inquiry-go-rootjobs"
  local cmd=(
    ruby "${BUILD_MODE_A}"
    --graph "${fixture_root}/graph.json"
    --fidelity "${fixture_root}/fidelity.json"
    --scope "${METHODOLOGY_SCOPE}"
    --project-root "${STDD_REPO_ROOT}"
    --request-token "${METHODOLOGY_REQ}"
    --run-id "${run_id}"
    --phase "${phase}"
    --policy "${policy}"
  )
  log "${cmd[*]} > ${out_file}"
  if [[ "${DRY_RUN}" -eq 1 ]]; then return 0; fi
  "${cmd[@]}" > "${out_file}"
}

assemble_gate_payload() {
  local phase="$1"
  local activation_json="$2"
  local out_file="$3"
  ruby -rjson -ryaml -e '
    phase = ARGV[0]
    tracker_path = ARGV[1]
    citdp_path = ARGV[2]
    activation = JSON.parse(ARGV[3])
    out_file = ARGV[4]
    tracker_doc = YAML.safe_load(File.read(tracker_path, encoding: "UTF-8"), aliases: true)
    citdp_doc = YAML.safe_load(File.read(citdp_path, encoding: "UTF-8"), aliases: true)
    citdp_key = citdp_doc.keys.find { |k| k.to_s.start_with?("CITDP-") }
    abort("CITDP root key missing") unless citdp_key
    steps = (tracker_doc.fetch("steps", []) + tracker_doc.fetch("sub_procedures", []))
    payload = {
      "phase" => phase,
      "tracker" => { "steps" => steps },
      "citdp" => citdp_doc.fetch(citdp_key),
      "activation" => {
        "receipt" => activation.fetch("receipt"),
        "artifacts" => activation.fetch("artifacts"),
        "expected" => activation.fetch("expected")
      }
    }
    File.write(out_file, JSON.pretty_generate(payload) + "\n")
  ' "${phase}" "${TRACKER_PATH}" "${CITDP_PATH}" "${activation_json}" "${out_file}"
}

run_negative_control() {
  log "--- negative control: strict-approved without human approval ---"
  local tmp_dir inquiry_json result_json gate_path
  tmp_dir="$(mktemp -d "${TMPDIR:-/tmp}/strict-neg-XXXXXX")"
  inquiry_json="${tmp_dir}/inquiry.json"
  result_json="${tmp_dir}/result.json"
  gate_path="${EVIDENCE_DIR}/strict-approved-negative-control-gate-result.json"

  build_client_inquiry "verification" "volumestats-strict-neg-001" "strict-approved" "${inquiry_json}"
  if [[ "${DRY_RUN}" -eq 0 ]]; then
    run_tied_cli_client tied_adversarial_inquiry_run "@${inquiry_json}" | tee "${result_json}"
    ruby -rjson -e '
      result = JSON.parse(File.read(ARGV[0]))
      gate = result.dig("gate") || result.dig("artifacts", "gate") || result
      File.write(ARGV[1], JSON.pretty_generate(gate) + "\n")
    ' "${result_json}" "${gate_path}"
    log "negative control gate saved to ${gate_path}"
  fi
  rm -rf "${tmp_dir}"
}

run_client_phase() {
  local phase="$1"
  local run_id="$2"
  local policy="$3"
  local with_approval="$4"
  local tmp_dir inquiry_json result_json
  tmp_dir="$(mktemp -d "${TMPDIR:-/tmp}/vs-strict-${phase}-XXXXXX")"
  inquiry_json="${tmp_dir}/inquiry.json"
  result_json="${tmp_dir}/result.json"

  log "--- client phase: ${phase} (run_id=${run_id}, policy=${policy}) ---"
  local extra=""
  if [[ "${with_approval}" -eq 1 ]]; then
    extra=$(ruby -rjson -e "puts JSON.generate({eligibility: JSON.parse(ARGV[0]), human_approval: JSON.parse(ARGV[1])})" "${ELIGIBILITY_JSON}" "${HUMAN_APPROVAL_JSON}")
  fi
  build_client_inquiry "${phase}" "${run_id}" "${policy}" "${inquiry_json}" "${extra}"
  if [[ "${DRY_RUN}" -eq 0 ]]; then
    run_tied_cli_client tied_adversarial_inquiry_run "@${inquiry_json}" | tee "${result_json}"
    if [[ "${policy}" == "strict-approved" && "${with_approval}" -eq 1 ]]; then
      ruby -rjson -e '
        result = JSON.parse(File.read(ARGV[0]))
        gate = result["gate"] || {}
        File.write(ARGV[1], JSON.pretty_generate(gate) + "\n")
      ' "${result_json}" "${EVIDENCE_DIR}/strict-approved-blocking-gate-result.json"
    fi
  fi
  rm -rf "${tmp_dir}"
}

run_methodology_phase() {
  local phase="$1"
  local run_id="$2"
  local tmp_dir inquiry_json collect_json gate_json gate_out
  tmp_dir="$(mktemp -d "${TMPDIR:-/tmp}/sliceS-${phase}-XXXXXX")"
  inquiry_json="${tmp_dir}/inquiry.json"
  collect_json="${tmp_dir}/collect.json"
  gate_json="${tmp_dir}/gate.json"
  gate_out="${STDD_GATE_DIR}/gate-sliceS-${phase}.json"

  log "--- methodology phase: ${phase} (run_id=${run_id}) ---"
  build_methodology_inquiry "${phase}" "${run_id}" "strict-candidate" "${inquiry_json}"
  if [[ "${DRY_RUN}" -eq 0 ]]; then
    run_tied_cli_stdd tied_adversarial_inquiry_run "@${inquiry_json}"
    local collect_args
    collect_args="$(printf '{"request_token":"%s","phase":"%s","run_id":"%s","project_root":"%s","metrics_path":"%s"}' \
      "${METHODOLOGY_REQ}" "${phase}" "${run_id}" "${STDD_REPO_ROOT}" "${TIED_MCP_METRICS_PATH}")"
    run_tied_cli_stdd tied_checklist_activation_collect "${collect_args}" | tee "${collect_json}"
    assemble_gate_payload "${phase}" "$(cat "${collect_json}")" "${gate_json}"
    run_tied_cli_stdd tied_checklist_gate_validate "@${gate_json}" | tee "${gate_out}"
  fi
  rm -rf "${tmp_dir}"
}

main() {
  check_prerequisites
  if [[ "${CHECK_ONLY}" -eq 1 ]]; then exit 0; fi

  log "1787416567 strict-approved pilot (dry_run=${DRY_RUN})"
  run_negative_control
  run_client_phase pre_implementation volumestats-strict-pre-001 strict-candidate 0
  run_client_phase verification volumestats-strict-verify-001 strict-approved 1
  run_client_phase close_out volumestats-strict-close-001 strict-approved 1

  log "stdd methodology integrated gates for ${METHODOLOGY_REQ}"
  run_methodology_phase pre_implementation sliceS-pre-001
  run_methodology_phase verification sliceS-verify-001
  run_methodology_phase close_out sliceS-close-001

  if [[ -n "${TIED_MCP_METRICS_PATH}" && -f "${TIED_MCP_METRICS_PATH}" && "${DRY_RUN}" -eq 0 ]]; then
    run_cmd ruby "${ANALYZE_SCRIPT}" --aggregate --project-root "${PROJECT_ROOT}" "${TIED_MCP_METRICS_PATH}"
  fi
  log "strict pilot replay complete"
}

main "$@"
