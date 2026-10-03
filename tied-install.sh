#!/usr/bin/env bash
#
# [IMPL-TIED_LAYERED_CLIENT_INSTALL] [ARCH-TIED_LAYERED_CLIENT_INSTALL] [REQ-TIED_LAYERED_CLIENT_INSTALL]
# Layer-selectable TIED client installer (default linked). Brownfield: --migrate-layout.
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: Node.js is required but was not found on PATH." >&2
  exit 1
fi

exec node "${SCRIPT_DIR}/tools/bootstrap/tied-install-dispatch.mjs" "$@"
