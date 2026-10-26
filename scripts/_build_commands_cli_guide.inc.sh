# [IMPL-TIED_BUILD_COMMANDS_HOW_TEXTURE] [ARCH-TIED_CLI_OPERATOR_OUTPUT_TEXTURE] [REQ-TIED_CLI_OPERATOR_OUTPUT_TEXTURE]
# Sourced fragment: operator help texture for how().

_HOW_USE_TEXTURE=0
_HOW_FD=2
_B=''
_D=''
_C=''
_R=''
_HOW_HR_CHAR=''
_HOW_SECTION_PREFIX=''

_how_err() {
  printf '%s\n' "$@" >&2
}

_how_out() {
  if [[ "${_HOW_FD}" != "1" && "${_HOW_FD}" != "2" ]]; then
    _how_err "how: internal error: invalid help fd ${_HOW_FD}"
    return 2
  fi
  printf '%s\n' "$@" >&"${_HOW_FD}"
}

_how_stream_init() {
  local _HOW_STDOUT_CLI="${1:-0}"
  if [[ "${_HOW_STDOUT_CLI}" == "1" || "${TIED_CLI_HELP_STDOUT:-}" == "1" ]]; then
    _HOW_FD=1
  else
    _HOW_FD=2
  fi
}

_how_plain_init() {
  local _HOW_PLAIN_CLI="${1:-0}"
  local plain=0
  if [[ "${_HOW_PLAIN_CLI}" == "1" || "${TIED_CLI_PLAIN:-}" == "1" || -n "${NO_COLOR:-}" ]]; then
    plain=1
  elif [[ ! -t "${_HOW_FD}" ]]; then
    plain=1
  fi
  if [[ "$plain" == "1" ]]; then
    _HOW_USE_TEXTURE=0
    _B=''
    _D=''
    _C=''
    _R=''
    _HOW_HR_CHAR="$(printf '%*s' 56 '' | tr ' ' '-')"
    _HOW_SECTION_PREFIX=''
  else
    _HOW_USE_TEXTURE=1
    _B=$'\033[1m'
    _D=$'\033[2m'
    _C=$'\033[36m'
    _R=$'\033[0m'
    _HOW_HR_CHAR="$(printf '\342\224\200%.0s' {1..56})"
    _HOW_SECTION_PREFIX=$'\342\226\266 '
  fi
}

_how_title() {
  _how_out "${_B}build-commands.sh — TIED repo shell helpers${_R}"
}

_how_header() {
  _how_out "${_B}${_C}${_HOW_SECTION_PREFIX}$1${_R}"
  _how_hr
}

_how_cmd() {
  local name="$1"
  shift
  local desc="$*"
  local pad=$((26 - ${#name}))
  if (( pad < 1 )); then pad=1; fi
  if [[ "${_HOW_USE_TEXTURE}" == "1" ]]; then
    _how_out "  ${_B}${name}${_R}$(printf '%*s' "$pad" '')${_D}${desc}${_R}"
  else
    _how_out "$(printf '  %-*s %s' 26 "$name" "$desc")"
  fi
}

_how_note() {
  if [[ "${_HOW_USE_TEXTURE}" == "1" ]]; then
    _how_out "  ${_D}$*${_R}"
  else
    _how_out "  $*"
  fi
}

_how_hr() {
  if [[ "${_HOW_USE_TEXTURE}" == "1" ]]; then
    _how_out "${_D}${_HOW_HR_CHAR}${_R}"
  else
    _how_out "${_HOW_HR_CHAR}"
  fi
}

_how_unknown_topic() {
  _how_err "how: unknown topic: $1"
  _how_err "Topics: all, backup, build, test, tied, vocab, agentstream, close-out, smoke, install-matrix, drivers, env"
}

_how_unknown_flag() {
  _how_err "how: unknown flag: $1"
}

_how_render_body() {
  local line
  while IFS= read -r line || [[ -n "$line" ]]; do
    if [[ -z "$line" ]]; then
      _how_out ""
      continue
    fi
    if [[ "$line" =~ ^[[:space:]][[:space:]]*([^[:space:]]+)[[:space:]][[:space:]]+(.*)$ ]]; then
      _how_cmd "${BASH_REMATCH[1]}" "${BASH_REMATCH[2]}"
    elif [[ "$line" =~ ^[[:space:]]+(.*)$ ]]; then
      _how_note "${BASH_REMATCH[1]}"
    else
      _how_out "$line"
    fi
  done
}

_how_usage() {
  _how_title
  _how_out ""
  _how_cmd "source" "scripts/build-commands.sh     load functions (from repo root)"
  _how_cmd "how" "full command map"
  _how_cmd "how" "TOPIC   one section (backup|build|test|tied|vocab|agentstream|close-out|smoke|install-matrix|drivers|env)"
  _how_out ""
  _how_note "Global flags (before topic): --plain|-p|--no-color, --stdout"
  _how_note "Env: TIED_CLI_PLAIN=1, TIED_CLI_HELP_STDOUT=1, NO_COLOR (see no-color.org)"
  _how_out ""
  _how_note "Prerequisites for smoke tests: build-mcp (or test-all), node, npm, jq, yq, git, agent CLI."
  _how_note "Runbook: docs/tied-feature-extended-demo.md"
}

_how_backup() {
  _how_header "Backup"
  _how_render_body <<'EOF'
  bi                         backup increment (bkpdir inc)
  b.                         backup current directory (bkpdir .)
EOF
}

_how_build() {
  _how_header "Build"
  _how_render_body <<'EOF'
  build-workspace            ./build-workspace.sh (mcp-server + tools/bootstrap)
  build-mcp                  npm install + build in mcp-server/ only
  build-agentstream          npm -w build @tied/agentstream + @tied/cli (incremental)
  build-all                  same as build-workspace
EOF
}

_how_test() {
  _how_header "Test / verify"
  _how_render_body <<'EOF'
  test-all                   fail-closed: build-mcp, test-mcp, test-bootstrap-layered-install,
                             CLI smoke, validate-tied, validate-vocab, lint-tied (recommended pre-push);
                             errexit isolated in a subshell (safe after source build-commands.sh)
  test-mcp                   mcp-server unit/composition tests (includes Tier 1 workspace dist tests,
                             dist/e2e/new-tied-client.test.js install passthrough)
  test-bootstrap-layered-install
                             node --test install-options, layers/*, install-layers.integration,
                             tied-new-client-audit ([REQ-TIED_LAYERED_CLIENT_INSTALL]; needs mcp dist)
  test-agentstream           @tied/agentstream package tests (frozen oracle fixtures)
  verify-agentstream-parity  npm run build + @tied/agentstream test (TS parity vs frozen oracle)
  test-bootstrap-claude-harness
                             node --test tools/bootstrap/lib/claude-harness.test.mjs (8 tests;
                             builds mcp-server if dist missing; [REQ-TIED_CLAUDE_HARNESS])

  Not in test-all: test-new-tied-client (disposable factory), test-tied-feature-*,
                   test-bootstrap-claude-harness
EOF
}

_how_tied() {
  _how_header "TIED YAML"
  _how_render_body <<'EOF'
  tied-cli TOOL [JSON]       MCP tool surface via tied-cli.sh
                             e.g. tied-cli yaml_index_list_tokens '{"index":"requirements"}'
  lint-tied                  lint all project tied/**/*.yaml
  lint-reorder [args]        scripts/lint.sh (list reorder policy; quiet on success)
  validate-tied              tied_validate_consistency (pseudo-code + detail checks)
                             honors TIED_BASE_PATH, TIED_MCP_BIN (defaults: ./tied, mcp-server/dist)
  pseudocode-validate JSON   tied-cli pseudocode_validate (e.g. @working/REQ-…/pseudocode-validate-args.json)
EOF
}

_how_vocab() {
  _how_header "Vocabulary index"
  _how_render_body <<'EOF'
  validate-vocab             scripts/validate_vocab_index.rb on tied/vocab layers
                             touchpoint 3 gate before traceable commit
EOF
}

_how_agentstream() {
  _how_header "Agentstream (Phase 4d: TS-only; after build-mcp or build-agentstream)"
  _how_render_body <<'EOF'
  node mcp-server/packages/cli/dist/index.js agentstream --help
  tied agentstream --help      when @tied/cli is on PATH (npm link / npx)
  AGENTSTREAM=path             optional override for batch drivers

  scripts/run-feature-batch-agentstream.sh   TS batch runner (tied agentstream)
  scripts/feature-relay.sh TITLE GOAL BEHAVIOR [agentstream flags...]
  scripts/tasd.sh NAME [target] [flags...]     disposable client + lead checklist

  MCP preflight is off by default; opt in with --tied-mcp-preflight or
  AGENTSTREAM_TIED_MCP_PREFLIGHT=1 (see mcp-server/packages/agentstream/README.md).
EOF
}

_how_close_out() {
  _how_header "Close-out (REQ checklist gate + evidence envelope)"
  _how_render_body <<'EOF'
  run-close-out-gates [flags]   node tools/bootstrap/templates/run-close-out-gates.mjs
                                (default --project-root = this repo)
  close-out-req REQ-TOKEN [flags]
                                Preset: working/REQ/checklist-tracker.yaml + tied-project/citdp/CITDP-REQ.yaml
                                (or working/REQ/CITDP-REQ.yaml), phase close_out, --sync-dispositions
                                --reconcile --envelope-blocking, UTC run-id

  Canonical machine close-out (manual equivalent):
    close-out-req REQ-TIED_EXAMPLE

  Extra flags pass through to run-close-out-gates (see --help):
    node tools/bootstrap/templates/run-close-out-gates.mjs --help

  Related: tied-cli request_evidence_envelope_validate, tied_checklist_gate_validate, tied_verify
  Doc: tied-bundle/docs/request-evidence-envelope.md
EOF
}

_how_install_matrix() {
  _how_header "Layered install resource matrix (committed vs gitignored)"
  _how_render_body <<'EOF'
  how install-matrix             this summary + path to working/REQ-TIED_LAYERED_CLIENT_INSTALL/install-resource-matrix.md
  tied-install.sh [OPTS] DIR     no args → help; default --mode linked (stubs + MCP bundle env)
  tied-install.cmd / tied-install.ps1   same dispatch on native Windows (CMD / PowerShell)
  test-new-tied-client           disposable factory via tied-install linked
  test-new-tied-client --tag gf-001   id/dir suffix: <epoch>-gf-001 under TIED_TEST_ROOT
  tied-install --migrate-layout  brownfield layout migration (idempotent)
  tied-install --migrate-layout --store --dry-run   store p6 git mv plan (no mutation)
  test-new-tied-client --install-mode full
  test-new-tied-client --install-layers db,mcp,skills,methodology
  test-new-tied-client --install-harness cursor|claude|both
  test-new-tied-client --methodology-bundle live|pinned
  test-new-tied-client --doctor-after
  Env mirrors: TIED_INSTALL_MODE, TIED_INSTALL_LAYERS, TIED_INSTALL_HARNESS,
                TIED_METHODOLOGY_BUNDLE, TIED_INSTALL_DOCTOR_AFTER
EOF
  _how_note "Matrix file: tied-project/working/REQ-TIED_LAYERED_CLIENT_INSTALL/install-resource-matrix.md"
  _how_note "verify: verify-install-matrix-doc (layout.mjs key paths)"
}

_how_smoke() {
  _how_header "Feature-orchestration smoke (disposable clients)"
  _how_render_body <<'EOF'
  new-tied-client DIR [SOURCE]   tied-install linked (default) + lint + git init
  test-new-tied-client           same under $TIED_TEST_ROOT/<timestamp> or <timestamp>-<tag>
                                 tied-install linked + lint + G4 onboarding audit
                                 (tied-new-client-audit.v1.json) + mcp + git
                                 install flags: how install-matrix
                                 brownfield: tied-install --migrate-layout on client root first
                                 skip audit: TIED_SKIP_NEW_CLIENT_AUDIT=1
                                 default test root: ~/Documents/dev/test
  test-new-claude-tied-client    Node disposable --harness claude + validation receipt
  new-claude-tied-client DIR     explicit Claude-first factory (no Cursor mcp enable)
  validate-claude-tied-client DIR  re-run Claude validation only
                                 Windows: scripts\validate-claude-tied-client.cmd / .ps1
  test-tied-feature-onboarding CLIENT_DIR
  test-tied-feature-lifecycle CLIENT_DIR

  Windows (from TIED repo):
    Git Bash: source scripts/build-commands.sh && test-new-tied-client [flags]
    CMD: test-new-tied-client.cmd or scripts\test-new-tied-client.cmd
    PowerShell: .\test-new-tied-client.ps1 or scripts\test-new-tied-client.ps1
                 (example: powershell -ExecutionPolicy Bypass -File .\test-new-tied-client.ps1)
    tied-install.cmd / tied-install.ps1   layered install (same Node dispatch as tied-install.sh)
    scripts\test-new-claude-tied-client.cmd / .ps1   Claude-first disposable factory
    scripts\lint_yaml.cmd / scripts\lint_yaml.ps1 -F tied

  Typical sequence:
    DEMO=$(mktemp -d "${TMPDIR:-/tmp}/tied-feature-demo.XXXXXX")
    new-tied-client "$DEMO"
    test-tied-feature-onboarding "$DEMO"
    test-tied-feature-lifecycle "$DEMO"
EOF
}

_how_drivers() {
  _how_header "Related repo scripts (not wrapped here)"
  _how_render_body <<'EOF'
  ./tied-install.sh [OPTS] TARGET   no args → help; bootstrap TIED (linked default; use . for cwd)
  tied-install.cmd / tied-install.ps1   Windows layered install dispatch
  node tools/bootstrap/install-layers.mjs   direct cross-platform install CLI
  scripts/lint_yaml.sh FILE    canonicalize/lint one or more YAML paths
  scripts/lint_yaml.cmd / scripts/lint_yaml.ps1 -F tied   Windows tied YAML lint parity
  scripts/yaml_semantic_compare.rb
  scripts/analyze_tied_mcp_metrics.rb   offline MCP metrics JSONL analysis
  scripts/tied-post-session.sh CLIENT   post-session metrics + envelope + profile + reconcile
  tools/bootstrap/templates/run-close-out-gates.mjs
  tools/bootstrap/templates/sync-tracker-dispositions.mjs
  scripts/run-feature-batch.sh          Agentstream batch runner (delegates to run-feature-batch-agentstream.sh)

  Wrapped in build-commands: run-close-out-gates, close-out-req (how close-out)

  Client onboarding CLI (inside a bootstrapped project):
    .cursor/skills/tied-yaml/scripts/tied.sh init
    .cursor/skills/tied-yaml/scripts/tied.sh feature new "Title"
    .cursor/skills/tied-yaml/scripts/feature-orchestrator.sh specify|refine ...
EOF
}

_how_env() {
  _how_header "Environment (this script sets TIED_MCP_COLLECT_METRICS=1 on source)"
  _how_render_body <<'EOF'
  TIED_BASE_PATH             tied/ directory for tied-cli and MCP
  TIED_MCP_BIN               path to mcp-server/dist/index.js
  TIED_REPO_ROOT             TIED repo root for new-tied-client / test-new-tied-client
  TIED_TEST_ROOT             parent dir for test-new-tied-client (default ~/Documents/dev/test)
  TIED_SKIP_NEW_CLIENT_AUDIT set to 1 to skip G4 onboarding audit in bootstrap smoke
  TIED_CLAUDE_CLIENT_WITH_CONSISTENCY=1  opt-in consistency during Claude client validation
  AGENTSTREAM                prebuilt agentstream binary for batch drivers
  AGENTSTREAM_TIED_MCP_PREFLIGHT=1   opt-in MCP preflight before live agent turns

Quality matrix: tied-bundle/docs/quality-assurance-commands.md
EOF
}

_how_all() {
  _how_usage
  _how_out ""
  local sections=(
    _how_backup
    _how_build
    _how_test
    _how_tied
    _how_vocab
    _how_agentstream
    _how_close_out
    _how_smoke
    _how_drivers
    _how_env
  )
  local sec
  for sec in "${sections[@]}"; do
    _how_out ""
    "${sec}"
  done
}

unalias how 2>/dev/null || true
how() {
  local _HOW_PLAIN_CLI=0
  local _HOW_STDOUT_CLI=0
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --plain|-p|--no-color) _HOW_PLAIN_CLI=1; shift ;;
      --stdout) _HOW_STDOUT_CLI=1; shift ;;
      --) shift; break ;;
      -*) _how_unknown_flag "$1"; return 2 ;;
      *) break ;;
    esac
  done
  local topic="all"
  if [[ $# -gt 0 ]]; then
    topic="$1"
    shift
  fi
  if [[ $# -gt 0 ]]; then
    _how_err "how: excess argument(s): $*"
    return 2
  fi
  _how_stream_init "${_HOW_STDOUT_CLI}"
  _how_plain_init "${_HOW_PLAIN_CLI}"
  case "$topic" in
    all|help|-h|--help) _how_all ;;
    backup) _how_backup ;;
    build) _how_build ;;
    test|verify) _how_test ;;
    tied|yaml) _how_tied ;;
    vocab|vocabulary) _how_vocab ;;
    agentstream|go) _how_agentstream ;;
    close-out|closeout|gates) _how_close_out ;;
    smoke|feature|orchestration) _how_smoke ;;
    install-matrix|install) _how_install_matrix ;;
    drivers|scripts) _how_drivers ;;
    env|environment) _how_env ;;
    *)
      _how_unknown_topic "$topic"
      return 2
      ;;
  esac
}
