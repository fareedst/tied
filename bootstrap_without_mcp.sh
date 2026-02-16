#!/usr/bin/env bash
#
# bootstrap_without_mcp.sh
#
# Bootstrap a project with TIED templates for use without MCP.
# Runs copy_files.sh, then prints next steps for managing REQ/ARCH/IMPL manually.
#
# Usage:
#   ./bootstrap_without_mcp.sh /path/to/project
#   ./bootstrap_without_mcp.sh            # current directory

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
"${SCRIPT_DIR}/copy_files.sh" "$@"

echo ""
echo "--- Next steps for non-MCP users ---"
echo "You have tied/ with YAML indexes and YAML detail files."
echo "  - Edit tied/requirements.yaml, tied/architecture-decisions.yaml, tied/implementation-decisions.yaml"
echo "  - Edit YAML files in tied/requirements/, tied/architecture-decisions/, tied/implementation-decisions/ (by hand or with yq)"
echo "  - Use semantic tokens in code and tests; keep tied/semantic-tokens.yaml in sync."
echo "See docs/using-tied-without-mcp.md for the full workflow."
