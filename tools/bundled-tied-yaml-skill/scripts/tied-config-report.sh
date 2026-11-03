#!/usr/bin/env bash
# [REQ-TIED_CONFIG_REPORT] [IMPL-TIED_CONFIG_REPORT]
# Client wrapper: exec store tied-config-report-cli.mjs (no MCP spawn).
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
_WRAPPER_ROOT="$(cd "${SCRIPT_DIR}/../../../.." && pwd)"
: "${TIED_REPO_ROOT:=/ABSOLUTE/PATH/TO/TIED/SOURCE/DIR}"
export TIED_REPO_ROOT="${TIED_REPO_ROOT:-${_WRAPPER_ROOT}}"
CLI="${TIED_REPO_ROOT}/tools/bootstrap/tied-config-report-cli.mjs"
if [[ ! -f "${CLI}" ]]; then
  echo "ERROR: missing ${CLI}" >&2
  echo "  Set TIED_REPO_ROOT to your TIED store checkout or re-run ./tied-install.sh --refresh" >&2
  exit 1
fi
cd "${PWD}"
exec node "${CLI}" "$@"
