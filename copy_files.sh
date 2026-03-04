#!/usr/bin/env bash
#
# copy_files.sh
#
# Copies the TIED template files from the directory containing this script
# into a target project's `tied/` directory.
#
# Creates:
#   - Base files (.cursorrules, AGENTS.md, ai-principles.md) in project root
#   - Template files (requirements.md, etc.) in tied/
#   - implementation-decisions/ directory in tied/ with example detail files
#   - architecture-decisions/ directory in tied/ with example detail files
#   - requirements/ directory in tied/ with example detail files
#   - Migration guides for converting monolithic decision files and token formats
#   - .cursor/ directory and .cursor/mcp.json with tied-yaml MCP server entry (real paths)
#
# Designed for macOS (Bash 3.2+) and Ubuntu (Bash 5.x+).
#
# Usage:
#   ./copy_files.sh /path/to/project
#   ./copy_files.sh            # copies into the current working directory

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TARGET_PROJECT_DIR="${1:-$(pwd)}"

if [[ ! -d "${TARGET_PROJECT_DIR}" ]]; then
  echo "Target project directory does not exist: ${TARGET_PROJECT_DIR}" >&2
  exit 1
fi

CURSOR_DIR="${TARGET_PROJECT_DIR}/.cursor"
TIED_DIR="${TARGET_PROJECT_DIR}/tied"
IMPL_DECISIONS_DIR="${TIED_DIR}/implementation-decisions"
ARCH_DECISIONS_DIR="${TIED_DIR}/architecture-decisions"
REQ_DIR="${TIED_DIR}/requirements"
mkdir -p "${TIED_DIR}"
mkdir -p "${IMPL_DECISIONS_DIR}"
mkdir -p "${ARCH_DECISIONS_DIR}"
mkdir -p "${REQ_DIR}"
mkdir -p "${CURSOR_DIR}/logs"

# Portable real path (macOS has no realpath by default)
_realpath() {
  python3 -c "import os, sys; print(os.path.realpath(sys.argv[1]))" "$1"
}
TIED_SERVER_PATH="$(_realpath "${SCRIPT_DIR}/mcp-server/dist/index.js")"
TIED_BASE_PATH_VALUE="$(_realpath "${TIED_DIR}")"
if [[ ! -f "${SCRIPT_DIR}/mcp-server/dist/index.js" ]]; then
  echo "DEBUG: MCP server not yet built at ${TIED_SERVER_PATH}; run 'cd mcp-server && npm install && npm run build' in the TIED repo." >&2
fi

MCP_JSON="${TARGET_PROJECT_DIR}/.cursor/mcp.json"
HOOKS_JSON="${TARGET_PROJECT_DIR}/.cursor/hooks.json"

if [[ -f "${SCRIPT_DIR}/.cursor/hooks.json" ]]; then
  mkdir -p "${CURSOR_DIR}"
  cp "${SCRIPT_DIR}/.cursor/hooks.json" "$HOOKS_JSON"
  sed -i '' "s|${SCRIPT_DIR}/.cursor/logs|${TARGET_PROJECT_DIR}/.cursor/logs|g" "$HOOKS_JSON"
fi

_write_mcp_json() {
  local dest="$1"
  TIED_SERVER_PATH="${TIED_SERVER_PATH}" TIED_BASE_PATH_VALUE="${TIED_BASE_PATH_VALUE}" MCP_JSON_DEST="${dest}" python3 -c '
import json, os
server = os.environ["TIED_SERVER_PATH"]
base = os.environ["TIED_BASE_PATH_VALUE"]
entry = {"command": "node", "args": [server], "env": {"TIED_BASE_PATH": base}}
config = {"mcpServers": {"tied-yaml": entry}}
with open(os.environ["MCP_JSON_DEST"], "w") as f:
    json.dump(config, f, indent=2)
'
}

if [[ ! -f "${MCP_JSON}" ]]; then
  _write_mcp_json "${MCP_JSON}"
  echo "Created ${MCP_JSON} with tied-yaml MCP server entry."
else
  if command -v jq &>/dev/null; then
    tmp=$(mktemp)
    if jq --arg server "${TIED_SERVER_PATH}" --arg base "${TIED_BASE_PATH_VALUE}" \
      '.mcpServers = ((.mcpServers // {}) | if .["tied-yaml"] == null then .["tied-yaml"] = {"command":"node","args":[$server],"env":{"TIED_BASE_PATH":$base}} else . end)' \
      "${MCP_JSON}" > "${tmp}"; then
      mv "${tmp}" "${MCP_JSON}"
      echo "Updated ${MCP_JSON}: added tied-yaml MCP server entry (if missing)."
    else
      rm -f "${tmp}"
      echo "DEBUG: Invalid JSON in ${MCP_JSON}; overwriting with minimal config." >&2
      _write_mcp_json "${MCP_JSON}"
      echo "Created ${MCP_JSON} with tied-yaml MCP server entry."
    fi
  else
    tmp=$(mktemp)
    if TIED_SERVER_PATH="${TIED_SERVER_PATH}" TIED_BASE_PATH_VALUE="${TIED_BASE_PATH_VALUE}" python3 -c "
import json, os, sys
try:
    with open(\"${MCP_JSON}\") as f:
        config = json.load(f)
except (json.JSONDecodeError, IOError):
    sys.exit(1)
config.setdefault('mcpServers', {})
if config['mcpServers'].get('tied-yaml') is None:
    config['mcpServers']['tied-yaml'] = {
        'command': 'node',
        'args': [os.environ['TIED_SERVER_PATH']],
        'env': {'TIED_BASE_PATH': os.environ['TIED_BASE_PATH_VALUE']}
    }
with open(\"${tmp}\", 'w') as f:
    json.dump(config, f, indent=2)
" 2>/dev/null; then
      mv "${tmp}" "${MCP_JSON}"
      echo "Updated ${MCP_JSON}: added tied-yaml MCP server entry (if missing)."
    else
      rm -f "${tmp}"
      echo "DEBUG: Invalid JSON in ${MCP_JSON}; overwriting with minimal config." >&2
      _write_mcp_json "${MCP_JSON}"
      echo "Created ${MCP_JSON} with tied-yaml MCP server entry."
    fi
  fi
fi

BASE_FILES=(
  ".cursorrules"
  "AGENTS.md"
  "ai-principles.md"
)

for template in "${BASE_FILES[@]}"; do
  src="${SCRIPT_DIR}/${template}"
  dest="${TARGET_PROJECT_DIR}/${template}"

  if [[ ! -f "${src}" ]]; then
    echo "Missing base file: ${src}" >&2
    exit 1
  fi

  if [[ ! -f "${dest}" ]]; then
    cp -p "${src}" "${dest}"
  fi
done

echo "Copied ${#BASE_FILES[@]} base files into ${TARGET_PROJECT_DIR}."

# At repo root these files are templates; in tied/ they are the project indexes (same filename).
TEMPLATE_FILES=(
  "requirements.md"
  "requirements.yaml"
  "architecture-decisions.md"
  "architecture-decisions.yaml"
  "implementation-decisions.md"
  "implementation-decisions.yaml"
  "processes.md"
  "semantic-tokens.md"
  "semantic-tokens.yaml"
  "tasks.md"
  "commit-guidelines.md"
)

for f in "${TEMPLATE_FILES[@]}"; do
  src="${SCRIPT_DIR}/${f}"
  dest="${TIED_DIR}/${f}"

  if [[ ! -f "${src}" ]]; then
    echo "Missing template file: ${src}" >&2
    exit 1
  fi

  if [[ ! -f "${dest}" ]]; then
    cp -p "${src}" "${dest}"
  fi
done

echo "Copied ${#TEMPLATE_FILES[@]} template files into ${TIED_DIR}."

# Copy detail-files schema (YAML detail file structure reference)
if [[ -f "${SCRIPT_DIR}/detail-files-schema.md" && ! -f "${TIED_DIR}/detail-files-schema.md" ]]; then
  cp -p "${SCRIPT_DIR}/detail-files-schema.md" "${TIED_DIR}/detail-files-schema.md"
  echo "Copied detail-files-schema.md into ${TIED_DIR}."
fi

# Copy implementation decision detail file examples (YAML)
IMPL_TEMPLATE_DIR="${SCRIPT_DIR}/implementation-decisions"
if [[ -d "${IMPL_TEMPLATE_DIR}" ]]; then
  impl_count=0
  for detail_file in "${IMPL_TEMPLATE_DIR}"/*.yaml; do
    if [[ -f "${detail_file}" ]]; then
      filename="$(basename "${detail_file}")"
      dest="${IMPL_DECISIONS_DIR}/${filename}"
      if [[ ! -f "${dest}" ]]; then
        cp -p "${detail_file}" "${dest}"
        ((impl_count++)) || true
      fi
    fi
  done
  if [[ ${impl_count} -gt 0 ]]; then
    echo "Copied ${impl_count} implementation decision example(s) into ${IMPL_DECISIONS_DIR}."
  fi
fi

# Copy architecture decision detail file examples (YAML)
ARCH_TEMPLATE_DIR="${SCRIPT_DIR}/architecture-decisions"
if [[ -d "${ARCH_TEMPLATE_DIR}" ]]; then
  arch_count=0
  for detail_file in "${ARCH_TEMPLATE_DIR}"/*.yaml; do
    if [[ -f "${detail_file}" ]]; then
      filename="$(basename "${detail_file}")"
      dest="${ARCH_DECISIONS_DIR}/${filename}"
      if [[ ! -f "${dest}" ]]; then
        cp -p "${detail_file}" "${dest}"
        ((arch_count++)) || true
      fi
    fi
  done
  if [[ ${arch_count} -gt 0 ]]; then
    echo "Copied ${arch_count} architecture decision example(s) into ${ARCH_DECISIONS_DIR}."
  fi
fi

# Copy requirements detail file examples (YAML)
REQ_TEMPLATE_DIR="${SCRIPT_DIR}/requirements"
if [[ -d "${REQ_TEMPLATE_DIR}" ]]; then
  req_count=0
  for detail_file in "${REQ_TEMPLATE_DIR}"/*.yaml; do
    if [[ -f "${detail_file}" ]]; then
      filename="$(basename "${detail_file}")"
      dest="${REQ_DIR}/${filename}"
      if [[ ! -f "${dest}" ]]; then
        cp -p "${detail_file}" "${dest}"
        ((req_count++)) || true
      fi
    fi
  done
  if [[ ${req_count} -gt 0 ]]; then
    echo "Copied ${req_count} requirements example(s) into ${REQ_DIR}."
  fi
fi

# Copy migration guides (reference documents)
# MIGRATION_GUIDES=(
#   "migrate-implementation-decisions.md"
#   "migrate-architecture-decisions.md"
#   "migrate-semantic-token-format.md"
#   "migrate-requirements.md"
# )
MIGRATION_GUIDES=()
for guide in "${MIGRATION_GUIDES[@]}"; do
  src="${SCRIPT_DIR}/${guide}"
  dest="${TIED_DIR}/${guide}"
  if [[ -f "${src}" && ! -f "${dest}" ]]; then
    cp -p "${src}" "${dest}"
  fi
done
echo "Copied migration guides into ${TIED_DIR}."