#!/usr/bin/env bash
#
# build-workspace.sh — install and build the TIED store workspace (mcp-server + bootstrap).
#
# macOS / Linux / Git Bash: run from repo root:
#   ./build-workspace.sh
#
# Default shell on macOS is zsh — that is fine. This file is bash; the kernel runs bash
# via the shebang above. From zsh you can also use:
#   ./build-workspace.sh
#   bash build-workspace.sh
#   ./build-workspace.zsh    (thin wrapper, same behavior)
#
# Equivalent: build-workspace.ps1 (Windows PowerShell), build-workspace.cmd (cmd → ps1).
#
# [IMPL-TIED_WORKSPACE_BUILD_ENTRY] [REQ-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_STORE_README_CERTIFIABLE_ONBOARDING]
#
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
MCP_DIR="${ROOT}/mcp-server"
BOOTSTRAP_DIR="${ROOT}/tools/bootstrap"

# --- ANSI (respect NO_COLOR and non-TTY) ---
if [[ -t 1 && -z "${NO_COLOR:-}" ]]; then
  _R=$'\033[0m'
  _B=$'\033[1m'
  _D=$'\033[2m'
  _CY=$'\033[36m'
  _GN=$'\033[32m'
  _YL=$'\033[33m'
  _RD=$'\033[31m'
else
  _R= _B= _D= _CY= _GN= _YL= _RD=
fi

_hr() { printf '%s\n' "${_D}────────────────────────────────────────────────────────${_R}"; }
_step() { printf '%s\n' "${_B}${_CY}▶${_R} ${_B}$*${_R}"; }
_ok() { printf '  %s %s\n' "${_GN}✓${_R}" "$*"; }
_warn() { printf '%s\n' "${_YL}WARN:${_R} $*" >&2; }

_die() {
  local msg=$1
  shift
  printf '\n%s %s\n' "${_RD}ERROR:${_R}" "$msg" >&2
  if (($# > 0)); then
    printf '%s\n' "${_B}Hints:${_R}" >&2
    local hint
    for hint in "$@"; do
      printf '  • %s\n' "$hint" >&2
    done
  fi
  _hr >&2
  exit 1
}

_run_in() {
  local dir=$1
  shift
  (cd "$dir" && "$@")
}

# --- Help / argv (before store preconditions) ---
if [[ $# -eq 1 && ( "$1" == "-h" || "$1" == "--help" ) ]]; then
  if ! command -v node >/dev/null 2>&1; then
    echo "ERROR: Node.js is required but was not found on PATH." >&2
    exit 1
  fi
  exec node "${ROOT}/tools/bootstrap/build-workspace-help-cli.mjs"
fi
if [[ $# -gt 0 ]]; then
  _die "Unexpected argument(s): $*" \
    "Run ./build-workspace.sh --help for usage."
fi

# --- Preconditions ---
if [[ ! -d "$MCP_DIR" || ! -f "$MCP_DIR/package.json" ]]; then
  _die "Not a TIED store root (missing mcp-server/package.json)." \
    "Run this script from the TIED repository root (the directory that contains build-workspace.sh)." \
    "If you cloned the repo, cd into the clone first."
fi

if ! command -v node >/dev/null 2>&1; then
  _die "Node.js is not on PATH." \
    "Install Node.js 18 or newer (https://nodejs.org/ or your package manager)." \
    "On macOS with Homebrew: brew install node" \
    "Verify: node -v && npm -v"
fi

if ! command -v npm >/dev/null 2>&1; then
  _die "npm is not on PATH (expected with Node.js)." \
    "Reinstall Node.js or ensure npm is on PATH." \
    "Verify: which npm"
fi

printf '\n%s TIED workspace build %s\n' "${_B}" "${_R}"
printf '%s\n' "${_D}Repo: ${ROOT}${_R}"
_hr

# --- Step 1: mcp-server workspace ---
_step "Step 1/2 — mcp-server (npm install + npm run build)"
printf '%s\n' "${_D}  Produces: mcp-server/dist/index.js, @tied/cli, @tied/agentstream${_R}"

if ! _run_in "$MCP_DIR" npm install; then
  _die "npm install failed in mcp-server/." \
    "Check Node version: node -v (need 18+)." \
    "Network or registry issues: retry; check proxy/npm config (npm config get registry)." \
    "Corrupt install: rm -rf mcp-server/node_modules && ./build-workspace.sh" \
    "Do not use sudo with npm in the project tree."
fi
_ok "mcp-server dependencies installed"

if ! _run_in "$MCP_DIR" npm run build; then
  _die "npm run build failed in mcp-server/." \
    "Read the TypeScript/compiler errors above." \
    "Try: cd mcp-server && npm run build 2>&1 | tail -50" \
    "Ensure disk space and file permissions on mcp-server/."
fi
_ok "mcp-server build complete"

if [[ ! -f "${MCP_DIR}/dist/index.js" ]]; then
  _warn "Build succeeded but mcp-server/dist/index.js is missing — tied-install and MCP may fail."
fi

# --- Step 2: bootstrap ---
_step "Step 2/2 — tools/bootstrap (npm install)"
printf '%s\n' "${_D}  Produces: js-yaml for tied-install verification gates${_R}"

if [[ ! -d "$BOOTSTRAP_DIR" ]]; then
  _die "Missing tools/bootstrap/." \
    "Use a full TIED store checkout, not a partial export."
fi

if ! _run_in "$BOOTSTRAP_DIR" npm install; then
  _die "npm install failed in tools/bootstrap/." \
    "Same fixes as mcp-server: Node 18+, network, rm -rf tools/bootstrap/node_modules and retry." \
    "Bootstrap is required before ./tied-install.sh succeeds."
fi
_ok "bootstrap dependencies installed"

_hr
printf '%s\n' "${_B}${_GN}Workspace build finished.${_R}"
printf '%s\n' "${_D}Next: ./tied-install.sh /path/to/client  or  source scripts/build-commands.sh && test-new-tied-client${_R}"
printf '%s\n' "${_D}Sourced helpers: source scripts/build-commands.sh  →  build-mcp (mcp-server only)${_R}"
printf '\n'
