#!/usr/bin/env bash
# [REQ-TIED_ADVERSARIAL_INQUIRY] G2 live stdd-repo dogfood — Go Mode B close_out inquiry.
#
# Runs Mode B project-input inquiry with project_root = stdd methodology repo,
# collects phase-close_out artifacts, and validates integrated close_out gate.
#
# Usage:
#   ./replay-g2-stdd-dogfood.sh [--dry-run]
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STDD_REPO_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
TIED_CLI="${TIED_CLI:-${STDD_REPO_ROOT}/.cursor/skills/tied-yaml/scripts/tied-cli.sh}"
RUN_ID="${RUN_ID:-g2-dogfood-stdd-close-001}"
DRY_RUN=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) DRY_RUN=1; shift ;;
    -h|--help)
      sed -n '1,12p' "$0"
      exit 0
      ;;
    *) echo "unknown option: $1" >&2; exit 1 ;;
  esac
done

export TIED_BASE_PATH="${TIED_BASE_PATH:-${STDD_REPO_ROOT}/tied}"
export TIED_MCP_BIN="${TIED_MCP_BIN:-${STDD_REPO_ROOT}/mcp-server/dist/index.js}"
export TIED_MCP_COLLECT_METRICS="${TIED_MCP_COLLECT_METRICS:-1}"

log() { echo "==> $*" >&2; }
run_cmd() {
  log "$*"
  if [[ "${DRY_RUN}" -eq 0 ]]; then
    "$@"
  fi
}

INQUIRY_JSON="${SCRIPT_DIR}/mode-b-close-out-input.json"
COLLECT_JSON="${SCRIPT_DIR}/collect-close_out.json"
GATE_PAYLOAD="${SCRIPT_DIR}/gate-close_out-payload.json"
GATE_RESULT="${SCRIPT_DIR}/gate-close_out-result.json"

log "G2 stdd-repo dogfood (run_id=${RUN_ID}, dry_run=${DRY_RUN})"
run_cmd npm run build --prefix "${STDD_REPO_ROOT}/mcp-server"
run_cmd env TIED_BASE_PATH="${TIED_BASE_PATH}" TIED_MCP_BIN="${TIED_MCP_BIN}" TIED_MCP_COLLECT_METRICS=1 \
  "${TIED_CLI}" tied_adversarial_inquiry_run "@${INQUIRY_JSON}"

COLLECT_ARGS="$(cat <<JSON
{"request_token":"REQ-TIED_ADVERSARIAL_INQUIRY","phase":"close_out","run_id":"${RUN_ID}","project_root":"${STDD_REPO_ROOT}"}
JSON
)"
if [[ "${DRY_RUN}" -eq 1 ]]; then
  log "TIED_CLI tied_checklist_activation_collect ${COLLECT_ARGS}"
else
  env TIED_BASE_PATH="${TIED_BASE_PATH}" TIED_MCP_BIN="${TIED_MCP_BIN}" \
    "${TIED_CLI}" tied_checklist_activation_collect "${COLLECT_ARGS}" > "${COLLECT_JSON}"
fi

if [[ "${DRY_RUN}" -eq 0 ]]; then
  ruby -e '
require "json"; require "yaml"
script_dir = ARGV[0]
stdd = ARGV[1]
run_id = ARGV[2]
collect = JSON.parse(File.read(File.join(script_dir, "collect-close_out.json")))
citdp_doc = YAML.safe_load(File.read(File.join(stdd, "tied/citdp/CITDP-REQ-TIED_ADVERSARIAL_INQUIRY-sliceG2.yaml")), aliases: true)
citdp = citdp_doc["CITDP-REQ-TIED_ADVERSARIAL_INQUIRY-sliceG2"]
citdp["completion_criteria"] ||= {}
citdp["completion_criteria"]["activation"] = {
  "run_id" => run_id,
  "phase" => "close_out",
  "request_token" => "REQ-TIED_ADVERSARIAL_INQUIRY"
}
slugs = %w[risk-assessment sub-adversarial-inquiry-pass verification-gate traceable-commit]
steps = slugs.map { |slug| { "slug" => slug, "disposition" => "completed", "evidence_refs" => ["g2-dogfood/replay-g2-stdd-dogfood.sh"] } }
payload = {
  "phase" => "close_out",
  "tracker" => { "steps" => steps },
  "citdp" => citdp,
  "activation" => {
    "receipt" => collect["receipt"],
    "artifacts" => collect["artifacts"],
    "expected" => collect["expected"]
  }
}
File.write(File.join(script_dir, "gate-close_out-payload.json"), JSON.pretty_generate(payload) + "\n")
' "${SCRIPT_DIR}" "${STDD_REPO_ROOT}" "${RUN_ID}"

  env TIED_BASE_PATH="${TIED_BASE_PATH}" TIED_MCP_BIN="${TIED_MCP_BIN}" \
    "${TIED_CLI}" tied_checklist_gate_validate "@${GATE_PAYLOAD}" | tee "${GATE_RESULT}"
fi

log "dogfood complete — evidence: ${GATE_RESULT}"
