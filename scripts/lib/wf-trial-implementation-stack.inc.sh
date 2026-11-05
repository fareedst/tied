# wf-trial-implementation-stack.inc.sh — TypeScript stack seed + WF preload for matrix trials.
# [REQ-WF_TRIAL_IMPLEMENTATION_STACK] [IMPL-WF_TRIAL_IMPLEMENTATION_STACK]

wf_trial_implementation_stack_enabled() {
  if [[ -n "${WF_TRIAL_SKIP_IMPLEMENTATION_STACK:-}" && "${WF_TRIAL_SKIP_IMPLEMENTATION_STACK}" != "0" ]]; then
    return 1
  fi
  return 0
}

seed_wf_trial_typescript_stack() {
  local ws="$1"
  local store_root="$2"
  local fixture="${store_root}/tools/bootstrap/fixtures/wf-trial-typescript-stack"

  if [[ ! -d "$fixture" ]]; then
    printf 'DIAGNOSTIC: WF trial stack fixture missing: %s\n' "$fixture" >&2
    return 0
  fi

  local rel
  for rel in package.json tsconfig.json src/.gitkeep; do
    local src="${fixture}/${rel}"
    local dest="${ws}/${rel}"
    if [[ ! -f "$src" ]]; then
      printf 'DIAGNOSTIC: WF trial stack fixture file missing: %s\n' "$src" >&2
      continue
    fi
    if [[ -f "$dest" ]]; then
      printf 'DIAGNOSTIC: WF trial stack seed skip (exists): %s\n' "$dest" >&2
      continue
    fi
    mkdir -p "$(dirname "$dest")"
    cp "$src" "$dest"
    printf 'DIAGNOSTIC: WF trial stack seeded: %s\n' "$dest" >&2
  done
  return 0
}

materialize_wf_trial_preload_contract() {
  local ws="$1"
  local store_root="${2:-}"
  local dest="${ws}/tied-project/agent-preload-contract.yaml"
  local src="${ws}/tied-bundle/docs/wf-trial-agent-preload-contract.yaml"

  if [[ -f "$dest" && -r "$dest" ]]; then
    printf 'DIAGNOSTIC: preload contract exists: %s\n' "$dest" >&2
    return 0
  fi
  if [[ ! -f "$src" && -n "$store_root" ]]; then
    src="${store_root}/tied-bundle/docs/wf-trial-agent-preload-contract.yaml"
  fi
  if [[ ! -f "$src" || ! -r "$src" ]]; then
    printf 'DIAGNOSTIC: WF trial preload source missing: %s\n' "$src" >&2
    return 0
  fi
  mkdir -p "${ws}/tied-project"
  cp "$src" "$dest"
  printf 'DIAGNOSTIC: materialized WF trial preload contract: %s\n' "$dest" >&2
  return 0
}

wf_trial_apply_implementation_stack() {
  local ws="$1"
  local store_root="$2"

  if ! wf_trial_implementation_stack_enabled; then
    printf 'DIAGNOSTIC: WF_TRIAL_SKIP_IMPLEMENTATION_STACK=1; skipping stack seed and WF preload\n' >&2
    return 0
  fi
  seed_wf_trial_typescript_stack "$ws" "$store_root"
  materialize_wf_trial_preload_contract "$ws" "$store_root"
  return 0
}
