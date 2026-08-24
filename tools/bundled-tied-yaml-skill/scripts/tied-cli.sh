#!/usr/bin/env bash
# tied-cli.sh -- Call any tied-yaml MCP tool from the command line.
#
# Usage:
#   tied-cli.sh [--client NAME] <tool_name> [args_json|@path/to.json]
#
# Examples:
#   tied-cli.sh yaml_index_list_tokens '{"index":"requirements"}'
#   tied-cli.sh tied_validate_consistency '{}'
#   tied-cli.sh --client 1787507684 tied_validate_consistency '{}'
#   tied-cli.sh yaml_detail_read '{"token":"REQ-MY_FEATURE"}'
#   tied-cli.sh tied_token_create_with_detail @/path/to/payload.json
#   tied-cli.sh tied_checklist_activation_collect '{"request_token":"REQ-EXAMPLE","phase":"verification","run_id":"run-1","project_root":"/path/to/repo"}'
#   # When TIED_MCP_COLLECT_METRICS=1 and project_root matches .../dev/test/{id}, metrics client defaults to {id}
#
# Large payloads: any args other than exactly "{}" are written to a temp file and
# passed via TIED_CLI_ARGS_FILE so they are not subject to OS environment size limits.
#
# Environment:
#   TIED_BASE_PATH  -- absolute path to the tied/ directory (auto-detected if unset)
#   TIED_MCP_BIN    -- path to mcp-server/dist/index.js (auto-detected if unset)
#   TIED_CLI_QUIET_MCP_STDERR -- set to 0 to forward MCP server stderr (default: suppress)
#   TIED_MCP_COLLECT_METRICS -- set to 1 or true to append usage metrics JSONL (default: off)
#   TIED_MCP_METRICS_PATH -- optional override for metrics JSONL (default: ~/.cursor/logs/tied-mcp-metrics.jsonl)
#   TIED_MCP_METRICS_CLIENT -- optional client label; preserved when set; else --client, dev/test auto-detect, or tied-cli
#
# impl_detail_set_essence_pseudocode only (optional, mutually exclusive with each other):
#   TIED_CLI_IMPL_ESSENCE_FILE -- UTF-8 file to use as the pseudo-code body (avoids a huge JSON string).
#   TIED_CLI_IMPL_ESSENCE_STDIN=1 (or "true") -- read the body from stdin (e.g. pipe a .md file).
# These inject essence_pseudocode and strip essence_pseudocode_path from the JSON args, then call the MCP
# tool the same as inline essence_pseudocode. Example (token + optional metadata in JSON, body in file):
#   TIED_CLI_IMPL_ESSENCE_FILE=$PWD/essence.md \
#     tied-cli.sh impl_detail_set_essence_pseudocode @/tmp/impl-essence-args.json
#   # /tmp/impl-essence-args.json: { "token": "IMPL-FOO", "metadata_last_updated": { "date": "2026-04-24" } }
# Stdin (pipe or heredoc) instead of TIED_CLI_IMPL_ESSENCE_FILE:
#   TIED_CLI_IMPL_ESSENCE_STDIN=1 \
#     tied-cli.sh impl_detail_set_essence_pseudocode '{"token":"IMPL-FOO"}' < /path/to/essence.md

set -euo pipefail

TIED_CLI_METRICS_CLIENT_FLAG=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --client)
      TIED_CLI_METRICS_CLIENT_FLAG="${2:?Usage: tied-cli.sh [--client NAME] <tool_name> [args_json|@path/to.json]}"
      shift 2
      ;;
    --)
      shift
      break
      ;;
    -*)
      echo "ERROR: unknown option: $1" >&2
      exit 1
      ;;
    *)
      break
      ;;
  esac
done

TOOL_NAME="${1:?Usage: tied-cli.sh [--client NAME] <tool_name> [args_json|@path/to.json]}"
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
# Client project root (four levels up from .cursor/skills/tied-yaml/scripts); used for TIED_BASE_PATH default.
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"

: "${TIED_BASE_PATH:=$REPO_ROOT/tied}"

# TIED methodology repository (mcp-server lives here). copy_files.sh replaces the placeholder below
# with the absolute TIED source dir used at bootstrap so TIED_MCP_BIN points at that repo's dist/index.js.
: "${TIED_REPO_ROOT:=/ABSOLUTE/PATH/TO/TIED/SOURCE/DIR}"
if [[ "${TIED_REPO_ROOT}" == "/ABSOLUTE/PATH/TO/TIED/SOURCE/DIR" ]] \
   && [[ -f "${REPO_ROOT}/mcp-server/dist/index.js" ]]; then
  TIED_REPO_ROOT="${REPO_ROOT}"
fi

: "${TIED_MCP_BIN:=$TIED_REPO_ROOT/mcp-server/dist/index.js}"

if [[ ! -f "$TIED_MCP_BIN" ]]; then
  echo "ERROR: MCP server binary missing: $TIED_MCP_BIN" >&2
  echo "  Build in your TIED clone: npm install && npm run build --prefix mcp-server" >&2
  echo "  Or set TIED_MCP_BIN to an existing dist/index.js, e.g.:" >&2
  echo "  export TIED_MCP_BIN=/path/to/tied-repository/mcp-server/dist/index.js" >&2
  exit 1
fi

export TIED_BASE_PATH

# Tag metrics records when opt-in collection is enabled [IMPL-MCP_USAGE_METRICS] [REQ-MCP_USAGE_METRICS]
resolve_tied_cli_metrics_client() {
  if [[ -n "${TIED_MCP_METRICS_CLIENT:-}" ]]; then
    return 0
  fi
  if [[ -n "${TIED_CLI_METRICS_CLIENT_FLAG}" ]]; then
    export TIED_MCP_METRICS_CLIENT="${TIED_CLI_METRICS_CLIENT_FLAG}"
    return 0
  fi
  local _detected_client=""
  _detected_client="$(
    node -e '
      const raw = process.argv[1] || "{}";
      let args = {};
      try { args = JSON.parse(raw); } catch { process.exit(0); }
      const root = args.project_root || args.projectRoot || "";
      const match = String(root).match(/\/dev\/test\/([^/]+)/);
      if (match) process.stdout.write(match[1]);
    ' "${ARGS_JSON}" 2>/dev/null || true
  )"
  if [[ -n "${_detected_client}" ]]; then
    export TIED_MCP_METRICS_CLIENT="${_detected_client}"
    return 0
  fi
  export TIED_MCP_METRICS_CLIENT=tied-cli
}

if [[ -n "${TIED_MCP_COLLECT_METRICS:-}" ]]; then
  _tied_metrics_flag="$(printf '%s' "${TIED_MCP_COLLECT_METRICS}" | tr '[:upper:]' '[:lower:]')"
  case "${_tied_metrics_flag}" in
    1|true|yes) resolve_tied_cli_metrics_client ;;
  esac
  unset _tied_metrics_flag
fi

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
