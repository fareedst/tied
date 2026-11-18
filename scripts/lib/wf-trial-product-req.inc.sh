# wf-trial-product-req.inc.sh — resolve disposable product REQ from phase-1 handoff.
# [REQ-WF_TRIAL_MINIMAL_CHECKLIST_PLAYBOOK] [IMPL-WF_TRIAL_MINIMAL_CHECKLIST_PLAYBOOK]
# [REQ-WF_TRIAL_PHASE_HANDOFF_GATE] [IMPL-WF_TRIAL_PHASE_HANDOFF_GATE]

wf_trial_working_dir_excluded() {
  local base
  base="$(basename "$1")"
  case "$base" in
    wf-trial-orchestrator-run | proof-facet-manifest) return 0 ;;
    FACILITATOR-*) return 0 ;;
  esac
  return 1
}

wf_trial_parse_req_from_handoff() {
  local handoff="$1"
  [[ -f "$handoff" && -r "$handoff" ]] || return 1
  gawk '
    {
      if (match($0, /request_token:\s*`?(REQ-[A-Za-z0-9_-]+)`?/, m)) { print m[1]; exit }
      if (match($0, /\*\*request_token:\*\*\s*`?(REQ-[A-Za-z0-9_-]+)`?/, m)) { print m[1]; exit }
      if (match($0, /REQ token[:\s]+\|?[[:space:]]*`?(REQ-[A-Za-z0-9_-]+)`?/, m)) { print m[1]; exit }
      if (match($0, /\|[[:space:]]*REQ token[[:space:]]*\|[^|]*\|[[:space:]]*`?(REQ-[A-Za-z0-9_-]+)`?/, m)) { print m[1]; exit }
      if (match($0, /\|[[:space:]]*REQ[[:space:]]*\|[^|]*\|[[:space:]]*`?(REQ-[A-Za-z0-9_-]+)`?/, m)) { print m[1]; exit }
      if (match($0, /`(REQ-[A-Za-z0-9_-]+)`/, m)) { print m[1]; exit }
    }
  ' "$handoff"
}

wf_trial_parse_req_from_plan() {
  local plan="$1"
  [[ -f "$plan" && -r "$plan" ]] || return 1
  gawk '
    {
      if (match($0, /\*\*Request token[^*]*\*\*[^`]*`(REQ-[A-Za-z0-9_-]+)`/, m)) { print m[1]; exit }
      if (match($0, /^Request token \(product\):[[:space:]]*(REQ-[A-Za-z0-9_-]+)/, m)) { print m[1]; exit }
      if (match($0, /^Request token:[[:space:]]*(REQ-[A-Za-z0-9_-]+)/, m)) { print m[1]; exit }
      if (match($0, /`(REQ-[A-Za-z0-9_-]+)`/, m)) { print m[1]; exit }
    }
  ' "$plan"
}

wf_trial_diagnose_product_req_resolve_failure() {
  local ws="$1"
  local working="${ws}/tied-project/working"
  [[ -d "$working" ]] || {
    printf 'DIAGNOSTIC: WF trial product REQ resolve: no tied-project/working directory\n' >&2
    return 0
  }

  local -a names=()
  local d base handoff parse_only
  for d in "$working"/*; do
    [[ -e "$d" ]] || continue
    base="$(basename "$d")"
    names+=("$base")
  done

  local max=12
  local i=0
  printf 'DIAGNOSTIC: WF trial product REQ resolve: working children (max %s):\n' "$max" >&2
  for base in "${names[@]}"; do
    ((i >= max)) && break
    printf 'DIAGNOSTIC:   - %s\n' "$base" >&2
    ((i++)) || true
  done

  for d in "$working"/*; do
    [[ -d "$d" ]] || continue
    wf_trial_working_dir_excluded "$d" && continue
    handoff="${d}/evidence/phase-handoff-add-feature.md"
    [[ -f "$handoff" ]] || continue
    parse_only="$(wf_trial_parse_req_from_handoff "$handoff" || true)"
    base="$(basename "$d")"
    if [[ -z "$parse_only" && ! "$base" =~ ^REQ- ]]; then
      printf 'DIAGNOSTIC: WF trial product REQ resolve: found-unparsed: %s\n' "$handoff" >&2
    fi
  done

  printf 'DIAGNOSTIC: WF trial product REQ resolve: ensure turn-1 handoff has request_token: REQ-… or working folder name REQ-*\n' >&2
}

wf_trial_resolve_product_req_token() {
  local ws="$1"
  local working="${ws}/tied-project/working"
  [[ -d "$working" ]] || return 1

  local best_token="" best_mtime=0
  local d handoff token mtime base
  for d in "$working"/*; do
    [[ -d "$d" ]] || continue
    wf_trial_working_dir_excluded "$d" && continue
    handoff="${d}/evidence/phase-handoff-add-feature.md"
    [[ -f "$handoff" ]] || continue
    token="$(wf_trial_parse_req_from_handoff "$handoff" || true)"
    if [[ -z "$token" ]]; then
      base="$(basename "$d")"
      if [[ "$base" =~ ^REQ- ]]; then
        token="$base"
      fi
    fi
    [[ -n "$token" ]] || continue
    mtime="$(stat -f '%m' "$handoff" 2>/dev/null || stat -c '%Y' "$handoff" 2>/dev/null || echo 0)"
    if ((mtime >= best_mtime)); then
      best_mtime=$mtime
      best_token="$token"
    fi
  done

  if [[ -n "$best_token" ]]; then
    printf '%s' "$best_token"
    return 0
  fi

  local plan
  for d in "$working"/*; do
    [[ -d "$d" ]] || continue
    wf_trial_working_dir_excluded "$d" && continue
    plan="${d}/PLAN.md"
    [[ -f "$plan" ]] || continue
    token="$(wf_trial_parse_req_from_plan "$plan" || true)"
    [[ -n "$token" ]] || continue
    mtime="$(stat -f '%m' "$plan" 2>/dev/null || stat -c '%Y' "$plan" 2>/dev/null || echo 0)"
    if ((mtime >= best_mtime)); then
      best_mtime=$mtime
      best_token="$token"
    fi
  done

  [[ -n "$best_token" ]] || return 1
  printf '%s' "$best_token"
  return 0
}

# [REQ-WF_TRIAL_SLIM_TRACKER_INTER_TURN] [SC-WF-IST-02]
wf_trial_tracker_shape_cli() {
  local store_root="$1"
  printf '%s/tools/bootstrap/lib/wf-trial-tracker-shape.mjs' "$store_root"
}

wf_trial_interleaved_tracker_marker() {
  local ws="$1"
  printf '%s/tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-interleaved-tracker-seed.v1.marker' "$ws"
}

wf_trial_tracker_is_slim_shape() {
  local tracker_path="$1"
  local store_root="$2"
  local cli
  cli="$(wf_trial_tracker_shape_cli "$store_root")"
  [[ -f "$cli" ]] || return 2
  node "$cli" "$tracker_path"
}

wf_trial_reconcile_slim_checklist_tracker() {
  local ws="$1"
  local store_root="$2"
  local token dest_dir dest src backup evidence_dir shape_ec
  token="$(wf_trial_resolve_product_req_token "$ws" || true)"
  if [[ -z "$token" ]]; then
    printf 'DIAGNOSTIC: WF trial slim tracker reconcile: no product REQ (skip)\n' >&2
    return 0
  fi

  dest_dir="${ws}/tied-project/working/${token}"
  dest="${dest_dir}/checklist-tracker.yaml"
  mkdir -p "${dest_dir}/evidence"

  if [[ ! -f "$dest" ]]; then
    materialize_wf_trial_minimal_checklist_tracker "$ws" "$store_root"
    return 0
  fi

  wf_trial_tracker_is_slim_shape "$dest" "$store_root"
  shape_ec=$?
  if [[ "$shape_ec" -eq 0 ]]; then
    printf 'DIAGNOSTIC: WF trial slim tracker reconcile: valid slim shape (no replace): %s\n' "$dest" >&2
    return 0
  fi

  evidence_dir="${dest_dir}/evidence"
  backup="${evidence_dir}/checklist-tracker-agent-replaced.v1.bak"
  cp -f "$dest" "$backup"
  printf 'DIAGNOSTIC: WF trial slim tracker reconcile: backed up agent tracker to %s\n' "$backup" >&2

  src="${store_root}/tied-bundle/templates/wf-trial-minimal-checklist-tracker.yaml"
  if [[ ! -f "$src" && -f "${ws}/tied-bundle/templates/wf-trial-minimal-checklist-tracker.yaml" ]]; then
    src="${ws}/tied-bundle/templates/wf-trial-minimal-checklist-tracker.yaml"
  fi
  if [[ ! -f "$src" ]]; then
    printf 'DIAGNOSTIC: WF trial slim tracker reconcile: template missing: %s\n' "$src" >&2
    return 1
  fi
  sed "s/{{PRODUCT_REQ}}/${token}/g" "$src" >"$dest"
  printf 'DIAGNOSTIC: WF trial slim tracker reconcile: replaced with slim template: %s\n' "$dest" >&2

  mkdir -p "$(dirname "$(wf_trial_interleaved_tracker_marker "$ws")")"
  : >"$(wf_trial_interleaved_tracker_marker "$ws")"
  return 0
}

materialize_wf_trial_minimal_checklist_tracker() {
  local ws="$1"
  local store_root="$2"
  local token
  token="$(wf_trial_resolve_product_req_token "$ws" || true)"
  if [[ -z "$token" ]]; then
    printf 'DIAGNOSTIC: WF trial slim checklist tracker: no product REQ (skip seed)\n' >&2
    return 0
  fi

  local src="${store_root}/tied-bundle/templates/wf-trial-minimal-checklist-tracker.yaml"
  if [[ ! -f "$src" && -f "${ws}/tied-bundle/templates/wf-trial-minimal-checklist-tracker.yaml" ]]; then
    src="${ws}/tied-bundle/templates/wf-trial-minimal-checklist-tracker.yaml"
  fi
  if [[ ! -f "$src" ]]; then
    printf 'DIAGNOSTIC: WF trial slim checklist tracker template missing: %s\n' "$src" >&2
    return 0
  fi

  local dest_dir="${ws}/tied-project/working/${token}"
  local dest="${dest_dir}/checklist-tracker.yaml"
  if [[ -f "$dest" ]]; then
    printf 'DIAGNOSTIC: WF trial slim checklist tracker exists: %s\n' "$dest" >&2
    return 0
  fi
  mkdir -p "$dest_dir"
  sed "s/{{PRODUCT_REQ}}/${token}/g" "$src" >"$dest"
  printf 'DIAGNOSTIC: WF trial slim checklist tracker seeded: %s\n' "$dest" >&2
  return 0
}
