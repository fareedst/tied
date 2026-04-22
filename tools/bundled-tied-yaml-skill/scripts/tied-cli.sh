#!/usr/bin/env bash
# tied-cli.sh -- Call any tied-yaml MCP tool from the command line.
#
# Usage:
#   tied-cli.sh <tool_name> [args_json]
#
# Examples:
#   tied-cli.sh yaml_index_list_tokens '{"index":"requirements"}'
#   tied-cli.sh tied_validate_consistency '{}'
#   tied-cli.sh yaml_detail_read '{"token":"REQ-MY_FEATURE"}'
#   tied-cli.sh tied_token_create_with_detail @/path/to/payload.json
#
# Large payloads: any args other than exactly "{}" are written to a temp file and
# passed via TIED_CLI_ARGS_FILE so they are not subject to OS environment size limits.
#
# Environment:
#   TIED_BASE_PATH  -- absolute path to the tied/ directory (auto-detected if unset)
#   TIED_MCP_BIN    -- path to mcp-server/dist/index.js (auto-detected if unset)
#   TIED_CLI_QUIET_MCP_STDERR -- set to 0 to forward MCP server stderr (default: suppress)

set -euo pipefail

TOOL_NAME="${1:?Usage: tied-cli.sh <tool_name> [args_json|@path/to.json]}"
ARGS_JSON="${2:-{\}}"
if [[ "${ARGS_JSON}" == @* ]]; then
  ARGS_FILE="${ARGS_JSON#@}"
  if [[ ! -f "${ARGS_FILE}" ]]; then
    echo "ERROR: args file not found: ${ARGS_FILE}" >&2
    exit 1
  fi
  ARGS_JSON="$(cat "${ARGS_FILE}")"
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"

: "${TIED_BASE_PATH:=$REPO_ROOT/tied}"
: "${TIED_MCP_BIN:=$REPO_ROOT/mcp-server/dist/index.js}"

if [[ ! -f "$TIED_MCP_BIN" ]]; then
  echo "ERROR: MCP server binary missing: $TIED_MCP_BIN" >&2
  echo "  Build in your TIED clone: npm install && npm run build --prefix mcp-server" >&2
  echo "  Or set TIED_MCP_BIN to an existing dist/index.js, e.g.:" >&2
  echo "  export TIED_MCP_BIN=/path/to/tied-repository/mcp-server/dist/index.js" >&2
  exit 1
fi

export TIED_BASE_PATH

REQUEST_ID=1

export TIED_CLI_MCP_BIN="$TIED_MCP_BIN"
export TIED_CLI_REQUEST_ID="$REQUEST_ID"
export TIED_CLI_TOOL_NAME="$TOOL_NAME"

cleanup_args_file() {
  if [[ -n "${TIED_CLI_ARGS_FILE:-}" && -f "${TIED_CLI_ARGS_FILE}" ]]; then
    rm -f "${TIED_CLI_ARGS_FILE}"
  fi
}
trap cleanup_args_file EXIT

# Only "{}" goes through env; anything else uses a temp file (avoids execve env limits).
if [[ "${ARGS_JSON}" == "{}" ]]; then
  export TIED_CLI_ARGS_JSON="{}"
  unset TIED_CLI_ARGS_FILE || true
else
  unset TIED_CLI_ARGS_JSON || true
  TIED_CLI_ARGS_FILE="$(mktemp "${TMPDIR:-/tmp}/tied-cli-args.XXXXXX")"
  export TIED_CLI_ARGS_FILE
  printf '%s' "${ARGS_JSON}" > "${TIED_CLI_ARGS_FILE}"
fi

CLIENT_JS="$SCRIPT_DIR/tied-mcp-stdio-client.cjs"
if [[ ! -f "$CLIENT_JS" ]]; then
  echo "ERROR: Missing $CLIENT_JS (companion to tied-cli.sh)." >&2
  exit 1
fi

exec node "$CLIENT_JS"
