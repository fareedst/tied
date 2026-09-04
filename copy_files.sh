#!/usr/bin/env bash
#
# [IMPL-TIED_FILES] [ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM] [REQ-TIED_SETUP]
# How: RUN_BOOTSTRAP_ENTRYPOINT(bash) delegates to the shared Node BOOTSTRAP_TIED engine.
#
# Copies the TIED template files from the directory containing this script
# into a target project's `tied/` directory. See tools/bootstrap/README.md.
#
# Usage:
#   ./copy_files.sh /path/to/project
#   ./copy_files.sh            # copies into the current working directory
#   ./copy_files.sh --merge-vocab /path/to/project
#
# After bootstrap, in Cursor you may run: agent mcp enable tied-yaml — approve; type quit to exit the Agent CLI.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: Node.js is required but was not found on PATH." >&2
  echo "Install Node.js 18+ and re-run copy_files.sh." >&2
  exit 1
fi

exec node "${SCRIPT_DIR}/tools/bootstrap/copy-files.mjs" "$@"
