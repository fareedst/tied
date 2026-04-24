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
#   - Base files (.cursorrules, AGENTS.md) in project root
#     (created only if missing; never overwritten. To pick up a newer TIED `AGENTS.md`, delete
#     or replace it, then re-run, or copy from the TIED source by hand)
#   - tied/methodology/: index YAMLs and inherited detail files (always overwritten)
#   - tied/: project index YAMLs and requirements/, architecture-decisions/, implementation-decisions/ (create if missing, never overwrite)
#   - Guide .md and tied/docs/ (copy when missing; never overwrite an existing `tied/docs/*.md`).
#     Core guides and schema come from tied/docs/ in the TIED source.
#     `tied-yaml-agent-index.md` is post-processed
#     so links resolve from tied/docs/ (see sed block in the DOCS_TO_COPY loop).
#   - .cursor/skills/tied-yaml/: Cursor Agent Skill for REQ/ARCH/IMPL YAML via tied-cli.sh
#     (from .cursor/ if complete—includes scripts/tied-cli.sh—else from tools/bundled-tied-yaml-skill; overwritten each run).
#   - Canonical CLI: .cursor/skills/tied-yaml/scripts/tied-cli.sh (use `tree -a` to list .cursor/ or open in the IDE).
#   - .cursor/mcp.json: (re)writes mcpServers.tied-yaml with stdio, absolute paths to this TIED
#     repo's mcp-server/dist/index.js and the target project's tied/; preserves other mcpServers
#     keys. Fails if mcp-server/dist/index.js is not built. After bootstrap, in Cursor you may
#     run: agent enable tied-yaml — approve; type quit to exit the Agent CLI.
#
# Designed for macOS (Bash 3.2+) and Ubuntu (Bash 5.x+).
#
# Usage:
#   ./copy_files.sh /path/to/project
#   ./copy_files.sh            # copies into the current working directory

set -euo pipefail

# Terminal colors (NO_COLOR or non-TTY disables them)
C_OK="" C_WARN="" C_ERR="" C_RESET=""
if [[ -z "${NO_COLOR:-}" ]] && [[ -t 1 ]]; then
  C_OK=$'\e[0;32m'
  C_WARN=$'\e[0;33m'
  C_ERR=$'\e[0;31m'
  C_RESET=$'\e[0m'
fi
say_ok()  { printf '%b%s%b\n'  "${C_OK}"   "$1" "${C_RESET}"; }
say_warn(){ printf '%b%s%b\n'  "${C_WARN}" "$1" "${C_RESET}"; }
say_err() { printf '%b%s%b\n'  "${C_ERR}"  "$1" "${C_RESET}" >&2; }
# Green only when all items in a client-owned group are new; else yellow.
say_x_of_y_client() {
  local _x="$1" _y="$2" _msg="$3"
  if [[ "${_y}" -gt 0 ]] && [[ "${_x}" -eq "${_y}" ]]; then
    say_ok "${_msg}"
  else
    say_warn "${_msg}"
  fi
}

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TARGET_PROJECT_DIR="${1:-$(pwd)}"

if [[ ! -d "${TARGET_PROJECT_DIR}" ]]; then
  say_err "Target project directory does not exist: ${TARGET_PROJECT_DIR}"
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

# Portable real path (macOS has no realpath(1) by default)
_realpath() {
  python3 -c "import os, sys; print(os.path.realpath(sys.argv[1]))" "$1"
}

MCP_SERVER_DIST="${SCRIPT_DIR}/mcp-server/dist/index.js"
if [[ ! -f "${MCP_SERVER_DIST}" ]]; then
  say_err "Missing built MCP server: ${MCP_SERVER_DIST}"
  say_err "Build it: cd ${SCRIPT_DIR}/mcp-server && npm install && npm run build"
  exit 1
fi
TIED_SERVER_PATH="$(_realpath "${MCP_SERVER_DIST}")"
TIED_BASE_PATH_VALUE="$(_realpath "${TIED_DIR}")"
MCP_JSON="${CURSOR_DIR}/mcp.json"

_refresh_tied_mcp_json() {
  MCP_JSON_PATH="${MCP_JSON}" TIED_MCP_INDEX_JS="${TIED_SERVER_PATH}" TIED_BASE_PATH_VAL="${TIED_BASE_PATH_VALUE}" \
    python3 -c '
import json, os, sys
mcp = os.environ["MCP_JSON_PATH"]
js = os.environ["TIED_MCP_INDEX_JS"]
base = os.environ["TIED_BASE_PATH_VAL"]
entry = {
    "type": "stdio",
    "disabled": False,
    "command": "node",
    "args": [js],
    "env": {"TIED_BASE_PATH": base},
}
if os.path.exists(mcp):
    try:
        with open(mcp, encoding="utf-8") as f:
            cfg = json.load(f)
    except json.JSONDecodeError as e:
        print(f"Invalid JSON in {mcp}: {e}", file=sys.stderr)
        sys.exit(1)
    if not isinstance(cfg, dict):
        cfg = {}
    serv = cfg.get("mcpServers")
    if not isinstance(serv, dict):
        serv = {}
    cfg["mcpServers"] = serv
    cfg["mcpServers"]["tied-yaml"] = entry
else:
    cfg = {"mcpServers": {"tied-yaml": entry}}
parent = os.path.dirname(mcp)
if parent:
    os.makedirs(parent, exist_ok=True)
with open(mcp, "w", encoding="utf-8") as f:
    json.dump(cfg, f, indent=2)
    f.write("\n")
' || exit 1
}

HOOKS_JSON="${TARGET_PROJECT_DIR}/.cursor/hooks.json"

if [[ -f "${SCRIPT_DIR}/.cursor/hooks.json" ]]; then
  mkdir -p "${CURSOR_DIR}"
  cp "${SCRIPT_DIR}/.cursor/hooks.json" "$HOOKS_JSON"
  sed -i '' "s|${SCRIPT_DIR}/.cursor/logs|${TARGET_PROJECT_DIR}/.cursor/logs|g" "$HOOKS_JSON"
fi

mkdir -p "${CURSOR_DIR}"
_refresh_tied_mcp_json
say_ok "Refreshed ${MCP_JSON} mcpServers.tied-yaml (TIED_MCP dist + project TIED_BASE_PATH)."

# --- Cursor Agent Skill: tied-yaml (CLI; MCP config is refreshed above) ---
# Prefer .cursor/skills/tied-yaml when it is a *complete* skill (includes scripts/tied-cli.sh).
# A partial dev checkout may contain only SKILL.md; in that case use tools/bundled-tied-yaml-skill
# (always in git) so copy_files always installs tied-cli and the stdio client for client projects.
TIED_YAML_SKILL_PREFERRED="${SCRIPT_DIR}/.cursor/skills/tied-yaml"
TIED_YAML_SKILL_BUNDLED="${SCRIPT_DIR}/tools/bundled-tied-yaml-skill"
TIED_YAML_SKILL_DEST="${CURSOR_DIR}/skills/tied-yaml"
tied_yaml_skill_is_complete() {
  [[ -f "$1/scripts/tied-cli.sh" ]]
}
install_tied_yaml_skill() {
  local _src="$1"
  mkdir -p "${CURSOR_DIR}/skills"
  rm -rf "${TIED_YAML_SKILL_DEST}"
  cp -R "${_src}" "${TIED_YAML_SKILL_DEST}"
  chmod -R a+rX "${TIED_YAML_SKILL_DEST}"
  if [[ -f "${TIED_YAML_SKILL_DEST}/scripts/tied-cli.sh" ]]; then
    chmod a+x "${TIED_YAML_SKILL_DEST}/scripts/tied-cli.sh"
  fi
  say_warn "Copied tied-yaml Cursor skill into ${TIED_YAML_SKILL_DEST} (from ${_src})."
}
if tied_yaml_skill_is_complete "${TIED_YAML_SKILL_PREFERRED}"; then
  install_tied_yaml_skill "${TIED_YAML_SKILL_PREFERRED}"
elif tied_yaml_skill_is_complete "${TIED_YAML_SKILL_BUNDLED}"; then
  if [[ -d "${TIED_YAML_SKILL_PREFERRED}" ]] && ! tied_yaml_skill_is_complete "${TIED_YAML_SKILL_PREFERRED}"; then
    say_warn "Partial tied-yaml at ${TIED_YAML_SKILL_PREFERRED} (missing scripts/tied-cli.sh); using bundled ${TIED_YAML_SKILL_BUNDLED}."
  fi
  install_tied_yaml_skill "${TIED_YAML_SKILL_BUNDLED}"
else
  say_err "ERROR: tied-yaml skill not found or incomplete. Need scripts/tied-cli.sh in one of:"
  say_err "  ${TIED_YAML_SKILL_PREFERRED}  (full Cursor skill in TIED source)"
  say_err "  ${TIED_YAML_SKILL_BUNDLED}  (bundled copy; use a complete TIED repository checkout)"
  say_err "Recovery: re-run this script from a TIED tree that includes tools/bundled-tied-yaml-skill/, or"
  say_err "  copy a tied-yaml skill into .cursor/skills/ manually, then re-run:"
  say_err "  cp -R <TIED_repo>/tools/bundled-tied-yaml-skill .cursor/skills/tied-yaml"
  say_err "TIED project YAML: use a built mcp-server dist/index.js with TIED_MCP_BIN and"
  say_err "  TIED_BASE_PATH, or follow tied/docs/using-tied-without-mcp.md for the manual workflow."
  exit 1
fi

BASE_FILES=(
  ".cursorrules"
  "AGENTS.md"
)

base_copied=0
for template in "${BASE_FILES[@]}"; do
  src="${SCRIPT_DIR}/${template}"
  dest="${TARGET_PROJECT_DIR}/${template}"

  if [[ ! -f "${src}" ]]; then
    say_err "Missing base file: ${src}"
    exit 1
  fi

  if [[ ! -f "${dest}" ]]; then
    cp -p "${src}" "${dest}"
    ((base_copied++)) || true
  fi
done
say_x_of_y_client "${base_copied}" "${#BASE_FILES[@]}" "Copied ${base_copied} of ${#BASE_FILES[@]} base files into ${TARGET_PROJECT_DIR}."

# Core methodology (inherited LEAP R+A+I) lives in templates/; guide markdown and reference docs
# are canonical in tied/docs/ in the TIED source.
TEMPLATES_DIR="${SCRIPT_DIR}/templates"
TIED_SOURCE_DIR="${SCRIPT_DIR}/tied"
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
    say_err "Missing index file: ${src}"
    exit 1
  fi
  cp -p "${src}" "${METHODOLOGY_DIR}/${f}"
  ((index_yaml_copied++)) || true
done
say_warn "Copied ${index_yaml_copied} of ${#INDEX_YAML_FILES[@]} methodology index YAMLs into ${METHODOLOGY_DIR} (overwritten)."

# --- Project: ensure project index YAMLs exist (CREATE IF MISSING, never overwrite) ---
project_created=0
for f in "${INDEX_YAML_FILES[@]}"; do
  dest="${TIED_DIR}/${f}"
  if [[ ! -f "${dest}" ]]; then
    printf '# Project %s - add project-specific tokens here. Do not edit tied/methodology/.\n{}\n' "${f}" > "${dest}"
    say_ok "Created project index ${dest} (empty)."
    ((project_created++)) || true
  fi
done
say_x_of_y_client "${project_created}" "${#INDEX_YAML_FILES[@]}" "Created ${project_created} of ${#INDEX_YAML_FILES[@]} project index file(s) (rest already existed)."

# Copy methodology docs into client tied/docs/ from canonical TIED source tied/docs/ (referenced by AGENTS.md, processes.md).
# The agent-req-implementation-checklist.yaml is the trackable checklist; copy to a unique file per request (see its header).
# CITDP paths in that checklist refer to the client project's tied/citdp/ (client workspace root), not the TIED source repo path.
mkdir -p "${TIED_DIR}/docs"
DOCS_TO_COPY=(
  "adding-tied-mcp-and-invoking-passes.md"
  "agent-preload-contract-template.yaml"
  "ai-principles.md"
  "agent-req-implementation-checklist.md"
  "architecture-decisions.md"
  "citdp-policy.md"
  "citdp-record-template.yaml"
  "commit-guidelines.md"
  "detail-files-schema.md"
  "agent-req-implementation-checklist.yaml"
  "ai-agent-tied-mcp-usage.md"
  "yaml-update-mcp-runbook.md"
  "impl-code-test-linkage.md"
  "impl-essence-pseudocode-mcp-workflow.md"
  "implementation-decisions.md"
  "implementation-order.md"
  "LEAP.md"
  "methodology-diagrams.md"
  "new-feature-process.md"
  "processes.md"
  "pseudocode-validation-checklist.yaml"
  "pseudocode-writing-and-validation.md"
  "req-impl-state-guide-agent-workflow.md"
  "requirement-list-state-guide-agent-workflow.md"
  "requirements.md"
  "semantic-tokens.md"
  "tied-first-implementation-procedure.md"
  "tied-yaml-agent-index.md"
  "using-tied-without-mcp.md"
)
docs_count=0
docs_total=0
for f in "${DOCS_TO_COPY[@]}"; do
  src="${TIED_SOURCE_DIR}/docs/${f}"
  dest="${TIED_DIR}/docs/${f}"
  if [[ ! -f "${src}" ]]; then
    say_err "Missing methodology doc (canonical in TIED repo tied/docs/): ${src}"
    exit 1
  fi
  ((docs_total++)) || true
  if [[ ! -f "${dest}" ]]; then
    cp -p "${src}" "${dest}"
    # For client copy: post-process index links for paths that assume repo-root layout.
    if [[ "${f}" == "tied-yaml-agent-index.md" ]]; then
      # Regenerate: edit canonical ${SCRIPT_DIR}/tied/docs/tied-yaml-agent-index.md, then re-run this script; sed normalizes for client.
      _tied_yaml_idx_tmp="${dest}.tmp.$$"
      sed \
        -e 's|](\.\./tied/docs/using-tied-without-mcp\.md)|](./using-tied-without-mcp.md)|g' \
        -e 's|](\.\./tied/|](../|g' \
        -e 's|](\.\./\.cursor/|](../../.cursor/|g' \
        -e 's|](\.\./AGENTS\.md)|](../../AGENTS.md)|g' \
        -e 's|](\.\./mcp-server/|](../../mcp-server/|g' \
        "${dest}" > "${_tied_yaml_idx_tmp}" && mv "${_tied_yaml_idx_tmp}" "${dest}"
    fi
    ((docs_count++)) || true
  fi
done
if [[ ${docs_total} -gt 0 ]]; then
  say_x_of_y_client "${docs_count}" "${docs_total}" "Copied ${docs_count} of ${docs_total} methodology doc(s) into ${TIED_DIR}/docs."
fi

# --- Methodology: implementation decision detail files into tied/methodology/ (ALWAYS OVERWRITE) ---
# Empty template subdirs: without nullglob, bash may pass a literal *.yaml path.
shopt -s nullglob
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
    say_warn "Copied ${impl_count} of ${impl_total} methodology implementation decision(s) into ${METHODOLOGY_DIR}/implementation-decisions (overwritten)."
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
    say_warn "Copied ${arch_count} of ${arch_total} methodology architecture decision(s) into ${METHODOLOGY_DIR}/architecture-decisions (overwritten)."
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
    say_warn "Copied ${req_count} of ${req_total} methodology requirement(s) into ${METHODOLOGY_DIR}/requirements (overwritten)."
  fi
fi
shopt -u nullglob
