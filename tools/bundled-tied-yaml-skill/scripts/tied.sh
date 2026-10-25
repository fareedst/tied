#!/usr/bin/env bash
#
# [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP]
# How: Invoke the published onboarding command from a client project using the
# TIED source root baked by tied-install.sh.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"

# tied-install.sh replaces this placeholder with the canonical TIED source root.
: "${TIED_REPO_ROOT:=/ABSOLUTE/PATH/TO/TIED/SOURCE/DIR}"
if [[ "${TIED_REPO_ROOT}" == "/ABSOLUTE/PATH/TO/TIED/SOURCE/DIR" ]] \
   && [[ -f "${REPO_ROOT}/mcp-server/dist/feature-orchestration/onboarding-entry.js" ]]; then
  TIED_REPO_ROOT="${REPO_ROOT}"
fi

if [[ -z "${TIED_BASE_PATH:-}" ]]; then
  RESOLVER_JS="${SCRIPT_DIR}/resolve-tied-cli-env.mjs"
  _TIED_CLI_ENV_EXPORTS="$(node "${RESOLVER_JS}" 2>&1)" || {
    echo "${_TIED_CLI_ENV_EXPORTS}" >&2
    exit 1
  }
  eval "${_TIED_CLI_ENV_EXPORTS}"
  unset _TIED_CLI_ENV_EXPORTS
fi
: "${TIED_MCP_BIN:=$TIED_REPO_ROOT/mcp-server/dist/index.js}"
export TIED_BASE_PATH TIED_MCP_BIN

ONBOARDING_ENTRY="${TIED_REPO_ROOT}/mcp-server/dist/feature-orchestration/onboarding-entry.js"
if [[ ! -f "${ONBOARDING_ENTRY}" ]]; then
  echo "ERROR: feature onboarding entry point missing: ${ONBOARDING_ENTRY}" >&2
  echo "  Build in the TIED source: npm run build --prefix mcp-server" >&2
  exit 1
fi

cd "${REPO_ROOT}"
exec node "${ONBOARDING_ENTRY}" "$@"
