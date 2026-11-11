# wf-trial-proof-manifest-gate.inc.sh — orchestrator L3 post-four-phase gate (default on).
# [REQ-WF_TRIAL_RANGE_PROOF_MANIFEST_MANDATE] [IMPL-WF_TRIAL_RANGE_PROOF_MANIFEST_MANDATE]

_wf_trial_proof_manifest_gate_default_diag_emitted=0

wf_trial_proof_manifest_gate_enabled() {
  if [[ -n "${WF_TRIAL_SKIP_PROOF_MANIFEST:-}" && "${WF_TRIAL_SKIP_PROOF_MANIFEST}" != "0" ]]; then
    printf 'DIAGNOSTIC: WF_TRIAL_SKIP_PROOF_MANIFEST=1; proof manifest gate skipped\n' >&2
    return 1
  fi
  if [[ "${_wf_trial_proof_manifest_gate_default_diag_emitted:-0}" -eq 0 ]]; then
    _wf_trial_proof_manifest_gate_default_diag_emitted=1
    printf 'DIAGNOSTIC: WF trial proof manifest gate: default on (all PROMPT-WF; use WF_TRIAL_SKIP_PROOF_MANIFEST=1 to skip)\n' >&2
  fi
  return 0
}

# G5 Option B: all PROMPT-WF-01..12 when gate is enabled.
wf_trial_proof_manifest_gate_applies() {
  local wf_norm="$1"
  [[ "$wf_norm" =~ ^WF-(0[1-9]|1[0-2])$ ]]
}

wf_trial_seed_proof_manifest_scaffold() {
  local ws="$1"
  local wf_norm="$2"
  local store_root="$3"
  local dest_rel="tied-project/working/proof-facet-manifest/evidence/proof-facet-manifest.v1.json"
  local dest="${ws}/${dest_rel}"
  local template="${store_root}/tied-bundle/templates/proof-facet-manifest.v1.template.json"

  if [[ -f "$dest" ]]; then
    printf 'DIAGNOSTIC: proof manifest scaffold skip (exists): %s\n' "$dest" >&2
    return 0
  fi
  if [[ ! -f "$template" ]]; then
    printf 'DIAGNOSTIC: proof manifest template missing: %s\n' "$template" >&2
    return 0
  fi
  mkdir -p "$(dirname "$dest")"
  if command -v node >/dev/null 2>&1; then
    node -e '
      const fs = require("fs");
      const wf = process.argv[1];
      const src = process.argv[2];
      const dest = process.argv[3];
      const doc = JSON.parse(fs.readFileSync(src, "utf8"));
      doc.prompt_id = "PROMPT-" + wf;
      fs.writeFileSync(dest, JSON.stringify(doc, null, 2) + "\n");
    ' "${wf_norm}" "$template" "$dest"
  else
    cp "$template" "$dest"
  fi
  printf 'DIAGNOSTIC: proof manifest scaffold seeded: %s (agent must complete files[] before close-out)\n' "$dest" >&2
  return 0
}

wf_trial_proof_manifest_gate_check() {
  local ws="$1"
  local wf_norm="$2"
  local store_root="$3"

  if ! wf_trial_proof_manifest_gate_enabled; then
    return 0
  fi
  if ! wf_trial_proof_manifest_gate_applies "$wf_norm"; then
    return 0
  fi

  local helper="${store_root}/tools/bootstrap/lib/wf-trial-proof-manifest-gate.mjs"
  if [[ ! -f "$helper" ]]; then
    printf 'ERROR: WF trial proof manifest gate: helper missing %s\n' "$helper" >&2
    return 1
  fi
  node "$helper" --workspace "$ws" --wf-id "$wf_norm" --repo-root "$store_root"
}
