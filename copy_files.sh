#!/usr/bin/env bash
#
# [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP]
# How: Bootstrap client tied/ layout, methodology refresh, tied-yaml skill install, vocab seed, and conditional MCP config initialization.
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
#     (from tools/bundled-tied-yaml-skill/ in git; .cursor/skills/tied-yaml only if bundled is missing; overwritten each run).
#   - .cursor/skills/: managed prompt-type skills and prompt-shared references
#     (from tools/bundled-prompt-type-skills/; managed directories are overwritten each run).
#     Installed tied-cli.sh bakes TIED_REPO_ROOT to this TIED source repo for TIED_MCP_BIN default.
#   - tied/vocab/: domain vocabulary glossaries (*.md) including routing.md; seeded when missing or empty (never overwrites client files)
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
#     adds missing vocabulary files without overwriting existing client glossaries

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
_patch_tied_cli_repo_root() {
  # [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP]
  # How: Resolve the installed CLI's repository marker once and leave already customized clients unchanged.
  local _source="$1" _cli="${TIED_YAML_SKILL_DEST}/scripts/tied-cli.sh"
  local _source_cli="${_source}/scripts/tied-cli.sh"
  if [[ ! -f "${_cli}" ]]; then
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
      say_warn "tied-cli.sh at ${_cli} has no TIED_REPO_ROOT placeholder; skipped baking TIED source path."
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
    _patch_tied_cli_repo_root "${_src}"
  fi
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

# --- Domain vocabulary index (project-scoped; seed when absent) ---
# [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP] [PROC-VOCABULARY_INDEX]
# How: SEED_DOMAIN_VOCAB — copy tied/vocab/*.md from TIED source when client has no vocab files yet.
VOCAB_SRC="${SCRIPT_DIR}/tied/vocab"
VOCAB_DEST="${TIED_DIR}/vocab"
_seed_domain_vocab() {
  # [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP] [PROC-VOCABULARY_INDEX]
  # How: Seed canonical glossaries only for a client with no existing Markdown vocabulary.
  local _src="$1" _dest="$2"
  if [[ ! -d "${_src}" ]]; then
    say_warn "No domain vocabulary source at ${_src}; skipped tied/vocab seed."
    return 0
  fi
  shopt -s nullglob
  local _existing=( "${_dest}"/*.md )
  shopt -u nullglob
  if [[ ${#_existing[@]} -gt 0 ]]; then
    say_warn "Client tied/vocab/ already has ${#_existing[@]} file(s); skipped vocab seed (preserved)."
    return 0
  fi
  mkdir -p "${_dest}"
  local _count=0 _total=0
  for _f in "${_src}"/*.md; do
    if [[ -f "${_f}" ]]; then
      (( _total++ )) || true
      _copy_file "${_f}" "${_dest}/$(basename "${_f}")"
      (( _count++ )) || true
    fi
  done
  if [[ ${_total} -gt 0 ]]; then
    say_x_of_y_client "${_count}" "${_total}" "Seeded ${_count} of ${_total} domain vocabulary file(s) into ${_dest}."
  else
    say_warn "No *.md in ${_src}; skipped tied/vocab seed."
  fi
}
_seed_domain_vocab "${VOCAB_SRC}" "${VOCAB_DEST}"

if [[ "${MERGE_VOCAB}" == "true" ]]; then
  # [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP] [PROC-VOCABULARY_INDEX]
  # How: Add absent canonical glossary basenames under --merge-vocab without overwriting client glossaries.
  merge_count=0
  merge_total=0
  merge_skipped=0
  shopt -s nullglob
  for _f in "${VOCAB_SRC}"/*.md; do
    if [[ -f "${_f}" ]]; then
      ((merge_total++)) || true
      _dest_file="${VOCAB_DEST}/$(basename "${_f}")"
      if [[ -f "${_dest_file}" ]]; then
        ((merge_skipped++)) || true
      else
        mkdir -p "${VOCAB_DEST}"
        _copy_file "${_f}" "${_dest_file}"
        ((merge_count++)) || true
      fi
    fi
  done
  shopt -u nullglob
  if [[ ${merge_total} -gt 0 ]]; then
    say_warn "Vocabulary merge added ${merge_count} of ${merge_total} canonical file(s); preserved ${merge_skipped} existing client file(s)."
  else
    say_warn "No *.md in ${VOCAB_SRC}; skipped vocabulary merge."
  fi
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
  "vocab/fidelity-research.md"
)

verify_fidelity_methodology() {
  # [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP] [REQ-TIED_FIDELITY_RESEARCH]
  # How: Require the inherited guide, vocabulary, REQ/ARCH/IMPL records, and
  # pseudo-code sidecar before declaring the client methodology installed.
  local _missing=0 _deferred_vocab=0 _relative
  say_warn "MUST verify fidelity research methodology artifacts before completion."
  for _relative in "${FIDELITY_METHODOLOGY_REQUIRED_FILES[@]}"; do
    if [[ ! -f "${TIED_DIR}/${_relative}" ]]; then
      if [[ "${_relative}" == "vocab/fidelity-research.md" ]] && [[ "${MERGE_VOCAB}" != "true" ]]; then
        say_warn "MUST run ./copy_files.sh --merge-vocab ${TARGET_PROJECT_DIR} to add the fidelity research vocabulary."
        _deferred_vocab=1
        continue
      fi
      say_err "MISSING mandatory fidelity methodology artifact: ${TIED_DIR}/${_relative}"
      _missing=1
    fi
  done
  if [[ "${_missing}" -ne 0 ]]; then
    say_err "Fidelity research methodology verification failed; client bootstrap is incomplete."
    return 1
  fi
  if [[ "${_deferred_vocab}" -eq 0 ]]; then
    say_ok "MUST verify fidelity research methodology artifacts: complete."
  else
    say_warn "MUST complete fidelity research vocabulary installation with --merge-vocab."
  fi
  say_warn "CAN run structural validation: TIED_BASE_PATH=${TIED_BASE_PATH_VALUE} ${TIED_CLI_DEST:-${CURSOR_DIR}/skills/tied-yaml/scripts/tied-cli.sh} tied_validate_consistency."
  say_warn "CAN run the read-only audit: ${TIED_DIR}/docs/pseudocode-fidelity-audit-agent-prompt.md (Stages 0-4)."
  say_warn "CAN merge new vocabulary into an existing client with: ./copy_files.sh --merge-vocab /path/to/client."
}

verify_fidelity_methodology
