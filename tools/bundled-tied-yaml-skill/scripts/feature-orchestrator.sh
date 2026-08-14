#!/usr/bin/env bash
#
# [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP]
# How: Expose the direct feature-orchestrator lifecycle CLI from a client
# project while keeping orchestration implementation in the TIED source.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"

# copy_files.sh replaces this placeholder with the canonical TIED source root.
: "${TIED_REPO_ROOT:=/ABSOLUTE/PATH/TO/TIED/SOURCE/DIR}"
if [[ "${TIED_REPO_ROOT}" == "/ABSOLUTE/PATH/TO/TIED/SOURCE/DIR" ]] \
   && [[ -f "${REPO_ROOT}/mcp-server/dist/feature-orchestration/entry.js" ]]; then
  TIED_REPO_ROOT="${REPO_ROOT}"
fi

: "${TIED_BASE_PATH:=$REPO_ROOT/tied}"
export TIED_BASE_PATH

ORCHESTRATOR_ENTRY="${TIED_REPO_ROOT}/mcp-server/dist/feature-orchestration/entry.js"
if [[ ! -f "${ORCHESTRATOR_ENTRY}" ]]; then
  echo "ERROR: feature orchestrator entry point missing: ${ORCHESTRATOR_ENTRY}" >&2
  echo "  Build in the TIED source: npm run build --prefix mcp-server" >&2
  exit 1
fi

cd "${REPO_ROOT}"
exec node "${ORCHESTRATOR_ENTRY}" "$@"
