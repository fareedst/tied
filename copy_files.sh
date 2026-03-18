#!/usr/bin/env bash
#
# copy_files.sh
#
# Copies the TIED template files from the directory containing this script
# into a target project's `tied/` directory.
#
# Methodology vs project ([PROC-TIED_METHODOLOGY_READONLY]):
#   - Methodology (TIED-owned): Content under tied/methodology/ is from TIED templates/
#     and is ALWAYS OVERWRITTEN on each run. Clients must not edit these files; they do
#     not hold client-specific data. Re-run this script to refresh methodology.
#   - Project (client-owned): Index YAMLs and detail dirs at the ROOT of tied/
#     (tied/requirements.yaml, tied/requirements/, etc.) are created only if missing
#     and are NEVER OVERWRITTEN. All client REQ/ARCH/IMPL and tokens live there.
#
# Creates:
#   - Base files (.cursorrules, AGENTS.md, ai-principles.md) in project root
#   - tied/methodology/: index YAMLs and inherited detail files (always overwritten)
#   - tied/: project index YAMLs and requirements/, architecture-decisions/, implementation-decisions/ (create if missing, never overwrite)
#   - Guide .md and tied/docs/ (copy when missing)
#   - .cursor/ and .cursor/mcp.json with tied-yaml MCP server entry (real paths)
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
METHODOLOGY_DIR="${TIED_DIR}/methodology"
# Project dirs (client-owned; never overwritten by this script)
IMPL_DECISIONS_DIR="${TIED_DIR}/implementation-decisions"
ARCH_DECISIONS_DIR="${TIED_DIR}/architecture-decisions"
REQ_DIR="${TIED_DIR}/requirements"
mkdir -p "${TIED_DIR}"
mkdir -p "${IMPL_DECISIONS_DIR}"
mkdir -p "${ARCH_DECISIONS_DIR}"
mkdir -p "${REQ_DIR}"
mkdir -p "${CURSOR_DIR}/logs"
# Methodology dirs (TIED-owned; overwritten on each run)
mkdir -p "${METHODOLOGY_DIR}/requirements"
mkdir -p "${METHODOLOGY_DIR}/architecture-decisions"
mkdir -p "${METHODOLOGY_DIR}/implementation-decisions"

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

base_copied=0
for template in "${BASE_FILES[@]}"; do
  src="${SCRIPT_DIR}/${template}"
  dest="${TARGET_PROJECT_DIR}/${template}"

  if [[ ! -f "${src}" ]]; then
    echo "Missing base file: ${src}" >&2
    exit 1
  fi

  if [[ ! -f "${dest}" ]]; then
    cp -p "${src}" "${dest}"
    ((base_copied++)) || true
  fi
done
echo "Copied ${base_copied} of ${#BASE_FILES[@]} base files into ${TARGET_PROJECT_DIR}."

# Core methodology (inherited LEAP R+A+I) lives in templates/; guide .md files stay at root.
TEMPLATES_DIR="${SCRIPT_DIR}/templates"
# --- Methodology: index YAMLs into tied/methodology/ (ALWAYS OVERWRITE) ---
INDEX_YAML_FILES=(
  "requirements.yaml"
  "architecture-decisions.yaml"
  "implementation-decisions.yaml"
  "semantic-tokens.yaml"
)
index_yaml_copied=0
for f in "${INDEX_YAML_FILES[@]}"; do
  if [[ -f "${TEMPLATES_DIR}/${f}" ]]; then
    src="${TEMPLATES_DIR}/${f}"
  else
    src="${SCRIPT_DIR}/${f}"
  fi
  if [[ ! -f "${src}" ]]; then
    echo "Missing index file: ${src}" >&2
    exit 1
  fi
  cp -p "${src}" "${METHODOLOGY_DIR}/${f}"
  ((index_yaml_copied++)) || true
done
echo "Copied ${index_yaml_copied} of ${#INDEX_YAML_FILES[@]} methodology index YAMLs into ${METHODOLOGY_DIR} (overwritten)."

# --- Project: ensure project index YAMLs exist (CREATE IF MISSING, never overwrite) ---
project_created=0
for f in "${INDEX_YAML_FILES[@]}"; do
  dest="${TIED_DIR}/${f}"
  if [[ ! -f "${dest}" ]]; then
    printf '# Project %s - add project-specific tokens here. Do not edit tied/methodology/.\n{}\n' "${f}" > "${dest}"
    echo "Created project index ${dest} (empty)."
    ((project_created++)) || true
  fi
done
echo "Created ${project_created} of ${#INDEX_YAML_FILES[@]} project index file(s) (rest already existed)."

# Guide and other files: copy from root into tied/ when missing (client may customize).
TEMPLATE_FILES=(
  "requirements.md"
  "architecture-decisions.md"
  "implementation-decisions.md"
  "processes.md"
  "semantic-tokens.md"
  "tasks.md"
  "commit-guidelines.md"
)
guide_copied=0
for f in "${TEMPLATE_FILES[@]}"; do
  src="${SCRIPT_DIR}/${f}"
  dest="${TIED_DIR}/${f}"
  if [[ ! -f "${src}" ]]; then
    echo "Missing template file: ${src}" >&2
    exit 1
  fi
  if [[ ! -f "${dest}" ]]; then
    cp -p "${src}" "${dest}"
    ((guide_copied++)) || true
  fi
done
echo "Copied ${guide_copied} of ${#TEMPLATE_FILES[@]} guide/template .md files into ${TIED_DIR}."

# Copy methodology docs into tied/docs/ (referenced by AGENTS.md, ai-principles.md, processes.md).
# The agent-req-implementation-checklist.yaml is the trackable checklist; copy to a unique file per request (see its header).
mkdir -p "${TIED_DIR}/docs"
DOCS_TO_COPY=(
  "adding-tied-mcp-and-invoking-passes.md"
  "agent-req-implementation-checklist.md"
  "agent-req-implementation-checklist.yaml"
  "ai-agent-tied-mcp-usage.md"
  "impl-code-test-linkage.md"
  "implementation-order.md"
  "LEAP.md"
  "methodology-diagrams.md"
  "migration-methodology-project-yaml.md"
  "new-feature-process.md"
  "pseudocode-validation-checklist.yaml"
  "pseudocode-writing-and-validation.md"
  "tied-first-implementation-procedure.md"
  "using-tied-without-mcp.md"
)
docs_count=0
docs_total=0
for f in "${DOCS_TO_COPY[@]}"; do
  src="${SCRIPT_DIR}/docs/${f}"
  dest="${TIED_DIR}/docs/${f}"
  if [[ -f "${src}" ]]; then
    ((docs_total++)) || true
    if [[ ! -f "${dest}" ]]; then
      cp -p "${src}" "${dest}"
      ((docs_count++)) || true
    fi
  fi
done
if [[ ${docs_total} -gt 0 ]]; then
  echo "Copied ${docs_count} of ${docs_total} methodology doc(s) into ${TIED_DIR}/docs."
fi

# Copy detail-files schema (YAML detail file structure reference)
if [[ -f "${SCRIPT_DIR}/detail-files-schema.md" ]]; then
  if [[ ! -f "${TIED_DIR}/detail-files-schema.md" ]]; then
    cp -p "${SCRIPT_DIR}/detail-files-schema.md" "${TIED_DIR}/detail-files-schema.md"
    echo "Copied 1 of 1 detail-files-schema.md into ${TIED_DIR}."
  else
    echo "Skipped detail-files-schema.md (0 of 1 already present)."
  fi
fi

# --- Methodology: implementation decision detail files into tied/methodology/ (ALWAYS OVERWRITE) ---
IMPL_TEMPLATE_DIR="${TEMPLATES_DIR}/implementation-decisions"
if [[ ! -d "${IMPL_TEMPLATE_DIR}" ]]; then
  IMPL_TEMPLATE_DIR="${SCRIPT_DIR}/implementation-decisions"
fi
if [[ -d "${IMPL_TEMPLATE_DIR}" ]]; then
  impl_count=0
  impl_total=0
  for detail_file in "${IMPL_TEMPLATE_DIR}"/*.yaml; do
    if [[ -f "${detail_file}" ]]; then
      ((impl_total++)) || true
      filename="$(basename "${detail_file}")"
      cp -p "${detail_file}" "${METHODOLOGY_DIR}/implementation-decisions/${filename}"
      ((impl_count++)) || true
    fi
  done
  if [[ ${impl_total} -gt 0 ]]; then
    echo "Copied ${impl_count} of ${impl_total} methodology implementation decision(s) into ${METHODOLOGY_DIR}/implementation-decisions (overwritten)."
  fi
fi

# --- Methodology: architecture decision detail files (ALWAYS OVERWRITE) ---
ARCH_TEMPLATE_DIR="${TEMPLATES_DIR}/architecture-decisions"
if [[ ! -d "${ARCH_TEMPLATE_DIR}" ]]; then
  ARCH_TEMPLATE_DIR="${SCRIPT_DIR}/architecture-decisions"
fi
if [[ -d "${ARCH_TEMPLATE_DIR}" ]]; then
  arch_count=0
  arch_total=0
  for detail_file in "${ARCH_TEMPLATE_DIR}"/*.yaml; do
    if [[ -f "${detail_file}" ]]; then
      ((arch_total++)) || true
      filename="$(basename "${detail_file}")"
      cp -p "${detail_file}" "${METHODOLOGY_DIR}/architecture-decisions/${filename}"
      ((arch_count++)) || true
    fi
  done
  if [[ ${arch_total} -gt 0 ]]; then
    echo "Copied ${arch_count} of ${arch_total} methodology architecture decision(s) into ${METHODOLOGY_DIR}/architecture-decisions (overwritten)."
  fi
fi

# --- Methodology: requirements detail files (ALWAYS OVERWRITE) ---
REQ_TEMPLATE_DIR="${TEMPLATES_DIR}/requirements"
if [[ ! -d "${REQ_TEMPLATE_DIR}" ]]; then
  REQ_TEMPLATE_DIR="${SCRIPT_DIR}/requirements"
fi
if [[ -d "${REQ_TEMPLATE_DIR}" ]]; then
  req_count=0
  req_total=0
  for detail_file in "${REQ_TEMPLATE_DIR}"/*.yaml; do
    if [[ -f "${detail_file}" ]]; then
      ((req_total++)) || true
      filename="$(basename "${detail_file}")"
      cp -p "${detail_file}" "${METHODOLOGY_DIR}/requirements/${filename}"
      ((req_count++)) || true
    fi
  done
  if [[ ${req_total} -gt 0 ]]; then
    echo "Copied ${req_count} of ${req_total} methodology requirement(s) into ${METHODOLOGY_DIR}/requirements (overwritten)."
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
mig_copied=0
for guide in "${MIGRATION_GUIDES[@]}"; do
  src="${SCRIPT_DIR}/${guide}"
  dest="${TIED_DIR}/${guide}"
  if [[ -f "${src}" && ! -f "${dest}" ]]; then
    cp -p "${src}" "${dest}"
    ((mig_copied++)) || true
  fi
done
if [[ ${#MIGRATION_GUIDES[@]} -gt 0 ]]; then
  echo "Copied ${mig_copied} of ${#MIGRATION_GUIDES[@]} migration guides into ${TIED_DIR}."
fi