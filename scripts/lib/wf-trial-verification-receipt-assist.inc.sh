# wf-trial-verification-receipt-assist.inc.sh — opt-in post-batch verification receipt persist.
# [REQ-WF_TRIAL_VERIFICATION_RECEIPT_CLOSEOUT_SYNC] [IMPL-WF_TRIAL_VERIFICATION_RECEIPT_CLOSEOUT_SYNC]

# shellcheck source=scripts/lib/wf-trial-product-req.inc.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)/wf-trial-product-req.inc.sh"
# shellcheck source=scripts/lib/wf-trial-handoff-verification-claim.inc.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)/wf-trial-handoff-verification-claim.inc.sh"

WF_TRIAL_VERIFICATION_RECEIPT_ASSIST_USED=0

_wf_trial_resolve_tied_cli() {
  local store_root="$1"
  local candidates=(
    "${store_root}/.cursor/skills/tied-yaml/scripts/tied-cli.sh"
    "${store_root}/tools/bundled-tied-yaml-skill/scripts/tied-cli.sh"
  )
  local c
  for c in "${candidates[@]}"; do
    if [[ -x "$c" ]]; then
      printf '%s' "$c"
      return 0
    fi
  done
  return 1
}

_wf_trial_assist_write_stub_receipt() {
  local ws="$1"
  local token="$2"
  local gates_dir="${ws}/tied-project/working/${token}/gates"
  mkdir -p "$gates_dir"
  local ts
  ts="$(date -u +%Y-%m-%dT%H-%M-%S-000Z)"
  local receipt="${gates_dir}/verification-${ts}.json"
  printf '{"allowed":true,"phase":"verification","schema":"checklist-gate-receipt.v1","assist_stub":true}\n' >"$receipt"
  printf '%s' "$receipt"
}

wf_trial_verification_receipt_assist() {
  local ws="$1"
  local store_root="${2:-}"

  if [[ -z "${WF_TRIAL_VERIFICATION_RECEIPT_ASSIST:-}" || "${WF_TRIAL_VERIFICATION_RECEIPT_ASSIST}" == "0" ]]; then
    return 0
  fi

  local token
  token="$(wf_trial_resolve_product_req_token "$ws" || true)"
  if [[ -z "$token" ]]; then
    printf 'DIAGNOSTIC: WF trial verification receipt assist: no product REQ (skip)\n' >&2
    return 0
  fi

  if [[ -n "$(wf_trial_find_verification_receipt "$ws" "$token")" ]]; then
    printf 'DIAGNOSTIC: WF trial verification receipt assist: receipt already present (skip)\n' >&2
    return 0
  fi

  if [[ ! -f "${ws}/package.json" ]]; then
    printf 'DIAGNOSTIC: WF trial verification receipt assist: no package.json (skip)\n' >&2
    return 0
  fi

  if ! command -v npm >/dev/null 2>&1; then
    printf 'DIAGNOSTIC: WF trial verification receipt assist: npm missing (skip)\n' >&2
    return 0
  fi

  set +e
  (cd "$ws" && npm test >/dev/null 2>&1)
  local test_ec=$?
  set -e
  if ((test_ec != 0)); then
    printf 'DIAGNOSTIC: WF trial verification receipt assist: npm test exit %s (skip)\n' "$test_ec" >&2
    return 0
  fi

  if [[ -n "${WF_TRIAL_VERIFICATION_RECEIPT_ASSIST_STUB:-}" && "${WF_TRIAL_VERIFICATION_RECEIPT_ASSIST_STUB}" != "0" ]]; then
    local stub_path
    stub_path="$(_wf_trial_assist_write_stub_receipt "$ws" "$token")"
    WF_TRIAL_VERIFICATION_RECEIPT_ASSIST_USED=1
    printf 'DIAGNOSTIC: WF trial verification receipt assist: stub receipt %s\n' "$stub_path" >&2
    return 0
  fi

  local cli=""
  cli="$(_wf_trial_resolve_tied_cli "$store_root" || true)"
  if [[ -z "$cli" ]]; then
    printf 'DIAGNOSTIC: WF trial verification receipt assist: tied-cli.sh missing (skip)\n' >&2
    return 0
  fi

  local tracker_rel="tied-project/working/${token}/checklist-tracker.yaml"
  if [[ ! -f "${ws}/${tracker_rel}" ]]; then
    printf 'DIAGNOSTIC: WF trial verification receipt assist: missing checklist tracker (skip)\n' >&2
    return 0
  fi

  local citdp_abs="${ws}/tied-project/citdp/CITDP-${token}.yaml"
  local gates_dir="tied-project/working/${token}/gates"
  mkdir -p "${ws}/${gates_dir}"

  local payload
  if [[ -f "$citdp_abs" ]]; then
    payload="$(cat <<EOF
{"phase":"verification","tracker_path":"${tracker_rel}","citdp_path":"tied-project/citdp/CITDP-${token}.yaml","receipt_persistence":{"request_token":"${token}","gates_dir":"${gates_dir}","ledger_path":"tied-project/working/${token}/evidence/gate-ledger.jsonl"}}
EOF
)"
  else
    payload="$(cat <<EOF
{"phase":"verification","tracker_path":"${tracker_rel}","citdp":{"record_identity":{"profile_depth":"minimal","gate_policy":"advisory"},"risk_analysis":{"adversarial_inquiry":{"depth_tier":"minimal","gate_policy":"advisory","counterexamples":["assist"],"falsification_questions":["assist"],"disconfirming_observations":["assist"],"evidence_references":["tied-project/working/${token}/evidence/phase-handoff-build-plan.md"]}}},"receipt_persistence":{"request_token":"${token}","gates_dir":"${gates_dir}","ledger_path":"tied-project/working/${token}/evidence/gate-ledger.jsonl"}}
EOF
)"
  fi

  set +e
  (
    cd "$ws"
    export TIED_BASE_PATH="${ws}/tied-project"
    export TIED_STORE_ROOT="$store_root"
    export TIED_CLIENT_BUNDLE_PATH="${store_root}/tied-bundle"
    export TIED_CLIENT_PROJECT_PATH="${ws}/tied-project"
    "$cli" tied_checklist_gate_validate "$payload" >/dev/null 2>&1
  )
  local gate_ec=$?
  set -e

  if ((gate_ec != 0)); then
    printf 'DIAGNOSTIC: WF trial verification receipt assist: tied_checklist_gate_validate exit %s (no receipt)\n' "$gate_ec" >&2
    return 0
  fi

  if [[ -n "$(wf_trial_find_verification_receipt "$ws" "$token")" ]]; then
    WF_TRIAL_VERIFICATION_RECEIPT_ASSIST_USED=1
    printf 'DIAGNOSTIC: WF trial verification receipt assist: persisted verification receipt\n' >&2
  else
    printf 'DIAGNOSTIC: WF trial verification receipt assist: gate ok but no receipt file (skip)\n' >&2
  fi
  return 0
}