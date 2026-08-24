#!/usr/bin/env bash
# [REQ-TIED_ADVERSARIAL_INQUIRY] G6 operator MCP reload smoke — post-rebuild tool catalog + invoke.
#
# Simulates IDE MCP reload by rebuilding dist/index.js and spawning a fresh stdio MCP
# session (same path tied-cli uses after Cursor reload). Records tool catalog evidence.
#
# Usage:
#   ./g6-mcp-reload-smoke.sh
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STDD_REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
EVIDENCE_JSON="${SCRIPT_DIR}/g6-reload-smoke-result.json"
MCP_BIN="${STDD_REPO_ROOT}/mcp-server/dist/index.js"
TIED_CLI="${STDD_REPO_ROOT}/.cursor/skills/tied-yaml/scripts/tied-cli.sh"

log() { echo "==> $*" >&2; }

log "G6 MCP reload smoke — rebuild + fresh stdio catalog"
npm run build --prefix "${STDD_REPO_ROOT}/mcp-server"

node "${SCRIPT_DIR}/g6-mcp-list-tools.cjs" "${MCP_BIN}" \
  tied_adversarial_inquiry_run \
  tied_checklist_gate_validate \
  tied_checklist_activation_collect \
  tied_client_yaml_styling_apply \
  tied_validate_consistency \
  tied_config_get_base_path | tee "${EVIDENCE_JSON}"

log "invoke smoke — tied_config_get_base_path"
TIED_BASE_PATH="${STDD_REPO_ROOT}/tied" TIED_MCP_BIN="${MCP_BIN}" \
  "${TIED_CLI}" tied_config_get_base_path '{}' >/dev/null

log "G6 reload smoke complete — ${EVIDENCE_JSON}"
