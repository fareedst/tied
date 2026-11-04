# wf-trial-four-phase-hardening.inc.sh — disposable preload + store MCP dist preflight.
# [REQ-WF_TRIAL_FOUR_PHASE_HARDENING] [IMPL-WF_TRIAL_FOUR_PHASE_HARDENING]

materialize_disposable_preload_contract() {
  local ws="$1"
  local dest="${ws}/tied-project/agent-preload-contract.yaml"
  local template="${ws}/tied-bundle/docs/agent-preload-contract-template.yaml"

  if [[ -f "$dest" && -r "$dest" ]]; then
    printf 'DIAGNOSTIC: preload contract exists: %s\n' "$dest" >&2
    return 0
  fi
  if [[ ! -f "$template" || ! -r "$template" ]]; then
    printf 'DIAGNOSTIC: preload template missing: %s\n' "$template" >&2
    return 0
  fi
  mkdir -p "${ws}/tied-project"
  cp "$template" "$dest"
  printf 'DIAGNOSTIC: materialized preload contract: %s\n' "$dest" >&2
  return 0
}

wf_trial_reconcile_preflight() {
  local store_root="$1"

  if [[ -n "${WF_TRIAL_SKIP_RECONCILE_PREFLIGHT:-}" && "${WF_TRIAL_SKIP_RECONCILE_PREFLIGHT}" != "0" ]]; then
    return 0
  fi

  local dist="${store_root}/mcp-server/dist/index.js"
  if [[ -f "$dist" && -r "$dist" ]]; then
    return 0
  fi

  printf 'DIAGNOSTIC: WF trial reconcile preflight: mcp dist missing at %s; run ./build-workspace.sh from store root or set WF_TRIAL_SKIP_RECONCILE_PREFLIGHT=1\n' "$dist" >&2
  if [[ -n "${WF_TRIAL_STRICT_RECONCILE:-}" && "${WF_TRIAL_STRICT_RECONCILE}" != "0" ]]; then
    printf 'ERROR: WF trial reconcile preflight blocked (WF_TRIAL_STRICT_RECONCILE=%s)\n' "${WF_TRIAL_STRICT_RECONCILE}" >&2
    return 1
  fi
  return 0
}
