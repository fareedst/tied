#!/usr/bin/env bash

# Driver for agentstream + lead checklist (--checklist-var for placeholders). hello/1 and unitconv-cf/2a
# prepare a fresh TIED workspace (copy_files, initial commit); unitconv-general/2b reuses the same
# <name> workspace from 2a and does not copy_files or run git setup (continuation run).
#
# What “the script generated” means here
#   Not a separate shell file on disk: agentstream expands the lead checklist YAML into one Cursor-agent
#   argv per turn (dry-run prints those). Each turn is the rendered checklist step (goals, tasks, flow)
#   plus optional preload text. Quality of that output depends on which flags we pass (below).
#
# Usage:
#   scripts/tasd.sh <name> [hello|unitconv-cf|unitconv-general|1|2a|2b] [agentstream flags...]
#
# Target (optional; default hello):
#   hello | 1       — Bash hello-world (single REQ-style exercise)
#   unitconv-cf | 2a — Goal 1: Celsius/Fahrenheit converter (run once for its own R→A→I)
#   unitconv-general | 2b — Goal 2: general unit converter (second agentstream run on the *same*
#       test_path after 2a; no copy_files, git init, or commit — leaves repo as-is from Goal 1)
#
# Examples (from any cwd; paths are absolute after cd):
#   scripts/tasd.sh 0421-03
#   scripts/tasd.sh 0421-03 --dry-run
#   scripts/tasd.sh 0421-03 unitconv-cf --dry-run
#   scripts/tasd.sh 0421-03 unitconv-general --dry-run
#
# Workspace layout (fixed by this driver unless you edit it)
#   test_path=/Users/fareed/Documents/dev/test/<name>   (working copy for the agent)
#   tied_path=/Users/fareed/Documents/dev/chatgpt/stdd   (stdd repo; copy_files.sh + checklist source)
#   copy_files.sh must be run from a checkout that includes tools/bundled-tied-yaml-skill/ so
#   .cursor/skills/tied-yaml (tied-cli.sh) is installed; override tied_path= if your TIED clone is elsewhere.
#
# Built-in agentstream options (why they improve the generated turns)
#
#   --lead-checklist-yaml "$tied_path/tied/docs/agent-req-implementation-checklist.yaml"
#       Pins the canonical executable checklist (REQ implementation flow). Edits to that YAML change
#       every rendered step body—agents see session-bootstrap, translate-sponsor-intent (when FEATURE_*
#       placeholders exist), TIED gates, unit-test-red, etc., from one
#       source of truth.
#
#   --lead-checklist-skip-sub
#       agentstream normally appends each sub_procedures entry (sub-yaml-edit-loop,
#       sub-pseudocode-validation-pass, sub-leap-micro-cycle) as extra turns after traceable-commit.
#       Those subs are already meant to run when a main step says CALL <slug>. Skipping the append
#       removes ~3 duplicate turns at the end (e.g. ~26 turns vs ~29 with default subs), shortens dry-run
#       and real runs, and matches the checklist
#       guidance to treat trailing subs as no-ops unless there is new TIED work. To get the old
#       “subs as their own turns” behavior, remove this flag from the echo_exec block below (or invoke
#       agentstream yourself without --lead-checklist-skip-sub).
#
#   --checklist-var CHANGE_TITLE=… --checklist-var FEATURE_GOAL=… --checklist-var FEATURE_BEHAVIOR_SUMMARY=…
#       Substitutes {{CHANGE_TITLE}}, {{FEATURE_GOAL}}, {{FEATURE_BEHAVIOR_SUMMARY}} where the lead
#       checklist YAML defines those placeholders (see translate-sponsor-intent). Values are sponsor/raw
#       intent—not implementation prompts on their own; the checklist step frames them and requires a
#       written map to checklist phases before change-definition. Pick target hello | 1 | unitconv-cf |
#       2a | unitconv-general | 2b (positional after <name>) or extend the presets in tasd().
#
#   --prompt-file <(cat <<'…')
#       Prepended on every turn that starts a new session (see agentstream README). Reduces “do
#       everything now” drift: stay on the current checklist step, defer code until pseudo-code and RED
#       tests exist per the checklist order.
#
#   This driver does not pass --feature-spec-batch-yaml so turn 1 is the first checklist step
#   (session-bootstrap), not a separate feature batch. To add -b again, see tools/agentstream README
#   (default order puts feature-spec before checklist; --lead-checklist-before-feature puts it after).
#
# Pass-through [agentstream flags…] (after <name> and optional target)
#   Examples: --dry-run (print turns and argv, no agent), -f N -s SESSION (resume mid-batch),
#   --checklist-var-strict (fail render if any {{NAME}} left), extra --checklist-var KEY=VALUE.
#   These override or extend behavior without editing this file.
#
# agentstream binary resolution: $AGENTSTREAM if set and executable, else ~/.local/bin/agentstream,
# else PATH.

if ! command -v echo_exec >/dev/null 2>&1; then
  echo_exec() { printf '+ '; printf '%q ' "$@"; printf '\n'; "$@"; }
fi

tasd_agentstream_bin() {
  if [[ -n ${AGENTSTREAM:-} && -x $AGENTSTREAM ]]; then
    printf '%s' "$AGENTSTREAM"
    return
  fi
  local home_local="${HOME%/}/.local/bin/agentstream"
  if [[ -x "$home_local" ]]; then
    printf '%s' "$home_local"
    return
  fi
  if command -v agentstream >/dev/null 2>&1; then
    command -v agentstream
    return
  fi
  printf '%s' 'agentstream'
}

# 1: test dir name
# 2: optional target (hello|1 | unitconv-cf|2a | unitconv-general|2b); default hello
# 3+: agentstream options (e.g. --dry-run, -f 5 -s SESSION, --checklist-var-strict)
tasd () {
  [[ -z ${1:-} ]] && echo "usage: $0 <name> [hello|1|unitconv-cf|2a|unitconv-general|2b] [agentstream flags...]" >&2 && return 2
  local test_path
  local tied_path
  local name="$1"
  shift

  local target=hello
  if [[ -n ${1:-} && $1 != -* ]]; then
    case $1 in
      1)
        target=hello
        shift
        ;;
      2a)
        target=unitconv-cf
        shift
        ;;
      2b)
        target=unitconv-general
        shift
        ;;
      hello|unitconv-cf|unitconv-general)
        target=$1
        shift
        ;;
      *)
        echo "tasd: unknown target '$1' (use hello|1, unitconv-cf|2a, or unitconv-general|2b)" >&2
        return 2
        ;;
    esac
  fi

  : "${test_path:=/Users/fareed/Documents/dev/test/${name}}"
  : "${tied_path:=/Users/fareed/Documents/dev/chatgpt/stdd}"

  local _as
  _as="$(tasd_agentstream_bin)"
  if [[ $_as == agentstream ]] && ! command -v agentstream >/dev/null 2>&1; then
    echo "tasd: agentstream not found (set AGENTSTREAM, install ~/.local/bin/agentstream, or PATH)" >&2
    return 127
  fi

  # Used for --checklist-var substitution into the lead checklist YAML (translate-sponsor-intent).
  local feat_name
  local feat_goal
  local feat_behavior
  case $target in
    hello)
      feat_name='follow each step precisely'
      feat_goal='Deliver a Bash hello-world that satisfies the REQ contract.'
      feat_behavior='Script prints the expected greeting; invoked the way the REQ specifies.'
      ;;
    unitconv-cf)
      feat_name='Celsius/Fahrenheit converter'
      feat_goal='Implement a minimal converter application focused only on temperature (Celsius and Fahrenheit).'
      feat_behavior='Accept a numeric value and a source unit (C or F); output the converted value with formatting and edge-case rules defined in the REQ.'
      ;;
    unitconv-general)
      feat_name='General unit converter'
      feat_goal='Expand from temperature-only into a general unit converter supporting a small set of unit families.'
      feat_behavior='Support multiple unit families (e.g. temperature plus at least one more such as length or mass), with a clear CLI contract, input validation, and an extensible mapping approach; author as a new REQ+ARCH+IMPL set without retroactively rewriting the prior temperature-only REQ.'
      ;;
  esac

  if [[ $target == unitconv-general ]]; then
    if [[ ! -d "$test_path" ]]; then
      echo "tasd: workspace not found: $test_path (run unitconv-cf / 2a for this <name> first)" >&2
      return 2
    fi
    if ! git -C "$test_path" rev-parse --git-dir >/dev/null 2>&1; then
      echo "tasd: workspace is not a git repository: $test_path" >&2
      return 2
    fi
    cd "$test_path" || return
  else
    echo_exec \
     mkdir -p "$test_path"
    cd "$test_path" || return

    echo_exec \
     git init
    echo_exec \
     eval "$tied_path/copy_files.sh"
    echo_exec \
     git add -A
    echo_exec \
     git commit -m TIED
  fi

  echo_exec \
   "$_as" \
   -w "$test_path" \
   --lead-checklist-yaml "$tied_path/tied/docs/agent-req-implementation-checklist.yaml" \
   --lead-checklist-skip-sub \
   --checklist-var "CHANGE_TITLE=${feat_name}" \
   --checklist-var "FEATURE_GOAL=${feat_goal}" \
   --checklist-var "FEATURE_BEHAVIOR_SUMMARY=${feat_behavior}" \
   "$@" \
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
)
}

tasd "$@"
