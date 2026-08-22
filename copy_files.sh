#!/usr/bin/env bash
#
# [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP] [IMPL-TIED_VOCABULARY_REFRESH] [ARCH-TIED_VOCABULARY_LAYERS] [REQ-TIED_VOCABULARY_OWNERSHIP]
# How: Bootstrap client tied/ layout, refresh the methodology vocabulary snapshot, preserve the client vocabulary layer, install the tied-yaml skill, and conditionally initialize MCP configuration.
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
#   - tied/methodology/: index YAMLs, inherited detail files, and methodology vocabulary (always overwritten)
#   - tied/: project index YAMLs and requirements/, architecture-decisions/, implementation-decisions/ (create if missing, never overwrite)
#   - Guide .md and tied/docs/ (copy when missing; never overwrite an existing `tied/docs/*.md`).
#     Core guides and schema come from tied/docs/ in the TIED source.
#     `tied-yaml-agent-index.md` is post-processed
#     so links resolve from tied/docs/ (see sed block in the DOCS_TO_COPY loop).
#   - .cursor/skills/tied-yaml/: Cursor Agent Skill for REQ/ARCH/IMPL YAML via tied-cli.sh
#     (from tools/bundled-tied-yaml-skill/ in git; .cursor/skills/tied-yaml only if bundled is missing; overwritten each run).
#   - .cursor/skills/: managed prompt-type skills and prompt-shared references
#     (from tools/bundled-prompt-type-skills/; managed directories are overwritten each run).
#     Installed tied-cli.sh bakes TIED_REPO_ROOT to this TIED source repo for TIED_MCP_BIN default.
#   - tied/methodology/vocab/: TIED-owned methodology glossaries (*.md), refreshed on every run
#   - tied/vocab/: client-owned domain glossaries plus a small routing/catalog handoff (never overwritten when present)
#   - Canonical CLI: .cursor/skills/tied-yaml/scripts/tied-cli.sh (use `tree -a` to list .cursor/ or open in the IDE).
#   - .cursor/mcp.json: creates mcpServers.tied-yaml with stdio, absolute paths to this TIED
#     repo's mcp-server/dist/index.js and the target project's tied/ only when the file is
#     missing; preserves an existing file byte-for-byte. Fails if mcp-server/dist/index.js is
#     not built. After bootstrap, in Cursor you may
#     run: agent mcp enable tied-yaml — approve; type quit to exit the Agent CLI.
#
# Managed bootstrap copy metadata:
#   Managed copies use cp -p/cp -pR, then receive the source item's local
#   calendar-date midnight mtime on the client. Before refresh, a non-midnight
#   destination mtime emits a client-modification warning. Source files remain
#   untouched; this is mtime-based detection only.
#
# Designed for macOS (Bash 3.2+) and Ubuntu (Bash 5.x+).
#
# Usage:
#   ./copy_files.sh /path/to/project
#   ./copy_files.sh            # copies into the current working directory
#   ./copy_files.sh --merge-vocab /path/to/project
#     refreshes methodology vocabulary and creates missing client routing/catalog handoffs

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
MERGE_VOCAB=false
if [[ "${1:-}" == "--merge-vocab" ]]; then
  MERGE_VOCAB=true
  shift
fi
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
mkdir -p "${METHODOLOGY_DIR}/vocab"

# Portable real path (macOS has no realpath(1) by default)
_realpath() {
  python3 -c "import os, sys; print(os.path.realpath(sys.argv[1]))" "$1"
}

# [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP]
# How: Apply each source item's local calendar-date midnight to its corresponding managed client copy without modifying source files.
_normalize_copy_timestamps() {
  local _source="$1" _destination="$2"
  python3 - "${_source}" "${_destination}" <<'PY'
import datetime
import os
import sys

source, destination = sys.argv[1:3]
if not os.path.lexists(source):
    raise SystemExit(f"TIMESTAMP_CALCULATION_FAILED: source does not exist: {source}")
if not os.path.lexists(destination):
    raise SystemExit(f"TIMESTAMP_NORMALIZATION_FAILED: destination does not exist: {destination}")

def descendants(root):
    yield root
    if os.path.isdir(root) and not os.path.islink(root):
        for current, dirs, files in os.walk(root, followlinks=False):
            for name in dirs:
                yield os.path.join(current, name)
            for name in files:
                yield os.path.join(current, name)

def midnight(timestamp):
    local = datetime.datetime.fromtimestamp(timestamp)
    return local.replace(hour=0, minute=0, second=0, microsecond=0).timestamp()

source_items = list(descendants(source))
for source_item in source_items:
    relative = os.path.relpath(source_item, source)
    destination_item = destination if relative == "." else os.path.join(destination, relative)
    if not os.path.lexists(destination_item):
        raise SystemExit(
            f"PATH_MAPPING_FAILED: missing copied path {destination_item} for {source_item}"
        )
    timestamp = midnight(os.stat(source_item, follow_symlinks=False).st_mtime)
    access_time = os.stat(destination_item, follow_symlinks=False).st_atime
    os.utime(destination_item, (access_time, timestamp), follow_symlinks=False)
PY
}

# [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP]
# How: Warn before replacing a managed destination when any file mtime is not truncated to local calendar-date midnight.
_warn_modified_copy_target() {
  local _path="$1"
  if [[ ! -e "${_path}" ]] && [[ ! -L "${_path}" ]]; then
    return 0
  fi
  python3 - "${_path}" <<'PY'
import datetime
import os
import sys

path = sys.argv[1]
paths = [path]
if os.path.isdir(path) and not os.path.islink(path):
    for root, dirs, files in os.walk(path, followlinks=False):
        paths.extend(os.path.join(root, name) for name in dirs)
        paths.extend(os.path.join(root, name) for name in files)

for item in paths:
    timestamp = os.stat(item, follow_symlinks=False).st_mtime
    local = datetime.datetime.fromtimestamp(timestamp)
    midnight = local.replace(hour=0, minute=0, second=0, microsecond=0).timestamp()
    if abs(timestamp - midnight) > 0.000001:
        print(f"WARNING: Client-modified managed copy detected: {item}")
PY
}

# [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP]
# How: Preserve file attributes with cp -p, calculate the source-date midnight before copying, warn before replacement, and normalize only the copied file.
_copy_file() {
  local _source="$1" _destination="$2"
  local _source_midnight
  _source_midnight="$(
    python3 - "${_source}" <<'PY'
import datetime
import os
import sys

path = sys.argv[1]
timestamp = os.stat(path, follow_symlinks=False).st_mtime
print(datetime.datetime.fromtimestamp(timestamp).replace(
    hour=0, minute=0, second=0, microsecond=0
).timestamp())
PY
  )"
  _warn_modified_copy_target "${_destination}"
  mkdir -p "$(dirname "${_destination}")"
  cp -p "${_source}" "${_destination}"
  python3 - "${_destination}" "${_source_midnight}" <<'PY'
import os
import sys

path = sys.argv[1]
timestamp = float(sys.argv[2])
access_time = os.stat(path, follow_symlinks=False).st_atime
os.utime(path, (access_time, timestamp), follow_symlinks=False)
PY
}

# [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP]
# How: Preserve tree attributes with cp -pR, calculate source-date midnights before copying, warn before replacement, and normalize only the copied tree.
_copy_tree() {
  local _source="$1" _destination="$2"
  python3 - "${_source}" <<'PY'
import os
import sys

if not os.path.lexists(sys.argv[1]):
    raise SystemExit(f"SOURCE_MISSING: {sys.argv[1]}")
os.stat(sys.argv[1], follow_symlinks=False)
PY
  _warn_modified_copy_target "${_destination}"
  mkdir -p "$(dirname "${_destination}")"
  rm -rf "${_destination}"
  cp -pR "${_source}" "${_destination}"
  _normalize_copy_timestamps "${_source}" "${_destination}"
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
  # [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP] [IMPL-MCP_USAGE_METRICS] [ARCH-MCP_USAGE_METRICS] [REQ-MCP_USAGE_METRICS]
  # How: Create the default TIED MCP configuration for a missing client file; when metrics collection is exactly 1, add the opt-in fields and use an explicit client label or the project basename; the caller guards existing files so client-owned settings remain untouched.
  MCP_JSON_PATH="${MCP_JSON}" TIED_MCP_INDEX_JS="${TIED_SERVER_PATH}" TIED_BASE_PATH_VAL="${TIED_BASE_PATH_VALUE}" \
  TIED_MCP_COLLECT_METRICS_VAL="${TIED_MCP_COLLECT_METRICS:-}" \
  TIED_MCP_METRICS_CLIENT_VAL="${TIED_MCP_METRICS_CLIENT:-}" \
  TIED_PROJECT_BASENAME="$(basename "${TARGET_PROJECT_DIR}")" \
    python3 -c '
import json, os, sys
mcp = os.environ["MCP_JSON_PATH"]
js = os.environ["TIED_MCP_INDEX_JS"]
base = os.environ["TIED_BASE_PATH_VAL"]
collect_metrics = os.environ["TIED_MCP_COLLECT_METRICS_VAL"] == "1"
metrics_client = (
    os.environ["TIED_MCP_METRICS_CLIENT_VAL"]
    or os.environ["TIED_PROJECT_BASENAME"]
)
env = {"TIED_BASE_PATH": base}
if collect_metrics:
    env["TIED_MCP_COLLECT_METRICS"] = "1"
    env["TIED_MCP_METRICS_CLIENT"] = metrics_client
entry = {
    "type": "stdio",
    "disabled": False,
    "command": "node",
    "args": [js],
    "env": env,
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
  _copy_file "${SCRIPT_DIR}/.cursor/hooks.json" "$HOOKS_JSON"
  sed -i '' "s|${SCRIPT_DIR}/.cursor/logs|${TARGET_PROJECT_DIR}/.cursor/logs|g" "$HOOKS_JSON"
  _normalize_copy_timestamps "${SCRIPT_DIR}/.cursor/hooks.json" "$HOOKS_JSON"
fi

mkdir -p "${CURSOR_DIR}"
# [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP]
# How: INITIALIZE_TIED_MCP_CONFIG creates .cursor/mcp.json only when absent and preserves an existing MCP configuration byte-for-byte.
if [[ ! -f "${MCP_JSON}" ]]; then
  _refresh_tied_mcp_json
  say_ok "Initialized ${MCP_JSON} mcpServers.tied-yaml (TIED_MCP dist + project TIED_BASE_PATH)."
fi

# --- Cursor Agent Skill: tied-yaml (CLI; MCP config is initialized above when absent) ---
# Canonical source: tools/bundled-tied-yaml-skill/ (committed). Fallback: .cursor/skills/tied-yaml
# only when bundled is missing or incomplete (non-canonical; warn). Local .cursor/ is gitignored for dev edits.
TIED_YAML_SKILL_CANONICAL="${SCRIPT_DIR}/tools/bundled-tied-yaml-skill"
TIED_YAML_SKILL_DEV_FALLBACK="${SCRIPT_DIR}/.cursor/skills/tied-yaml"
TIED_YAML_SKILL_DEST="${CURSOR_DIR}/skills/tied-yaml"
TIED_CLI_REPO_ROOT_MARKER="/ABSOLUTE/PATH/TO/TIED/SOURCE/DIR"
tied_yaml_skill_is_complete() {
  [[ -f "$1/scripts/tied-cli.sh" ]]
}
_patch_tied_repo_root() {
  # [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP]
  # How: Resolve each installed wrapper's repository marker once and leave already customized clients unchanged.
  local _source="$1" _script_name="$2"
  local _cli="${TIED_YAML_SKILL_DEST}/scripts/${_script_name}"
  local _source_cli="${_source}/scripts/${_script_name}"
  if [[ ! -f "${_cli}" ]] || [[ ! -f "${_source_cli}" ]]; then
    return 0
  fi
  local _root
  _root="$(_realpath "${SCRIPT_DIR}")"
  local _patch_rc=0
  TIED_CLI_PATH="${_cli}" TIED_SOURCE_ROOT="${_root}" TIED_CLI_MARKER="${TIED_CLI_REPO_ROOT_MARKER}" \
    python3 -c '
import os, sys
path = os.environ["TIED_CLI_PATH"]
root = os.environ["TIED_SOURCE_ROOT"]
marker = os.environ["TIED_CLI_MARKER"]
old_line = f": \"${{TIED_REPO_ROOT:={marker}}}\""
new_line = f": \"${{TIED_REPO_ROOT:={root}}}\""
with open(path, encoding="utf-8") as f:
    text = f.read()
if old_line not in text:
    print("MISSING_MARKER", file=sys.stderr)
    sys.exit(2)
with open(path, "w", encoding="utf-8") as f:
    f.write(text.replace(old_line, new_line, 1))
' || _patch_rc=$?
  if [[ "${_patch_rc}" -eq 2 ]]; then
      say_warn "${_script_name} at ${_cli} has no TIED_REPO_ROOT placeholder; skipped baking TIED source path."
  elif [[ "${_patch_rc}" -ne 0 ]]; then
    exit "${_patch_rc}"
  else
    _normalize_copy_timestamps "${_source_cli}" "${_cli}"
  fi
}
install_tied_yaml_skill() {
  # [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP]
  # How: Install the canonical or explicitly permitted fallback skill, then patch its TIED repository root.
  local _src="$1"
  mkdir -p "${CURSOR_DIR}/skills"
  _copy_tree "${_src}" "${TIED_YAML_SKILL_DEST}"
  chmod -R a+rX "${TIED_YAML_SKILL_DEST}"
  if [[ -f "${TIED_YAML_SKILL_DEST}/scripts/tied-cli.sh" ]]; then
    chmod a+x "${TIED_YAML_SKILL_DEST}/scripts/tied-cli.sh"
    _patch_tied_repo_root "${_src}" "tied-cli.sh"
  fi
  for _wrapper in tied.sh feature-orchestrator.sh; do
    if [[ -f "${TIED_YAML_SKILL_DEST}/scripts/${_wrapper}" ]]; then
      chmod a+x "${TIED_YAML_SKILL_DEST}/scripts/${_wrapper}"
      _patch_tied_repo_root "${_src}" "${_wrapper}"
    fi
  done
  say_warn "Copied tied-yaml Cursor skill into ${TIED_YAML_SKILL_DEST} (from ${_src})."
}
if tied_yaml_skill_is_complete "${TIED_YAML_SKILL_CANONICAL}"; then
  install_tied_yaml_skill "${TIED_YAML_SKILL_CANONICAL}"
elif tied_yaml_skill_is_complete "${TIED_YAML_SKILL_DEV_FALLBACK}"; then
  say_warn "Bundled tied-yaml missing or incomplete at ${TIED_YAML_SKILL_CANONICAL}; using non-canonical ${TIED_YAML_SKILL_DEV_FALLBACK}."
  install_tied_yaml_skill "${TIED_YAML_SKILL_DEV_FALLBACK}"
else
  say_err "ERROR: tied-yaml skill not found or incomplete. Need scripts/tied-cli.sh in one of:"
  say_err "  ${TIED_YAML_SKILL_CANONICAL}  (canonical bundled copy; use a complete TIED repository checkout)"
  say_err "  ${TIED_YAML_SKILL_DEV_FALLBACK}  (dev fallback; copy bundled into .cursor/skills/ if needed)"
  say_err "Recovery: re-run this script from a TIED tree that includes tools/bundled-tied-yaml-skill/, or"
  say_err "  cp -pR <TIED_repo>/tools/bundled-tied-yaml-skill .cursor/skills/tied-yaml"
  say_err "TIED project YAML: use a built mcp-server dist/index.js with TIED_MCP_BIN and"
  say_err "  TIED_BASE_PATH, or follow tied/docs/using-tied-without-mcp.md for the manual workflow."
  exit 1
fi

# --- Cursor Agent Skills: prompt-type bundle ---
# [IMPL-PROMPT_TYPE_GLOBAL_SKILLS] [ARCH-PROMPT_TYPE_GLOBAL_SKILLS] [REQ-PROMPT_TYPE_GLOBAL_SKILLS]
# How: Install the tracked explicit-only prompt-type skills and their direct shared references into each client.
PROMPT_TYPE_SKILLS_CANONICAL="${SCRIPT_DIR}/tools/bundled-prompt-type-skills"
PROMPT_TYPE_SKILLS_DEST="${CURSOR_DIR}/skills"
PROMPT_TYPE_SKILL_DIRS=(
  "plan-new-feature"
  "refine-plan"
  "build-plan"
  "plan-close-out"
  "debug"
  "question"
  "use-skill"
  "ammend-commit"
  "non-tied-plan"
  "non-tied-debug"
  "leap-ad-hoc"
  "leap-diff-promote"
  "other"
  "prompt-type-router"
)
PROMPT_TYPE_SHARED_DIR="prompt-shared"
prompt_type_skills_is_complete() {
  [[ -d "$1/${PROMPT_TYPE_SHARED_DIR}" ]] &&
    [[ -f "$1/${PROMPT_TYPE_SKILL_DIRS[0]}/SKILL.md" ]] &&
    [[ -f "$1/prompt-type-router/SKILL.md" ]]
}
install_prompt_type_skills() {
  # [IMPL-PROMPT_TYPE_GLOBAL_SKILLS] [ARCH-PROMPT_TYPE_GLOBAL_SKILLS] [REQ-PROMPT_TYPE_GLOBAL_SKILLS]
  # How: Refresh only the managed prompt-type directories while preserving unrelated client skills and MCP configuration.
  local _src="$1"
  if ! prompt_type_skills_is_complete "${_src}"; then
    say_err "ERROR: prompt-type skill bundle not found or incomplete at ${_src}."
    exit 1
  fi
  mkdir -p "${PROMPT_TYPE_SKILLS_DEST}"
  _copy_tree "${_src}/${PROMPT_TYPE_SHARED_DIR}" "${PROMPT_TYPE_SKILLS_DEST}/${PROMPT_TYPE_SHARED_DIR}"
  local _skill_dir
  for _skill_dir in "${PROMPT_TYPE_SKILL_DIRS[@]}"; do
    _copy_tree "${_src}/${_skill_dir}" "${PROMPT_TYPE_SKILLS_DEST}/${_skill_dir}"
  done
  chmod -R a+rX "${PROMPT_TYPE_SKILLS_DEST}/${PROMPT_TYPE_SHARED_DIR}"
  for _skill_dir in "${PROMPT_TYPE_SKILL_DIRS[@]}"; do
    chmod -R a+rX "${PROMPT_TYPE_SKILLS_DEST}/${_skill_dir}"
  done
  say_warn "Copied prompt-type Cursor skills into ${PROMPT_TYPE_SKILLS_DEST} (from ${_src})."
}
install_prompt_type_skills "${PROMPT_TYPE_SKILLS_CANONICAL}"

# --- Vocabulary ownership boundaries ---
# [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP] [IMPL-TIED_VOCABULARY_REFRESH] [ARCH-TIED_VOCABULARY_LAYERS] [REQ-TIED_VOCABULARY_OWNERSHIP] [PROC-VOCABULARY_INDEX]
# How: Keep TIED-owned methodology glossaries in the refreshable methodology snapshot and
# keep client-owned glossaries at tied/vocab/; never copy methodology prose into the client layer.
VOCAB_SRC="${SCRIPT_DIR}/tied/vocab"
METHODOLOGY_VOCAB_DEST="${METHODOLOGY_DIR}/vocab"
CLIENT_VOCAB_DEST="${TIED_DIR}/vocab"
SOURCE_ONLY_VOCAB_BASENAMES=(
  "prompt-composer.md"
)
is_source_only_vocab() {
  local _basename="$1"
  local _source_only
  for _source_only in "${SOURCE_ONLY_VOCAB_BASENAMES[@]}"; do
    if [[ "${_basename}" == "${_source_only}" ]]; then
      return 0
    fi
  done
  return 1
}
_filter_client_bootstrap_doc() {
  # [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP] [IMPL-TIED_VOCABULARY_REFRESH] [ARCH-TIED_VOCABULARY_LAYERS] [REQ-TIED_VOCABULARY_OWNERSHIP] [PROC-VOCABULARY_INDEX]
  # How: Remove source-only glossary links from client-facing indexes and prompt-type documentation while preserving the canonical TIED-source files.
  local _source="$1" _destination="$2" _basename="$3"
  FILTER_SOURCE="${_source}" FILTER_DESTINATION="${_destination}" FILTER_BASENAME="${_basename}" \
    python3 - <<'PY'
import os

source = os.environ["FILTER_SOURCE"]
destination = os.environ["FILTER_DESTINATION"]
basename = os.environ["FILTER_BASENAME"]
with open(destination, encoding="utf-8") as handle:
    text = handle.read()

# Methodology glossaries keep links to the client-visible docs and optional
# source tools valid after moving one directory deeper into tied/methodology/vocab/.
if "/methodology/vocab/" in destination:
    text = text.replace("](../docs/", "](../../docs/")
    text = text.replace("](../../tools/", "](../../../tools/")
    text = text.replace("](../../mcp-server/", "](../../../mcp-server/")
    text = text.replace("](../../scripts/", "](../../../scripts/")

if basename == "routing.md":
    text = "".join(
        line for line in text.splitlines(keepends=True)
        if "prompt-composer.md" not in line
    )
elif basename == "domain-references.md":
    filtered = []
    for line in text.splitlines(keepends=True):
        if line.startswith("| 5d |") or line.startswith("- **Prompt Composer"):
            continue
        line = line.replace(
            " · [`prompt-composer.md`](prompt-composer.md)",
            "",
        )
        filtered.append(line)
    text = "".join(filtered)
elif basename == "prompt-type-skills.md":
    text = text.replace(
        "**Vocabulary:** [`tied/vocab/prompt-composer.md`](../vocab/prompt-composer.md)",
        "**Vocabulary:** Prompt Composer terms are maintained in the TIED source repository and are not installed into clients.",
    )
    text = text.replace(
        "The canonical glossary is\n[`tied/vocab/prompt-composer.md`](../vocab/prompt-composer.md). The following\nterms were recorded for this skill implementation.",
        "Prompt Composer terms are recorded here for client skill context; the canonical glossary is maintained in the TIED source repository and is not installed into clients.",
    )
    text = text.replace(
        "1. Update `tied/vocab/prompt-composer.md` for new or renamed concepts.",
        "1. Update the source-only `tied/vocab/prompt-composer.md` glossary for new or renamed concepts.",
    )

with open(destination, "w", encoding="utf-8") as handle:
    handle.write(text)
PY
  _normalize_copy_timestamps "${_source}" "${_destination}"
}

# [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP] [IMPL-TIED_VOCABULARY_REFRESH] [ARCH-TIED_VOCABULARY_LAYERS] [REQ-TIED_VOCABULARY_OWNERSHIP] [PROC-VOCABULARY_INDEX]
# How: Create client-owned discovery handoffs only when absent; their contents point
# to refreshable methodology indexes and leave client glossary authorship local.
_write_client_vocab_handoffs() {
  mkdir -p "${CLIENT_VOCAB_DEST}"
  if [[ ! -f "${CLIENT_VOCAB_DEST}/routing.md" ]]; then
    cat > "${CLIENT_VOCAB_DEST}/routing.md" <<'MARKDOWN'
# Client vocabulary routing index

**Ownership:** Client-owned discovery handoff. TIED methodology vocabulary is refreshed under [`../methodology/vocab/`](../methodology/vocab/).

**Procedure:**
1. Read the [TIED methodology routing index](../methodology/vocab/routing.md) for methodology terms.
2. Read the client glossary routing table below for product terms.
3. PRELOAD only the matched glossary for the task.
4. Use the [client vocabulary catalog](domain-references.md) for cross-topic links.

---

## TIED methodology vocabulary

Use [`../methodology/vocab/routing.md`](../methodology/vocab/routing.md) for TIED layout, process, validation, and tooling concepts. Do not copy methodology terms into client glossaries.

## Client glossary routing table

| Pri | File | Keywords / When to read |
|-----|------|------------------------|
| — | Add client-owned glossary files here | Product-specific concepts, UI, storage, or runtime behavior |

## Ownership

Files under `tied/vocab/` are client-owned. Files under `tied/methodology/vocab/` are TIED-owned and are replaced during methodology refresh.

## Alphabetical index

| Term | Section |
|------|---------|
| client vocabulary routing index | Title |
| client glossary routing table | Client glossary routing table |
| TIED methodology vocabulary | TIED methodology vocabulary |
MARKDOWN
  fi
  if [[ ! -f "${CLIENT_VOCAB_DEST}/domain-references.md" ]]; then
    cat > "${CLIENT_VOCAB_DEST}/domain-references.md" <<'MARKDOWN'
# Client vocabulary catalog

**Scope:** Index of client-owned domain vocabulary. TIED methodology vocabulary is cataloged separately under [`../methodology/vocab/domain-references.md`](../methodology/vocab/domain-references.md).

**Procedure:** Read [`routing.md`](routing.md) first. Use the methodology catalog for TIED concepts and this catalog for client product concepts.

---

## TIED methodology catalog

The refreshable TIED vocabulary catalog is [`../methodology/vocab/domain-references.md`](../methodology/vocab/domain-references.md).

## Client canonical glossaries

| Priority | Document | Scope |
|----------|----------|-------|
| — | Add client-owned glossary files here | Product-specific concepts |

## Ownership

This catalog and all non-index glossaries in `tied/vocab/` are client-owned. The methodology catalog and its linked glossaries are refreshed under `tied/methodology/vocab/`.

## Alphabetical index

| Term | Section |
|------|---------|
| client canonical glossaries | Client canonical glossaries |
| client vocabulary catalog | Title |
| TIED methodology catalog | TIED methodology catalog |
MARKDOWN
  fi
}

_write_client_vocab_handoffs

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
    _copy_file "${src}" "${dest}"
    ((base_copied++)) || true
  fi
done
say_x_of_y_client "${base_copied}" "${#BASE_FILES[@]}" "Copied ${base_copied} of ${#BASE_FILES[@]} base files into ${TARGET_PROJECT_DIR}."

# Core methodology (inherited LEAP R+A+I) lives in templates/; guide markdown and reference docs
# are canonical in tied/docs/ in the TIED source.
TEMPLATES_DIR="${SCRIPT_DIR}/templates"
TIED_SOURCE_DIR="${SCRIPT_DIR}/tied"
# --- Methodology: index YAMLs into tied/methodology/ (ALWAYS OVERWRITE) ---
# [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP]
# How: Bootstrap or refresh the client layout while preserving client-owned project YAML and existing vocabulary.
#
# [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP]
# How: Refresh inherited methodology content as an exact source-template snapshot; project YAML and client docs remain outside this tree.
_warn_modified_copy_target "${METHODOLOGY_DIR}"
rm -rf "${METHODOLOGY_DIR}"
mkdir -p "${METHODOLOGY_DIR}/requirements"
mkdir -p "${METHODOLOGY_DIR}/architecture-decisions"
mkdir -p "${METHODOLOGY_DIR}/implementation-decisions"
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
  _copy_file "${src}" "${METHODOLOGY_DIR}/${f}"
  ((index_yaml_copied++)) || true
done
say_warn "Copied ${index_yaml_copied} of ${#INDEX_YAML_FILES[@]} methodology index YAMLs into ${METHODOLOGY_DIR} (overwritten)."

# [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP] [PROC-VOCABULARY_INDEX]
# How: Refresh TIED-owned methodology vocabulary as an exact source snapshot,
# exclude source-only glossaries, and prune stale inherited vocabulary files.
_warn_modified_copy_target "${METHODOLOGY_VOCAB_DEST}"
rm -rf "${METHODOLOGY_VOCAB_DEST}"
mkdir -p "${METHODOLOGY_VOCAB_DEST}"
methodology_vocab_count=0
methodology_vocab_total=0
shopt -s nullglob
for vocab_file in "${VOCAB_SRC}"/*.md; do
  if [[ -f "${vocab_file}" ]]; then
    if is_source_only_vocab "$(basename "${vocab_file}")"; then
      continue
    fi
    ((methodology_vocab_total++)) || true
    destination="${METHODOLOGY_VOCAB_DEST}/$(basename "${vocab_file}")"
    _copy_file "${vocab_file}" "${destination}"
    case "$(basename "${vocab_file}")" in
      routing.md|domain-references.md)
        _filter_client_bootstrap_doc "${vocab_file}" "${destination}" "$(basename "${vocab_file}")"
        ;;
    esac
    ((methodology_vocab_count++)) || true
  fi
done
shopt -u nullglob
say_warn "Copied ${methodology_vocab_count} of ${methodology_vocab_total} methodology vocabulary file(s) into ${METHODOLOGY_VOCAB_DEST} (overwritten)."

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

# --- Feature orchestration starter: create constitution example only when missing ---
CONSTITUTION_EXAMPLE_SOURCE="${SCRIPT_DIR}/tied/constitution.example.yaml"
CONSTITUTION_EXAMPLE_DEST="${TIED_DIR}/constitution.example.yaml"
if [[ ! -f "${CONSTITUTION_EXAMPLE_SOURCE}" ]]; then
  say_err "Missing feature orchestration constitution example: ${CONSTITUTION_EXAMPLE_SOURCE}"
  exit 1
fi
if [[ ! -f "${CONSTITUTION_EXAMPLE_DEST}" ]]; then
  _copy_file "${CONSTITUTION_EXAMPLE_SOURCE}" "${CONSTITUTION_EXAMPLE_DEST}"
  say_ok "Created client constitution example ${CONSTITUTION_EXAMPLE_DEST}."
else
  say_warn "Preserved existing client constitution example ${CONSTITUTION_EXAMPLE_DEST}."
fi

# Copy methodology docs into client tied/docs/ from canonical TIED source tied/docs/ (referenced by AGENTS.md, processes.md).
# The agent-req-implementation-checklist.yaml is the trackable checklist; copy to a unique file per request (see its header).
# CITDP paths in that checklist refer to the client project's tied/citdp/ (client workspace root), not the TIED source repo path.
# IMPL pseudo-code methodology is centralized in pseudocode-writing-and-validation.md + pseudocode-validation-checklist.yaml below (do not re-add retired split docs to this list).
mkdir -p "${TIED_DIR}/docs"
DOCS_TO_COPY=(
  "adding-tied-mcp-and-invoking-passes.md"
  "agent-preload-contract-template.yaml"
  "ai-principles.md"
  "agent-req-implementation-checklist.md"
  "architecture-decisions.md"
  "citdp-policy.md"
  "citdp-record-template.yaml"
  "client-development-index.md"
  "commit-guidelines.md"
  "composition-coverage.md"
  "detail-files-schema.md"
  "agent-req-implementation-checklist.yaml"
  "ai-agent-tied-mcp-usage.md"
  "yaml-update-mcp-runbook.md"
  "implementation-decisions.md"
  "implementation-order.md"
  "LEAP.md"
  "methodology-migration.md"
  "methodology-diagrams.md"
  "processes.md"
  "tied-fidelity-research.md"
  "tied-feature-onboarding.md"
  # Canonical IMPL pseudo-code (primary references for bootstrap):
  # - pseudocode-writing-and-validation.md — unified guide (writing, MCP mechanics, block linkage, phases A–I, LEAP, when to validate).
  # - pseudocode-validation-checklist.yaml — Layer B application checklist ([PROC-PSEUDOCODE_VALIDATION]).
  "pseudocode-format-and-practices.md"
  "pseudocode-fidelity-audit-agent-prompt.md"
  "pseudocode-writing-and-validation.md"
  "pseudocode-validation-checklist.yaml"
  "prompt-type-skills.md"
  "quality-assurance-commands.md"
  "quality-assurance-pilot.md"
  "quality-evidence-manifest.md"
  "req-impl-state-guide-agent-workflow.md"
  "requirement-list-state-guide-agent-workflow.md"
  "requirements.md"
  "semantic-tokens.md"
  "tied-first-implementation-procedure.md"
  "tied-yaml-agent-index.md"
  "using-tied-without-mcp.md"
  "vocabulary-index-analysis-and-standards.md"
  "tied-domain-vocabulary-research-prompt.md"
  "vocabulary-layer-tied-leap-citdp.md"
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
    _copy_file "${src}" "${dest}"
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
      _normalize_copy_timestamps "${src}" "${dest}"
    fi
    if [[ "${f}" == "prompt-type-skills.md" ]]; then
      _filter_client_bootstrap_doc "${src}" "${dest}" "${f}"
    fi
    ((docs_count++)) || true
  fi
done
if [[ ${docs_total} -gt 0 ]]; then
  say_x_of_y_client "${docs_count}" "${docs_total}" "Copied ${docs_count} of ${docs_total} methodology doc(s) into ${TIED_DIR}/docs."
  if [[ ${docs_count} -lt ${docs_total} ]]; then
    say_warn "Preserved $((docs_total - docs_count)) existing methodology document(s); compare them with ${TIED_SOURCE_DIR}/docs/ and merge applicable changes."
  fi
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
      _copy_file "${detail_file}" "${METHODOLOGY_DIR}/implementation-decisions/${filename}"
      ((impl_count++)) || true
    fi
  done
  if [[ ${impl_total} -gt 0 ]]; then
    say_warn "Copied ${impl_count} of ${impl_total} methodology implementation decision(s) into ${METHODOLOGY_DIR}/implementation-decisions (overwritten)."
  fi
  # [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP]
  # How: Refresh inherited IMPL sidecars from templates while leaving project-owned implementation decisions untouched.
  impl_sidecar_count=0
  for sidecar_file in "${IMPL_TEMPLATE_DIR}"/*-pseudocode.md; do
    if [[ -f "${sidecar_file}" ]]; then
      filename="$(basename "${sidecar_file}")"
      _copy_file "${sidecar_file}" "${METHODOLOGY_DIR}/implementation-decisions/${filename}"
      ((impl_sidecar_count++)) || true
    fi
  done
  if [[ ${impl_sidecar_count} -gt 0 ]]; then
    say_warn "Copied ${impl_sidecar_count} methodology implementation pseudo-code sidecar(s) into ${METHODOLOGY_DIR}/implementation-decisions (overwritten)."
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
      _copy_file "${detail_file}" "${METHODOLOGY_DIR}/architecture-decisions/${filename}"
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
      _copy_file "${detail_file}" "${METHODOLOGY_DIR}/requirements/${filename}"
      ((req_count++)) || true
    fi
  done
  if [[ ${req_total} -gt 0 ]]; then
    say_warn "Copied ${req_count} of ${req_total} methodology requirement(s) into ${METHODOLOGY_DIR}/requirements (overwritten)."
  fi
fi
shopt -u nullglob

# [IMPL-TIED_VOCABULARY_REFRESH] [ARCH-TIED_VOCABULARY_LAYERS] [REQ-TIED_VOCABULARY_OWNERSHIP]
# How: After all client methodology artifacts exist, remove links to optional
# source/project files that are not part of the inherited snapshot while
# preserving the visible token or document label.
_normalize_methodology_vocab_links() {
  local _root="$1"
  METHODOLOGY_VOCAB_ROOT="${_root}" python3 - <<'PY'
import os
import re

root = os.environ["METHODOLOGY_VOCAB_ROOT"]
link_pattern = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")

for current, _, files in os.walk(root):
    for name in files:
        if not name.endswith(".md"):
            continue
        path = os.path.join(current, name)
        with open(path, encoding="utf-8") as handle:
            text = handle.read()

        def replace(match):
            label, target = match.groups()
            bare_target = target.split("#", 1)[0].split("?", 1)[0]
            if (
                not bare_target
                or bare_target.startswith("#")
                or bare_target.startswith("//")
                or re.match(r"^[a-z][a-z0-9+.-]*:", bare_target, re.I)
            ):
                return match.group(0)
            resolved = os.path.abspath(os.path.join(os.path.dirname(path), bare_target))
            return match.group(0) if os.path.exists(resolved) else label

        normalized = link_pattern.sub(replace, text)
        if normalized != text:
            with open(path, "w", encoding="utf-8") as handle:
                handle.write(normalized)
PY
}
_normalize_methodology_vocab_links "${METHODOLOGY_VOCAB_DEST}"

# --- Fidelity research methodology verification ---
# [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP] [REQ-TIED_FIDELITY_RESEARCH]
# How: VERIFY_FIDELITY_METHODOLOGY — fail bootstrap when the mandatory client
# methodology contract is incomplete; report optional validation commands without
# mutating the client project or audited research targets.
FIDELITY_METHODOLOGY_REQUIRED_FILES=(
  "methodology/requirements/REQ-TIED_FIDELITY_RESEARCH.yaml"
  "methodology/architecture-decisions/ARCH-TIED_FIDELITY_RESEARCH.yaml"
  "methodology/implementation-decisions/IMPL-TIED_FIDELITY_RESEARCH.yaml"
  "methodology/implementation-decisions/IMPL-TIED_FIDELITY_RESEARCH-pseudocode.md"
  "docs/tied-fidelity-research.md"
  "docs/pseudocode-fidelity-audit-agent-prompt.md"
  "methodology/vocab/fidelity-research.md"
)

verify_fidelity_methodology() {
  # [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP] [REQ-TIED_FIDELITY_RESEARCH]
  # How: Require the inherited guide, vocabulary, REQ/ARCH/IMPL records, and
  # pseudo-code sidecar before declaring the client methodology installed.
  local _missing=0 _relative
  say_warn "MUST verify fidelity research methodology artifacts before completion."
  for _relative in "${FIDELITY_METHODOLOGY_REQUIRED_FILES[@]}"; do
    if [[ ! -f "${TIED_DIR}/${_relative}" ]]; then
      say_err "MISSING mandatory fidelity methodology artifact: ${TIED_DIR}/${_relative}"
      _missing=1
    fi
  done
  if [[ "${_missing}" -ne 0 ]]; then
    say_err "Fidelity research methodology verification failed; client bootstrap is incomplete."
    return 1
  fi
  say_ok "MUST verify fidelity research methodology artifacts: complete."
  say_warn "CAN run structural validation: TIED_BASE_PATH=${TIED_BASE_PATH_VALUE} ${TIED_CLI_DEST:-${CURSOR_DIR}/skills/tied-yaml/scripts/tied-cli.sh} tied_validate_consistency."
  say_warn "CAN run the read-only audit: ${TIED_DIR}/docs/pseudocode-fidelity-audit-agent-prompt.md (Stages 0-4)."
  say_warn "CAN refresh methodology vocabulary with: ./copy_files.sh --merge-vocab /path/to/client."
}

verify_fidelity_methodology

# --- Feature orchestration methodology verification ---
# [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP]
# How: Require the lightweight onboarding guide, constitution starter, vocabulary, and
# executable wrapper before declaring the client feature-orchestration surface installed.
FEATURE_ORCHESTRATION_METHODOLOGY_REQUIRED_FILES=(
  "tied/docs/tied-feature-onboarding.md"
  "tied/constitution.example.yaml"
  "tied/methodology/vocab/feature-orchestration.md"
  ".cursor/skills/tied-yaml/scripts/tied.sh"
)

verify_feature_orchestration_methodology() {
  # [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP]
  # How: Fail closed for missing mandatory publication artifacts after the
  # methodology vocabulary snapshot has been refreshed.
  local _missing=0 _relative _artifact_path
  say_warn "MUST verify feature orchestration methodology artifacts before completion."
  for _relative in "${FEATURE_ORCHESTRATION_METHODOLOGY_REQUIRED_FILES[@]}"; do
    _artifact_path="${TIED_DIR}/${_relative}"
    if [[ "${_relative}" == tied/* ]] || [[ "${_relative}" == .cursor/* ]]; then
      _artifact_path="${TARGET_PROJECT_DIR}/${_relative}"
    fi
    if [[ ! -f "${_artifact_path}" ]]; then
      say_err "MISSING mandatory feature orchestration artifact: ${_artifact_path}"
      _missing=1
    fi
  done
  if [[ "${_missing}" -ne 0 ]]; then
    say_err "Feature orchestration methodology verification failed; client bootstrap is incomplete."
    return 1
  fi
  say_ok "MUST verify feature orchestration methodology artifacts: complete."
  say_warn "CAN run onboarding smoke: (cd ${TARGET_PROJECT_DIR} && .cursor/skills/tied-yaml/scripts/tied.sh init)."
  say_warn "CAN run structural validation: TIED_BASE_PATH=${TIED_BASE_PATH_VALUE} ${TIED_CLI_DEST:-${CURSOR_DIR}/skills/tied-yaml/scripts/tied-cli.sh} tied_validate_consistency."
}

verify_feature_orchestration_methodology