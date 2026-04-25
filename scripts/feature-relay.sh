#!/usr/bin/env bash
#
# feature-relay — Run agentstream with the lead REQ implementation checklist and
# three sponsor placeholders (CHANGE_TITLE, FEATURE_GOAL, FEATURE_BEHAVIOR_SUMMARY).
#
# Usage:
#   ./scripts/feature-relay.sh CHANGE_TITLE FEATURE_GOAL FEATURE_BEHAVIOR_SUMMARY [agentstream args...]
#   printf '...' | ./scripts/feature-relay.sh CHANGE_TITLE FEATURE_GOAL - [agentstream args...]
#
# If the third argument is exactly "-", the behavior summary is read from stdin.
# All arguments after the first three are passed through to agentstream (e.g. --dry-run).
#
# Environment:
#   test_path  Workspace for agentstream -w (default: .)
#   tied_path  Repository root that contains tied/ and mcp-server/ (default: stdd root next to this script)
#   AGENTSTREAM  If set, path to a prebuilt agentstream executable; else: go run tools/agentstream
#
# IMPL: IMPL-GOAGENT-CLI-CMD
# REQ: REQ-GOAGENT-CLI-CONFIG
##

set -o errexit
set -o nounset
set -o pipefail

_script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
_repo_root="$(cd "${_script_dir}/.." && pwd)"

: "${test_path:=.}"
: "${tied_path:=$_repo_root}"
: "${AGENTSTREAM:=agentstream}"

LEAD_CHECKLIST_YAML="${tied_path}/tied/docs/agent-req-implementation-checklist.yaml"

usage() {
  cat <<'EOF'
Usage:
  feature-relay.sh CHANGE_TITLE FEATURE_GOAL FEATURE_BEHAVIOR_OR_DASH [agentstream args...]

  Third argument: feature behavior summary string, or "-" to read the summary from stdin.

  Examples:
    ./scripts/feature-relay.sh "My feature" "goal text" "behavior summary" --dry-run
    printf 'long\nbehavior' | ./scripts/feature-relay.sh "My feature" "goal" - -w /path/ws

Environment (optional):
  test_path   Workspace for -w (default: .)
  tied_path   Stdd-style repo root with tied/ and mcp-server/ (default: parent of scripts/)
  AGENTSTREAM  Path to agentstream binary; if unset, uses: go run -C <repo>/tools/agentstream ./cmd/agentstream
EOF
}

fail() {
  printf 'feature-relay: %s\n' "$1" >&2
  exit "${2:-2}"
}

if [[ $# -lt 3 ]]; then
  usage >&2
  fail "expected at least 3 arguments (CHANGE_TITLE, FEATURE_GOAL, FEATURE_BEHAVIOR_OR_DASH)"
fi

CHANGE_TITLE=$1
FEATURE_GOAL=$2
FEATURE_BEHAVIOR=$3
shift 3

if [[ "$FEATURE_BEHAVIOR" == - ]]; then
  # Slurp full stdin (optionally multiline) for the behavior summary.
  FEATURE_BEHAVIOR=$(cat)
fi

[[ -f "$LEAD_CHECKLIST_YAML" && -r "$LEAD_CHECKLIST_YAML" ]] || \
  fail "lead checklist not found or not readable: $LEAD_CHECKLIST_YAML"
[[ -d "$test_path" ]] || fail "test_path is not a directory: $test_path"

_as_cmd=("$AGENTSTREAM")

# DEBUG: show resolved paths
printf 'DEBUG: feature-relay tied_path=%s test_path=%s lead=%s\n' \
  "$tied_path" "$test_path" "$LEAD_CHECKLIST_YAML" >&2

# Process substitution is fine for --prompt-file; parameter expansion in unquoted heredoc end tag
echo_exec exec "${_as_cmd[@]}" \
  -w "$test_path" \
  --lead-checklist-yaml "$LEAD_CHECKLIST_YAML" \
  --checklist-var "CHANGE_TITLE=$CHANGE_TITLE" \
  --checklist-var "FEATURE_GOAL=$FEATURE_GOAL" \
  --checklist-var "FEATURE_BEHAVIOR_SUMMARY=$FEATURE_BEHAVIOR" \
  --prompt-file <(cat <<EOF
**AGENT DIRECTION**

**PIPELINE / TURN ORDER:** This driver uses **lead checklist only** (no --feature-spec-batch-yaml). **Turn 1** is \`session-bootstrap\` — read-only orientation (governing docs and TIED skill; **no** deliverable scripts or tests). **Turn 2** is \`translate-sponsor-intent\` — map FEATURE_* sponsor wording to checklist phases (planning prose only). Do **not** create or modify implementation files until the **rendered checklist step** for that turn explicitly requires it (e.g. unit-test-red / unit-test-green).

**unit-test-red reminder:** Authoritative rules are in the rendered \`unit-test-red\` step. In short: **Pattern A** — tests only, no new files under production roots in IMPL \`code_locations\` (use doubles / dynamic import / test helpers); **Pattern B** — minimal shim module only at a path already in \`code_locations\`, stub exports only (wrong values / throws / not implemented), not REQ-satisfying behavior (**unit-test-green** adds real behavior).

you are executing steps comprising a checklist.
do not investigate the checklist.
you will focus on the portion of the checklist that the current prompt represents.

LIMIT YOUR ACTIONS TO THE OPERATIONS SPECIFICALLY REQUESTED IN THE CURRENT STEP.
YOU WILL BE GUIDED THROUGH ALL STEPS AND YOU MUST NOT ALLOW DEVELOPMENT BEYOND THE CURRENT REQUEST.
in particular, **CODE IS DESIGNED AND WRITTEN ACCORDING TO PSEUDO-CODE AND TESTS** both exist.

YOU WILL BE TOLD TO WRITE CODE ACCORDING TO PSEUDO-CODE.

YOU CAN WRITE CODE ONLY WHEN DETAILED AND VALIDATED PSEUDO-CODE AND RED TESTS EXIST.
IN A FUTURE REQUEST, YOU WILL BE DIRECTED TO WRITE THE PSEUDO-CODE.

Agentstream is located at ~/.local/bin/agentstream.

TIED_MCP_BIN=${tied_path}/mcp-server/dist/index.js
EOF
) \
  "$@"
