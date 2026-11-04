#!/usr/bin/env bash
# dual-harness-wf03-parity-smoke — dry argv/MCP parity checks for WF-03 Claude vs Cursor harness.
# [REQ-AGENTSTREAM_CLAUDE_WF_PARITY] [IMPL-AGENTSTREAM_CLAUDE_WF_PARITY]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd -P)"
TIED_CLI="${REPO_ROOT}/mcp-server/packages/cli/dist/index.js"
BATCH="${REPO_ROOT}/docs/demos/traditional-four-phase-agentstream.yaml"
GOLD_CLIENT="${WF03_GOLD_CLIENT:-${HOME}/Documents/dev/test/1793760220-wf-agentstream-wf-03}"

usage() {
  cat >&2 <<EOF
Usage: dual-harness-wf03-parity-smoke.sh [--dry-run-only] [--help]

  --dry-run-only   Run agentstream dry-run (Claude harness) and assert MCP argv flags (default)
  --help           This help

Env:
  WF03_GOLD_CLIENT  Optional read-only gold client for workspace (defaults under TIED_TEST_ROOT)

Manual live wf-03 parity (same MODEL_SLUG as gold):
  WORKSPACE=<disposable> MODEL_SLUG=composer-2.5-fast AGENTSTREAM_CLAUDE_LIVE_OK=1 \\
    HARNESS=claude ./scripts/workflow-trial-agentstream.sh wf-03
  Compare fingerprint to gold client at WF03_GOLD_CLIENT (tests, envelope, close_out gate).
EOF
}

DRY_ONLY=1
while (($# > 0)); do
  case "$1" in
    --dry-run-only)
      DRY_ONLY=1
      shift
      ;;
    -h | --help)
      usage
      exit 0
      ;;
    *)
      echo "ERROR: unknown argument: $1" >&2
      usage
      exit 2
      ;;
  esac
done

[[ -f "$TIED_CLI" ]] || {
  echo "ERROR: build tied CLI first: ${TIED_CLI}" >&2
  exit 2
}

workspace=""
if [[ -d "$GOLD_CLIENT" ]]; then
  workspace="$GOLD_CLIENT"
  printf 'DIAGNOSTIC: using gold client workspace (read-only): %s\n' "$workspace" >&2
else
  workspace="$(mktemp -d "${TMPDIR:-/tmp}/wf03-parity-smoke-XXXX")"
  mkdir -p "${workspace}/.cursor" "${workspace}/tied-project"
  printf 'REQ-SMOKE: {}\n' >"${workspace}/tied-project/requirements.yaml"
  cat >"${workspace}/.cursor/mcp.json" <<JSON
{"mcpServers":{"tied-yaml":{"command":"node","args":["${REPO_ROOT}/mcp-server/dist/index.js"],"env":{"TIED_CLIENT_PROJECT_PATH":"${workspace}/tied-project","TIED_CLIENT_BUNDLE_PATH":"${workspace}/tied-bundle","TIED_STORE_ROOT":"${REPO_ROOT}"}}}}
JSON
  printf 'DIAGNOSTIC: ephemeral workspace (gold client absent): %s\n' "$workspace" >&2
fi

expanded="$(mktemp -t wf03-batch)"
trap 'rm -f "$expanded"' EXIT
export HARNESS=claude
export MODEL_SLUG="${MODEL_SLUG:-composer-2.5-fast}"
export MODEL_CONFIG="${MODEL_CONFIG:-composer-2.5}"
export FEATURE_REMAINDER="WF-03 parity smoke placeholder."
export SKILL_ROOT=".claude/skills"
perl -pe '
  s/\{\{MODEL_SLUG\}\}/$ENV{MODEL_SLUG}/g;
  s/\{\{MODEL_CONFIG\}\}/$ENV{MODEL_CONFIG}/g;
  s/\{\{FEATURE_REMAINDER\}\}/$ENV{FEATURE_REMAINDER}/g;
  s/\{\{SKILL_ROOT\}\}/$ENV{SKILL_ROOT}/g;
' "$BATCH" >"$expanded"
grep -q '.claude/skills/build-plan' "$expanded" || {
  echo "ERROR: batch expansion missing .claude/skills paths" >&2
  exit 1
}

out="$(mktemp -t wf03-dry-out)"
node "$TIED_CLI" agentstream -d -w "$workspace" --harness claude --model "$MODEL_SLUG" \
  -y --skip-tied-mcp-preflight -b "$expanded" >"$out"

if ! grep -q '\-\-strict-mcp-config' "$out" || ! grep -q '\-\-mcp-config' "$out"; then
  echo "ERROR: Claude dry-run argv missing MCP flags" >&2
  head -c 2000 "$out" >&2 || true
  exit 1
fi

printf 'DEBUG: dual-harness wf-03 dry smoke OK (MCP flags present)\n' >&2
exit 0
