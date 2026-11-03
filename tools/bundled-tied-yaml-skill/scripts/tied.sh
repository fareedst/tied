#!/usr/bin/env bash
#
# [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP]
# How: Invoke the published onboarding command from a client project using on-disk TIED runtime config.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"

unset TIED_MCP_BIN TIED_REPO_ROOT TIED_STORE_ROOT || true
unset TIED_BASE_PATH TIED_CLIENT_PROJECT_PATH TIED_CLIENT_BUNDLE_PATH TIED_METHODOLOGY_BUNDLE_PATH || true
RESOLVER_JS="${SCRIPT_DIR}/resolve-tied-cli-env.mjs"
_TIED_CLI_ENV_EXPORTS="$(node "${RESOLVER_JS}" 2>&1)" || {
  echo "${_TIED_CLI_ENV_EXPORTS}" >&2
  exit 1
}
eval "${_TIED_CLI_ENV_EXPORTS}"
unset _TIED_CLI_ENV_EXPORTS
export TIED_BASE_PATH="${TIED_CLIENT_PROJECT_PATH}"
export TIED_MCP_BIN TIED_STORE_ROOT

ONBOARDING_ENTRY="${TIED_STORE_ROOT}/mcp-server/dist/feature-orchestration/onboarding-entry.js"
if [[ ! -f "${ONBOARDING_ENTRY}" ]]; then
  echo "ERROR: feature onboarding entry point missing: ${ONBOARDING_ENTRY}" >&2
  echo "  Build in the TIED store: npm run build --prefix mcp-server" >&2
  echo "  Then run ./tied-install.sh --refresh in this client project." >&2
  exit 1
fi

cd "${REPO_ROOT}"
exec node "${ONBOARDING_ENTRY}" "$@"
