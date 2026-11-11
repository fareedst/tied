# wf-trial-phase-handoff-gate.inc.sh — post-four-phase handoff fail-closed gate.
# [REQ-WF_TRIAL_PHASE_HANDOFF_GATE] [IMPL-WF_TRIAL_PHASE_HANDOFF_GATE]

# shellcheck source=scripts/lib/wf-trial-product-req.inc.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)/wf-trial-product-req.inc.sh"

_wf_trial_phase_handoff_gate_default_diag_emitted=0

wf_trial_phase_handoff_gate_enabled() {
  if [[ -n "${WF_TRIAL_SKIP_PHASE_HANDOFF_GATE:-}" && "${WF_TRIAL_SKIP_PHASE_HANDOFF_GATE}" != "0" ]]; then
    printf 'DIAGNOSTIC: WF_TRIAL_SKIP_PHASE_HANDOFF_GATE=1; phase handoff gate skipped\n' >&2
    return 1
  fi
  if [[ "${_wf_trial_phase_handoff_gate_default_diag_emitted:-0}" -eq 0 ]]; then
    _wf_trial_phase_handoff_gate_default_diag_emitted=1
    printf 'DIAGNOSTIC: WF trial phase handoff gate: default on (use WF_TRIAL_SKIP_PHASE_HANDOFF_GATE=1 to skip)\n' >&2
  fi
  return 0
}

wf_trial_count_colocated_test_files() {
  local ws="$1"
  local src="${ws}/src"
  [[ -d "$src" ]] || {
    printf '0'
    return 0
  }
  find "$src" -type f -name '*.test.ts' 2>/dev/null | wc -l | tr -d ' '
}

wf_trial_phase_handoff_gate_check() {
  local ws="$1"
  local _store_root="${2:-}"

  if ! wf_trial_phase_handoff_gate_enabled; then
    return 0
  fi

  local token
  token="$(wf_trial_resolve_product_req_token "$ws" || true)"
  if [[ -z "$token" ]]; then
    wf_trial_diagnose_product_req_resolve_failure "$ws"
    printf 'ERROR: WF trial phase handoff gate: could not resolve product REQ from working folder\n' >&2
    return 1
  fi

  local ev="${ws}/tied-project/working/${token}/evidence"
  local -a required=(
    "${ev}/phase-handoff-add-feature.md"
    "${ev}/phase-handoff-refine-plan.md"
    "${ev}/phase-handoff-build-plan.md"
  )
  local f
  for f in "${required[@]}"; do
    if [[ ! -f "$f" ]]; then
      printf 'ERROR: WF trial phase handoff gate: missing %s\n' "$f" >&2
      return 1
    fi
  done

  if [[ -f "${ws}/package.json" ]]; then
    local test_count
    test_count="$(wf_trial_count_colocated_test_files "$ws")"
    if [[ "${test_count:-0}" -lt 1 ]]; then
      printf 'ERROR: WF trial phase handoff gate: expected at least one src/**/*.test.ts (found %s)\n' "${test_count:-0}" >&2
      return 1
    fi
    if command -v npm >/dev/null 2>&1; then
      set +e
      (cd "$ws" && npm test --silent >/dev/null 2>&1)
      local test_ec=$?
      set -e
      if ((test_ec != 0)); then
        printf 'ERROR: WF trial phase handoff gate: npm test did not pass (exit %s)\n' "$test_ec" >&2
        return 1
      fi
    else
      printf 'DIAGNOSTIC: WF trial phase handoff gate: npm not on PATH; test file count ok\n' >&2
    fi
  fi

  return 0
}

wf_trial_strict_closeout_preflight_check() {
  local ws="$1"
  local _store_root="${2:-}"

  if [[ -z "${WF_TRIAL_STRICT_CLOSEOUT_PREFLIGHT:-}" || "${WF_TRIAL_STRICT_CLOSEOUT_PREFLIGHT}" == "0" ]]; then
    return 0
  fi

  local token
  token="$(wf_trial_resolve_product_req_token "$ws" || true)"
  if [[ -z "$token" ]]; then
    printf 'ERROR: WF trial strict closeout preflight: no product REQ\n' >&2
    return 1
  fi

  local citdp="${ws}/tied-project/citdp/CITDP-${token}.yaml"
  if [[ ! -f "$citdp" ]]; then
    printf 'ERROR: WF trial strict closeout preflight: missing %s\n' "$citdp" >&2
    return 1
  fi

  local gates_dir="${ws}/tied-project/working/${token}/gates"
  if [[ -d "$gates_dir" ]]; then
    local ver_receipt
    ver_receipt="$(find "$gates_dir" -maxdepth 1 -name 'verification-*.json' 2>/dev/null | head -n 1)"
    local build_handoff="${ws}/tied-project/working/${token}/evidence/phase-handoff-build-plan.md"
    if [[ -f "$build_handoff" ]] && grep -qi 'verification' "$build_handoff" && [[ -z "$ver_receipt" ]]; then
      printf 'ERROR: WF trial strict closeout preflight: build handoff mentions verification but no gates/verification-*.json\n' >&2
      return 1
    fi
  fi

  return 0
}
