# wf-trial-machine-closeout-exit.inc.sh — post-four-phase machine closeout fail-closed (default on).
# [REQ-WF_TRIAL_DISPOSABLE_GATE_ALIGNMENT] [IMPL-WF_TRIAL_DISPOSABLE_GATE_ALIGNMENT]

# shellcheck source=scripts/lib/wf-trial-product-req.inc.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)/wf-trial-product-req.inc.sh"

_wf_trial_machine_closeout_default_diag_emitted=0

wf_trial_machine_closeout_exit_enabled() {
  if [[ -n "${WF_TRIAL_SKIP_MACHINE_CLOSEOUT_EXIT:-}" && "${WF_TRIAL_SKIP_MACHINE_CLOSEOUT_EXIT}" != "0" ]]; then
    printf 'DIAGNOSTIC: WF_TRIAL_SKIP_MACHINE_CLOSEOUT_EXIT=1; machine closeout exit check skipped\n' >&2
    return 1
  fi
  if [[ "${_wf_trial_machine_closeout_default_diag_emitted:-0}" -eq 0 ]]; then
    _wf_trial_machine_closeout_default_diag_emitted=1
    printf 'DIAGNOSTIC: WF trial machine closeout exit check: default on (use WF_TRIAL_SKIP_MACHINE_CLOSEOUT_EXIT=1 to skip)\n' >&2
  fi
  return 0
}

_wf_trial_machine_closeout_inventory_incomplete() {
  local inv_path="$1"
  [[ -f "$inv_path" ]] || return 1
  if ! command -v node >/dev/null 2>&1; then
    printf 'DIAGNOSTIC: WF trial machine closeout: node missing; skip inventory parse\n' >&2
    return 1
  fi
  node -e '
    const fs = require("fs");
    const p = process.argv[1];
    let doc;
    try {
      doc = JSON.parse(fs.readFileSync(p, "utf8"));
    } catch {
      process.exit(2);
    }
    const st = doc?.close_out_turn?.status;
    if (typeof st === "string" && st.toLowerCase() === "incomplete") process.exit(0);
    process.exit(1);
  ' "$inv_path"
}

_wf_trial_gate_receipt_allowed_true() {
  local receipt="$1"
  [[ -f "$receipt" ]] || return 1
  grep -q '"allowed"[[:space:]]*:[[:space:]]*true' "$receipt"
}

wf_trial_machine_closeout_exit_check() {
  local ws="$1"
  local _store_root="${2:-}"

  if ! wf_trial_machine_closeout_exit_enabled; then
    return 0
  fi

  local token
  token="$(wf_trial_resolve_product_req_token "$ws" || true)"
  if [[ -z "$token" ]]; then
    printf 'DIAGNOSTIC: WF trial machine closeout: no product REQ (skip)\n' >&2
    return 0
  fi

  local ev="${ws}/tied-project/working/${token}/evidence"
  local inventory="${ev}/trial-workflow-interaction-inventory.v1.json"
  if [[ -f "$inventory" ]]; then
  set +e
    _wf_trial_machine_closeout_inventory_incomplete "$inventory"
    local inv_ec=$?
  set -e
    if ((inv_ec == 0)); then
      printf 'DIAGNOSTIC: wf_trial_machine_closeout_reason=close_out_turn_incomplete\n' >&2
      printf 'ERROR: WF trial machine closeout exit: inventory close_out_turn.status incomplete\n' >&2
      return 1
    fi
  fi

  local gates_dir="${ws}/tied-project/working/${token}/gates"
  local close_receipt=""
  if [[ -d "$gates_dir" ]]; then
    close_receipt="$(find "$gates_dir" -maxdepth 1 -name 'close_out-*.json' 2>/dev/null | head -n 1)"
    if [[ -n "$close_receipt" ]] && _wf_trial_gate_receipt_allowed_true "$close_receipt"; then
      return 0
    fi
    if [[ -z "$close_receipt" ]]; then
      printf 'DIAGNOSTIC: wf_trial_machine_closeout_reason=no_close_out_gate_receipt\n' >&2
      printf 'ERROR: WF trial machine closeout exit: no gates/close_out-*.json with allowed true\n' >&2
      return 1
    fi
    printf 'DIAGNOSTIC: wf_trial_machine_closeout_reason=close_out_gate_not_allowed\n' >&2
    printf 'ERROR: WF trial machine closeout exit: close_out receipt present but allowed is not true\n' >&2
    return 1
  fi

  local build_handoff="${ev}/phase-handoff-build-plan.md"
  if [[ -f "$build_handoff" ]] && grep -qi 'verification' "$build_handoff"; then
    local ver_receipt=""
    if [[ -d "$gates_dir" ]]; then
      ver_receipt="$(find "$gates_dir" -maxdepth 1 -name 'verification-*.json' 2>/dev/null | head -n 1)"
    fi
    if [[ -z "$ver_receipt" ]]; then
      printf 'DIAGNOSTIC: wf_trial_machine_closeout_reason=verification_handoff_without_receipt\n' >&2
      printf 'ERROR: WF trial machine closeout exit: build handoff mentions verification but no gates/verification-*.json\n' >&2
      return 1
    fi
  fi

  printf 'DIAGNOSTIC: wf_trial_machine_closeout_reason=no_close_out_gate_receipt\n' >&2
  printf 'ERROR: WF trial machine closeout exit: no gates/close_out-*.json with allowed true\n' >&2
  return 1
}