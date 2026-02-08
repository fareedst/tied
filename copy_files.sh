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

TIED_DIR="${TARGET_PROJECT_DIR}/tied"
IMPL_DECISIONS_DIR="${TIED_DIR}/implementation-decisions"
ARCH_DECISIONS_DIR="${TIED_DIR}/architecture-decisions"
REQ_DIR="${TIED_DIR}/requirements"
mkdir -p "${TIED_DIR}"
mkdir -p "${IMPL_DECISIONS_DIR}"
mkdir -p "${ARCH_DECISIONS_DIR}"
mkdir -p "${REQ_DIR}"

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

TEMPLATE_FILES=(
  "requirements.template.md"
  "requirements.template.yaml"
  "architecture-decisions.template.md"
  "architecture-decisions.template.yaml"
  "implementation-decisions.template.md"
  "implementation-decisions.template.yaml"
  "processes.template.md"
  "semantic-tokens.template.md"
  "semantic-tokens.template.yaml"
  "tasks.template.md"
)

for template in "${TEMPLATE_FILES[@]}"; do
  src="${SCRIPT_DIR}/${template}"
  
  # Strip .template from the filename, preserving the actual extension
  base="${template%.template.*}"
  ext="${template##*.}"
  dest="${TIED_DIR}/${base}.${ext}"

  if [[ ! -f "${src}" ]]; then
    echo "Missing template file: ${src}" >&2
    exit 1
  fi

  if [[ ! -f "${dest}" ]]; then
    cp -p "${src}" "${dest}"
  fi
done

echo "Copied ${#TEMPLATE_FILES[@]} template files into ${TIED_DIR}."

# Copy implementation decision detail file examples
IMPL_TEMPLATE_DIR="${SCRIPT_DIR}/implementation-decisions.template"
if [[ -d "${IMPL_TEMPLATE_DIR}" ]]; then
  impl_count=0
  for detail_file in "${IMPL_TEMPLATE_DIR}"/*.md; do
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

# Copy architecture decision detail file examples
ARCH_TEMPLATE_DIR="${SCRIPT_DIR}/architecture-decisions.template"
if [[ -d "${ARCH_TEMPLATE_DIR}" ]]; then
  arch_count=0
  for detail_file in "${ARCH_TEMPLATE_DIR}"/*.md; do
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

# Copy requirements detail file examples
REQ_TEMPLATE_DIR="${SCRIPT_DIR}/requirements.template"
if [[ -d "${REQ_TEMPLATE_DIR}" ]]; then
  req_count=0
  for detail_file in "${REQ_TEMPLATE_DIR}"/*.md; do
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
MIGRATION_GUIDES=(
  "migrate-implementation-decisions.md"
  "migrate-architecture-decisions.md"
  "migrate-semantic-token-format.md"
  "migrate-requirements.md"
)

for guide in "${MIGRATION_GUIDES[@]}"; do
  src="${SCRIPT_DIR}/${guide}"
  dest="${TIED_DIR}/${guide}"
  if [[ -f "${src}" && ! -f "${dest}" ]]; then
    cp -p "${src}" "${dest}"
  fi
done
echo "Copied migration guides into ${TIED_DIR}."