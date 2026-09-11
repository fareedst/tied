#!/usr/bin/env bash
# [IMPL-MCP_USAGE_METRICS] [IMPL-REQUEST_EVIDENCE_ENVELOPE_BATCH] [IMPL-EVIDENCE_CHAIN_PROFILE]
# [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [REQ-MCP_USAGE_METRICS]
# [REQ-REQUEST_EVIDENCE_ENVELOPE] [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT]
#
# Offline post-session analysis for a TIED client (especially ~/Documents/dev/test/{id}).
# Chains MCP metrics analysis, envelope gap report, evidence-chain profiles, and optional
# adherence reconciliation into one output directory under the client working tree.
#
# Usage:
#   scripts/tied-post-session.sh CLIENT [options]
#
# CLIENT: absolute path, numeric id under TIED_TEST_ROOT, or directory name under TIED_TEST_ROOT
#
# Options:
#   --req REQ-TOKEN          Limit to one REQ (repeatable). Default: every working/REQ-* dir.
#   --out DIR                Output directory (default: CLIENT/working/post-session/TIMESTAMP)
#   --corpus PATH            Use evaluation-corpus YAML instead of a one-off batch manifest
#   --profile-depth DEPTH    integrated (default) or human_research
#   --metrics-file PATH      MCP metrics JSONL (default: ~/.cursor/logs/tied-mcp-metrics.jsonl)
#   --skip-metrics           Skip analyze_tied_mcp_metrics.rb
#   --skip-envelope          Skip envelope-gap-report batch collect
#   --skip-profile           Skip evidence_chain_profile_generate per REQ
#   --skip-reconcile         Skip adherence-reconcile when ledger exists
#   --skip-grammar-v2        Skip grammar v2 audit when corpus row expects pass
#   --with-hook-log          Analyze newest ~/.cursor/logs/conv_*.yaml (can be slow)
#   -h, --help               Show help
#
# Examples:
#   scripts/tied-post-session.sh 1788547701
#   scripts/tied-post-session.sh ~/Documents/dev/test/my-demo --req REQ-HELLO
#   scripts/tied-post-session.sh 1788547701 --corpus working/evaluation/evaluation-corpus.v1.yaml
#
# Prerequisites: built mcp-server (npm run build --prefix mcp-server), ruby, node >=18.
# Optional: Go adherence-reconcile (build-agentstream or go build in tools/agentstream).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TIED_SOURCE_ROOT="${TIED_SOURCE_ROOT:-$(cd "${SCRIPT_DIR}/.." && pwd)}"
TIED_TEST_ROOT="${TIED_TEST_ROOT:-${HOME}/Documents/dev/test}"
TIED_MCP_BIN="${TIED_MCP_BIN:-${TIED_SOURCE_ROOT}/mcp-server/dist/index.js}"
ENVELOPE_BATCH_CLI="${TIED_SOURCE_ROOT}/mcp-server/dist/cli/request-evidence-envelope-batch-collect.js"
METRICS_RUBY="${TIED_SOURCE_ROOT}/scripts/analyze_tied_mcp_metrics.rb"
HOOK_ANALYZER="${TIED_SOURCE_ROOT}/scripts/analyze_hook_log.rb"

CLIENT_ARG=""
OUT_DIR=""
CORPUS_PATH=""
METRICS_FILE="${TIED_MCP_METRICS_PATH:-${HOME}/.cursor/logs/tied-mcp-metrics.jsonl}"
PROFILE_DEPTH="integrated"
SKIP_METRICS=0
SKIP_ENVELOPE=0
SKIP_PROFILE=0
SKIP_RECONCILE=0
SKIP_GRAMMAR_V2=0
WITH_HOOK_LOG=0
declare -a REQ_TOKENS=()

usage() {
  sed -n '2,35p' "$0" | sed 's/^# \{0,1\}//'
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help)
      usage
      exit 0
      ;;
    --req)
      REQ_TOKENS+=("${2:?--req requires REQ-TOKEN}")
      shift 2
      ;;
    --out)
      OUT_DIR="${2:?--out requires DIR}"
      shift 2
      ;;
    --corpus)
      CORPUS_PATH="${2:?--corpus requires PATH}"
      shift 2
      ;;
    --profile-depth)
      PROFILE_DEPTH="${2:?--profile-depth requires integrated or human_research}"
      shift 2
      ;;
    --metrics-file)
      METRICS_FILE="${2:?--metrics-file requires PATH}"
      shift 2
      ;;
    --skip-metrics) SKIP_METRICS=1; shift ;;
    --skip-envelope) SKIP_ENVELOPE=1; shift ;;
    --skip-profile) SKIP_PROFILE=1; shift ;;
    --skip-reconcile) SKIP_RECONCILE=1; shift ;;
    --skip-grammar-v2) SKIP_GRAMMAR_V2=1; shift ;;
    --with-hook-log) WITH_HOOK_LOG=1; shift ;;
    --)
      shift
      break
      ;;
    -*)
      echo "ERROR: unknown option: $1" >&2
      usage >&2
      exit 2
      ;;
    *)
      if [[ -n "${CLIENT_ARG}" ]]; then
        echo "ERROR: unexpected argument: $1" >&2
        exit 2
      fi
      CLIENT_ARG="$1"
      shift
      ;;
  esac
done

if [[ -z "${CLIENT_ARG}" ]]; then
  echo "ERROR: CLIENT is required" >&2
  usage >&2
  exit 2
fi

if [[ "${PROFILE_DEPTH}" != "integrated" && "${PROFILE_DEPTH}" != "human_research" ]]; then
  echo "ERROR: --profile-depth must be integrated or human_research" >&2
  exit 2
fi

resolve_client_root() {
  local arg="$1"
  if [[ "${arg}" == /* ]]; then
    printf '%s\n' "${arg}"
    return 0
  fi
  if [[ "${arg}" =~ ^[0-9]+$ ]]; then
    printf '%s/%s\n' "${TIED_TEST_ROOT}" "${arg}"
    return 0
  fi
  printf '%s/%s\n' "${TIED_TEST_ROOT}" "${arg}"
}

CLIENT_ROOT="$(resolve_client_root "${CLIENT_ARG}")"
CLIENT_ROOT="$(cd "${CLIENT_ROOT}" 2>/dev/null && pwd || true)"
if [[ -z "${CLIENT_ROOT}" || ! -d "${CLIENT_ROOT}" ]]; then
  echo "ERROR: client directory not found: ${CLIENT_ARG}" >&2
  exit 2
fi

TIED_BASE="${CLIENT_ROOT}/tied"
if [[ ! -d "${TIED_BASE}" ]]; then
  echo "ERROR: missing tied/ under ${CLIENT_ROOT}" >&2
  exit 2
fi

if [[ ! -f "${TIED_MCP_BIN}" ]]; then
  echo "ERROR: MCP server not built: ${TIED_MCP_BIN}" >&2
  echo "  Run: npm run build --prefix ${TIED_SOURCE_ROOT}/mcp-server" >&2
  exit 2
fi

if [[ ${#REQ_TOKENS[@]} -eq 0 ]]; then
  while IFS= read -r dir; do
    REQ_TOKENS+=("$(basename "${dir}")")
  done < <(find "${CLIENT_ROOT}/working" -maxdepth 1 -type d -name 'REQ-*' 2>/dev/null | sort)
fi

if [[ ${#REQ_TOKENS[@]} -eq 0 ]]; then
  echo "DIAGNOSTIC: no working/REQ-* directories found; envelope/profile/reconcile steps may no-op" >&2
fi

if [[ -z "${OUT_DIR}" ]]; then
  OUT_DIR="${CLIENT_ROOT}/working/post-session/$(date +%Y%m%dT%H%M%S)"
fi
mkdir -p "${OUT_DIR}"

CLIENT_ALIAS="$(basename "${CLIENT_ROOT}")"
SESSION_STAMP="$(basename "${OUT_DIR}")"
TMP_DIR="$(mktemp -d "${TMPDIR:-/tmp}/tied-post-session.XXXXXX")"
trap 'rm -rf "${TMP_DIR}"' EXIT

declare -a FAILURES=()

run_step() {
  local label="$1"
  shift
  echo ""
  echo "=== ${label} ==="
  if "$@"; then
    echo "OK: ${label}"
  else
    local rc=$?
    echo "FAIL: ${label} (exit ${rc})" >&2
    FAILURES+=("${label}")
    return 0
  fi
}

resolve_tied_cli() {
  local client_cli="${CLIENT_ROOT}/.cursor/skills/tied-yaml/scripts/tied-cli.sh"
  if [[ -x "${client_cli}" ]]; then
    printf '%s\n' "${client_cli}"
    return 0
  fi
  local bundled="${TIED_SOURCE_ROOT}/tools/bundled-tied-yaml-skill/scripts/tied-cli.sh"
  if [[ -x "${bundled}" ]]; then
    printf '%s\n' "${bundled}"
    return 0
  fi
  echo "ERROR: tied-cli.sh not found under client or TIED source" >&2
  return 1
}

TIED_CLI="$(resolve_tied_cli)"

write_batch_manifest() {
  local manifest="${TMP_DIR}/envelope-batch-inputs.v1.yaml"
  {
    echo "schema_version: envelope-batch-inputs.v1"
    echo "privacy_tier: operator_local"
    echo "include_absolute_paths: false"
    echo "rows:"
    local req
    for req in "${REQ_TOKENS[@]}"; do
      cat <<EOF
  - client_alias: "${CLIENT_ALIAS}"
    project_root: "${CLIENT_ROOT}"
    request_token: "${req}"
    envelope_require_mode: require_envelope
    envelope_artifact: "working/${req}/evidence/request-evidence-envelope.v1.json"
    tied_base_path: "${TIED_BASE}"
EOF
    done
  } >"${manifest}"
  printf '%s\n' "${manifest}"
}

step_metrics() {
  if [[ ! -f "${METRICS_RUBY}" ]]; then
    echo "ERROR: missing ${METRICS_RUBY}" >&2
    return 1
  fi
  if [[ ! -f "${METRICS_FILE}" ]]; then
    echo "DIAGNOSTIC: metrics file absent (${METRICS_FILE}); skipping content" >&2
    {
      echo "status: no_metrics_file"
      echo "metrics_file: ${METRICS_FILE}"
      echo "hint: export TIED_MCP_COLLECT_METRICS=1 and ensure Cursor mcp.json inherits it"
    } >"${OUT_DIR}/mcp-metrics.yaml"
    return 0
  fi
  ruby "${METRICS_RUBY}" \
    --aggregate \
    --project-root "${CLIENT_ROOT}" \
    "${METRICS_FILE}" \
    >"${OUT_DIR}/mcp-metrics.yaml" \
    2>"${OUT_DIR}/mcp-metrics-summary.yaml"
}

step_envelope() {
  if [[ ! -f "${ENVELOPE_BATCH_CLI}" ]]; then
    echo "ERROR: missing ${ENVELOPE_BATCH_CLI}" >&2
    return 1
  fi
  if [[ ${#REQ_TOKENS[@]} -eq 0 && -z "${CORPUS_PATH}" ]]; then
    echo "DIAGNOSTIC: no REQ tokens and no --corpus; skipping envelope gap report" >&2
    return 0
  fi

  local -a cli_args=(
    node "${ENVELOPE_BATCH_CLI}"
    --yaml-out "${OUT_DIR}/envelope-gap-report.v1.yaml"
    --project-root "${CLIENT_ROOT}"
    --privacy-tier operator_local
  )

  if [[ -n "${CORPUS_PATH}" ]]; then
    local corpus_abs="${CORPUS_PATH}"
    if [[ "${corpus_abs}" != /* ]]; then
      corpus_abs="${TIED_SOURCE_ROOT}/${corpus_abs}"
    fi
    if [[ ! -f "${corpus_abs}" ]]; then
      echo "ERROR: corpus not found: ${corpus_abs}" >&2
      return 1
    fi
    cli_args+=(--corpus "${corpus_abs}")
  else
    local manifest
    manifest="$(write_batch_manifest)"
    cli_args+=(--manifest "${manifest}")
  fi

  TIED_BASE_PATH="${TIED_BASE}" "${cli_args[@]}"
}

step_profile() {
  local req
  for req in "${REQ_TOKENS[@]}"; do
    local req_dir="${OUT_DIR}/${req}"
    mkdir -p "${req_dir}"
    local args_file="${TMP_DIR}/profile-${req}.json"
    cat >"${args_file}" <<EOF
{
  "profile_depth": "${PROFILE_DEPTH}",
  "project_root": "${CLIENT_ROOT}",
  "tied_base_path": "${TIED_BASE}",
  "scope": {
    "requirement_tokens": ["${req}"]
  },
  "run_metadata": {
    "run_id": "post-session-${SESSION_STAMP}",
    "environment": {
      "generator": "tied-post-session.sh"
    }
  }
}
EOF
    TIED_BASE_PATH="${TIED_BASE}" \
      TIED_MCP_BIN="${TIED_MCP_BIN}" \
      "${TIED_CLI}" --client "${CLIENT_ALIAS}" \
      evidence_chain_profile_generate "@${args_file}" \
      >"${req_dir}/evidence-chain-profile.v1.json"
  done
}

resolve_reconcile_bin() {
  if [[ -n "${ADHERENCE_RECONCILE_BIN:-}" && -x "${ADHERENCE_RECONCILE_BIN}" ]]; then
    printf '%s\n' "${ADHERENCE_RECONCILE_BIN}"
    return 0
  fi
  local built="${TIED_SOURCE_ROOT}/tools/agentstream/adherence-reconcile"
  if [[ -x "${built}" ]]; then
    printf '%s\n' "${built}"
    return 0
  fi
  printf '%s\n' ""
}

step_reconcile() {
  local reconcile_bin
  reconcile_bin="$(resolve_reconcile_bin)"
  local req
  for req in "${REQ_TOKENS[@]}"; do
    local ledger="${CLIENT_ROOT}/working/${req}/adherence/events.jsonl"
    local tracker="${CLIENT_ROOT}/working/${req}/${req}_tracker.yaml"
    local gates="${CLIENT_ROOT}/working/${req}/gates"
    local req_dir="${OUT_DIR}/${req}"
    mkdir -p "${req_dir}"

    if [[ ! -f "${ledger}" ]]; then
      echo "DIAGNOSTIC: skip reconcile for ${req} (no adherence ledger)" >&2
      continue
    fi
    if [[ ! -f "${tracker}" ]]; then
      echo "DIAGNOSTIC: skip reconcile for ${req} (no tracker at ${tracker})" >&2
      continue
    fi

    local -a recon_args=(
      --ledger "${ledger}"
      --tracker "${tracker}"
      --gates-dir "${gates}"
      --workspace "${CLIENT_ROOT}"
      --requirements-index "${TIED_BASE}/requirements.yaml"
      --implementation-index "${TIED_BASE}/implementation-decisions.yaml"
    )
    local citdp="${TIED_BASE}/citdp/CITDP-${req}.yaml"
    if [[ -f "${citdp}" ]]; then
      recon_args+=(--citdp "${citdp}")
    fi

    if [[ -n "${reconcile_bin}" ]]; then
      "${reconcile_bin}" "${recon_args[@]}" >"${req_dir}/adherence-reconcile.json"
    else
      echo "DIAGNOSTIC: building adherence-reconcile via go run (first run may compile)" >&2
      (
        cd "${TIED_SOURCE_ROOT}/tools/agentstream"
        go run ./cmd/adherence-reconcile "${recon_args[@]}"
      ) >"${req_dir}/adherence-reconcile.json"
    fi
  done
}

step_grammar_v2() {
  if [[ -z "${CORPUS_PATH}" ]]; then
    echo "DIAGNOSTIC: no --corpus; skipping grammar v2 audit" >&2
    return 0
  fi
  local corpus_abs="${CORPUS_PATH}"
  if [[ "${corpus_abs}" != /* ]]; then
    corpus_abs="${TIED_SOURCE_ROOT}/${corpus_abs}"
  fi
  if [[ ! -f "${corpus_abs}" ]]; then
    echo "ERROR: corpus not found: ${corpus_abs}" >&2
    return 1
  fi
  node "${TIED_SOURCE_ROOT}/scripts/run-corpus-grammar-v2-audit.mjs" \
    --corpus "${corpus_abs}" \
    --client-alias "${CLIENT_ALIAS}" \
    >"${OUT_DIR}/grammar-v2-cohort-audit.json"
}

step_hook_log() {
  if [[ ! -f "${HOOK_ANALYZER}" ]]; then
    echo "ERROR: missing ${HOOK_ANALYZER}" >&2
    return 1
  fi
  local log_dir="${HOME}/.cursor/logs"
  local latest
  latest="$(find "${log_dir}" -maxdepth 1 -type f -name 'conv_*.yaml' -print0 2>/dev/null \
    | xargs -0 ls -t 2>/dev/null | head -n 1 || true)"
  if [[ -z "${latest}" ]]; then
    echo "DIAGNOSTIC: no conv_*.yaml under ${log_dir}" >&2
    return 0
  fi
  ruby "${HOOK_ANALYZER}" "${latest}" >"${OUT_DIR}/hook-log-report.yaml"
  printf '%s\n' "${latest}" >"${OUT_DIR}/hook-log-source.txt"
}

write_summary() {
  local summary="${OUT_DIR}/post-session-summary.txt"
  {
    echo "TIED post-session report"
    echo "generated_at: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
    echo "client_root: ${CLIENT_ROOT}"
    echo "client_alias: ${CLIENT_ALIAS}"
    echo "tied_base: ${TIED_BASE}"
    echo "request_tokens: ${REQ_TOKENS[*]:-(none discovered)}"
    echo "output_dir: ${OUT_DIR}"
    echo ""
    echo "Artifacts:"
    [[ -f "${OUT_DIR}/mcp-metrics.yaml" ]] && echo "  - mcp-metrics.yaml (+ mcp-metrics-summary.yaml when metrics exist)"
    [[ -f "${OUT_DIR}/envelope-gap-report.v1.yaml" ]] && echo "  - envelope-gap-report.v1.yaml"
    local req
    for req in "${REQ_TOKENS[@]}"; do
      [[ -f "${OUT_DIR}/${req}/evidence-chain-profile.v1.json" ]] && echo "  - ${req}/evidence-chain-profile.v1.json"
      [[ -f "${OUT_DIR}/${req}/adherence-reconcile.json" ]] && echo "  - ${req}/adherence-reconcile.json"
    done
    [[ -f "${OUT_DIR}/hook-log-report.yaml" ]] && echo "  - hook-log-report.yaml"
    echo ""
    if [[ ${#FAILURES[@]} -gt 0 ]]; then
      echo "Failures:"
      local failure
      for failure in "${FAILURES[@]}"; do
        echo "  - ${failure}"
      done
    else
      echo "Failures: none"
    fi
    echo ""
    echo "Next steps:"
    echo "  ruby ${METRICS_RUBY} --aggregate ${METRICS_FILE} 2>/tmp/tied-mcp-aggregate.yaml"
    echo "  tied_validate_consistency via tied-cli (client project)"
    echo "  See tied/docs/request-evidence-envelope.md and tied/docs/evidence-chain-profile.md"
  } >"${summary}"
  cat "${summary}"
}

echo "DIAGNOSTIC: tied-post-session client=${CLIENT_ROOT} out=${OUT_DIR}"

if [[ "${SKIP_METRICS}" -eq 0 ]]; then
  run_step "MCP usage metrics" step_metrics
fi

if [[ "${SKIP_ENVELOPE}" -eq 0 ]]; then
  run_step "Envelope gap report" step_envelope
fi

if [[ "${SKIP_GRAMMAR_V2}" -eq 0 && -n "${CORPUS_PATH}" ]]; then
  run_step "Grammar v2 cohort audit" step_grammar_v2
fi

if [[ "${SKIP_PROFILE}" -eq 0 && ${#REQ_TOKENS[@]} -gt 0 ]]; then
  run_step "Evidence chain profile" step_profile
fi

if [[ "${SKIP_RECONCILE}" -eq 0 && ${#REQ_TOKENS[@]} -gt 0 ]]; then
  run_step "Adherence reconciliation" step_reconcile
fi

if [[ "${WITH_HOOK_LOG}" -eq 1 ]]; then
  run_step "Hook log analysis (newest conv_*.yaml)" step_hook_log
fi

write_summary

if [[ ${#FAILURES[@]} -gt 0 ]]; then
  exit 1
fi
