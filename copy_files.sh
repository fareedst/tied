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
#   - tied/methodology/: index YAMLs and inherited detail files (always overwritten)
#   - tied/: project index YAMLs and requirements/, architecture-decisions/, implementation-decisions/ (create if missing, never overwrite)
#   - Guide .md and tied/docs/ (copy when missing). `processes.md` for new clients comes from
#     templates/processes.md (TIED-distributed template); the other four guides come from
#     tied/ in the TIED source. In a TIED source checkout, tied/processes.md is the live
#     repo file and is not the bootstrap source. `tied-yaml-agent-index.md` is post-processed
#     so links resolve from tied/docs/ (see sed block in the DOCS_TO_COPY loop).
#   - .cursor/skills/tied-yaml/: Cursor Agent Skill for REQ/ARCH/IMPL YAML via tied-cli.sh
#     (from .cursor/ if present, else from tools/bundled-tied-yaml-skill; overwritten each run).
#     No .cursor/mcp.json is created or modified; use tied-cli + TIED_MCP_BIN to invoke the server.
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

HOOKS_JSON="${TARGET_PROJECT_DIR}/.cursor/hooks.json"

if [[ -f "${SCRIPT_DIR}/.cursor/hooks.json" ]]; then
  mkdir -p "${CURSOR_DIR}"
  cp "${SCRIPT_DIR}/.cursor/hooks.json" "$HOOKS_JSON"
  sed -i '' "s|${SCRIPT_DIR}/.cursor/logs|${TARGET_PROJECT_DIR}/.cursor/logs|g" "$HOOKS_JSON"
fi

# --- Cursor Agent Skill: tied-yaml (CLI to MCP server; no mcp.json) ---
# Prefer .cursor/skills/tied-yaml (dev checkout); else tools/bundled-tied-yaml-skill (always in git) so
# copy_files always installs .cursor/skills/tied-yaml/.../tied-cli.sh for client projects.
TIED_YAML_SKILL_PREFERRED="${SCRIPT_DIR}/.cursor/skills/tied-yaml"
TIED_YAML_SKILL_BUNDLED="${SCRIPT_DIR}/tools/bundled-tied-yaml-skill"
TIED_YAML_SKILL_DEST="${CURSOR_DIR}/skills/tied-yaml"
install_tied_yaml_skill() {
  local _src="$1"
  mkdir -p "${CURSOR_DIR}/skills"
  rm -rf "${TIED_YAML_SKILL_DEST}"
  cp -R "${_src}" "${TIED_YAML_SKILL_DEST}"
  chmod -R a+rX "${TIED_YAML_SKILL_DEST}"
  if [[ -f "${TIED_YAML_SKILL_DEST}/scripts/tied-cli.sh" ]]; then
    chmod a+x "${TIED_YAML_SKILL_DEST}/scripts/tied-cli.sh"
  fi
  echo "Copied tied-yaml Cursor skill into ${TIED_YAML_SKILL_DEST} (from ${_src})."
}
if [[ -d "${TIED_YAML_SKILL_PREFERRED}" ]]; then
  install_tied_yaml_skill "${TIED_YAML_SKILL_PREFERRED}"
elif [[ -d "${TIED_YAML_SKILL_BUNDLED}" ]]; then
  install_tied_yaml_skill "${TIED_YAML_SKILL_BUNDLED}"
else
  echo "ERROR: tied-yaml skill not found. Expected one of:" >&2
  echo "  ${TIED_YAML_SKILL_PREFERRED}  (full Cursor skill in TIED source)" >&2
  echo "  ${TIED_YAML_SKILL_BUNDLED}  (bundled copy; use a complete TIED repository checkout)" >&2
  echo "Recovery: re-run this script from a TIED tree that includes tools/bundled-tied-yaml-skill/, or" >&2
  echo "  copy a tied-yaml skill into .cursor/skills/ manually, then re-run:" >&2
  echo "  cp -R <TIED_repo>/tools/bundled-tied-yaml-skill .cursor/skills/tied-yaml" >&2
  echo "TIED project YAML: use a built mcp-server dist/index.js with TIED_MCP_BIN and" >&2
  echo "  TIED_BASE_PATH, or follow tied/docs/using-tied-without-mcp.md for the manual workflow." >&2
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
    echo "Missing base file: ${src}" >&2
    exit 1
  fi

  if [[ ! -f "${dest}" ]]; then
    cp -p "${src}" "${dest}"
    ((base_copied++)) || true
  fi
done
echo "Copied ${base_copied} of ${#BASE_FILES[@]} base files into ${TARGET_PROJECT_DIR}."

# Core methodology (inherited LEAP R+A+I) lives in templates/; the four non-process guides are
# canonical in tied/ in the TIED source. Client bootstrap for processes.md is templates/processes.md.
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

# Guide .md: copy from TIED source (tied/ for four guides, templates/ for processes.md) into
# client tied/ when missing (client may customize).
TEMPLATE_FILES=(
  "requirements.md"
  "architecture-decisions.md"
  "implementation-decisions.md"
  "processes.md"
  "semantic-tokens.md"
)
guide_copied=0
for f in "${TEMPLATE_FILES[@]}"; do
  if [[ "${f}" == "processes.md" ]]; then
    src="${TEMPLATES_DIR}/${f}"
  else
    src="${TIED_SOURCE_DIR}/${f}"
  fi
  dest="${TIED_DIR}/${f}"
  if [[ ! -f "${src}" ]]; then
    if [[ "${f}" == "processes.md" ]]; then
      echo "Missing template file (TIED source templates/processes.md for client bootstrap): ${src}" >&2
    else
      echo "Missing template file (canonical in TIED repo tied/): ${src}" >&2
    fi
    exit 1
  fi
  if [[ ! -f "${dest}" ]]; then
    cp -p "${src}" "${dest}"
    ((guide_copied++)) || true
  fi
done
echo "Copied ${guide_copied} of ${#TEMPLATE_FILES[@]} guide/template .md files into ${TIED_DIR}."

# Copy methodology docs into client tied/docs/ from canonical TIED source tied/docs/ (referenced by AGENTS.md, processes.md).
# The agent-req-implementation-checklist.yaml is the trackable checklist; copy to a unique file per request (see its header).
# CITDP paths in that checklist refer to the client project's tied/citdp/ (client workspace root), not the TIED source repo path.
mkdir -p "${TIED_DIR}/docs"
DOCS_TO_COPY=(
  "adding-tied-mcp-and-invoking-passes.md"
  "ai-principles.md"
  "agent-req-implementation-checklist.md"
  "citdp-policy.md"
  "citdp-record-template.yaml"
  "commit-guidelines.md"
  "agent-req-implementation-checklist.yaml"
  "ai-agent-tied-mcp-usage.md"
  "yaml-update-mcp-runbook.md"
  "impl-code-test-linkage.md"
  "implementation-order.md"
  "LEAP.md"
  "methodology-diagrams.md"
  "new-feature-process.md"
  "pseudocode-validation-checklist.yaml"
  "pseudocode-writing-and-validation.md"
  "req-impl-state-guide-agent-workflow.md"
  "requirement-list-state-guide-agent-workflow.md"
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
    echo "Missing methodology doc (canonical in TIED repo tied/docs/): ${src}" >&2
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
  echo "Copied ${docs_count} of ${docs_total} methodology doc(s) into ${TIED_DIR}/docs."
fi

# Copy detail-files schema (YAML detail file structure reference) from canonical tied/ in TIED source.
if [[ -f "${TIED_SOURCE_DIR}/detail-files-schema.md" ]]; then
  if [[ ! -f "${TIED_DIR}/detail-files-schema.md" ]]; then
    cp -p "${TIED_SOURCE_DIR}/detail-files-schema.md" "${TIED_DIR}/detail-files-schema.md"
    echo "Copied 1 of 1 detail-files-schema.md into ${TIED_DIR}."
  else
    echo "Skipped detail-files-schema.md (0 of 1 already present)."
  fi
else
  echo "Missing: ${TIED_SOURCE_DIR}/detail-files-schema.md" >&2
  exit 1
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
shopt -u nullglob
