#!/usr/bin/env bash
# Agent cwd contract: see agent-shell-working-directory.md (prompt-shared).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
# Adjust steps from SCRIPT_DIR to repository root for your script location (default: parent of script dir).
REPO_ROOT_DEFAULT="$(cd "${SCRIPT_DIR}/.." && pwd -P)"

if [[ -n "${REPO_ROOT:-}" ]]; then
  case "${REPO_ROOT}" in
    /*) ;;
    *)
      echo "DIAGNOSTIC: REPO_ROOT must be absolute, got: ${REPO_ROOT}" >&2
      exit 1
      ;;
  esac
else
  REPO_ROOT="${REPO_ROOT_DEFAULT}"
fi

# Replace before first run (example TIED store: tied-install.sh).
MARKER_REL="REPLACE_ME"

assert_repo_root() {
  if [[ "${MARKER_REL}" == "REPLACE_ME" || -z "${MARKER_REL}" ]]; then
    echo "DIAGNOSTIC: set MARKER_REL to a repo-root marker file before running this script" >&2
    exit 1
  fi
  local marker_path="${REPO_ROOT}/${MARKER_REL}"
  if [[ ! -e "${marker_path}" ]]; then
    echo "DIAGNOSTIC: repo marker missing: expected ${marker_path} (REPO_ROOT=${REPO_ROOT})" >&2
    exit 1
  fi
  cd -- "${REPO_ROOT}" || exit 1
  if [[ "$(pwd -P)" != "${REPO_ROOT}" ]]; then
    echo "DIAGNOSTIC: failed to anchor at REPO_ROOT=${REPO_ROOT} (pwd=$(pwd -P))" >&2
    exit 1
  fi
}

assert_repo_root

# --- script body below; use "${REPO_ROOT}/..." for repo-relative paths ---
