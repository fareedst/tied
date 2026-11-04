#!/usr/bin/env bash
# [REQ-CLAUDE_WF03_LIVE_MATRIX_GAPS] [IMPL-CLAUDE_WF03_LIVE_MATRIX_GAPS]
# Read-only compare envelope identity.depth_tier vs working CITDP draft (WF_TRIAL_ENVELOPE_DEPTH_DIAGNOSTIC).

wf_trial_envelope_depth_diagnostic() {
  local client_root="$1"
  [[ -n "$client_root" && -d "$client_root" ]] || return 0
  local working_root="${client_root}/tied-project/working"
  [[ -d "$working_root" ]] || working_root="${client_root}/working"
  [[ -d "$working_root" ]] || return 0

  local req_dir envelope citdp_file
  for req_dir in "$working_root"/*; do
    [[ -d "$req_dir" ]] || continue
    envelope="${req_dir}/evidence/request-evidence-envelope.v1.json"
    [[ -f "$envelope" ]] || continue
    local req_token
    req_token="$(basename "$req_dir")"
    citdp_file=""
    for f in "${req_dir}"/CITDP-"${req_token}".yaml "${req_dir}"/CITDP-"${req_token}"-draft.yaml "${req_dir}"/CITDP-*.yaml; do
      [[ -f "$f" ]] || continue
      citdp_file="$f"
      break
    done
    [[ -n "$citdp_file" ]] || continue

    local env_depth citdp_depth
    env_depth="$(node -e "
      const fs=require('fs');
      const e=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));
      process.stdout.write(String(e.identity?.depth_tier??''));
    " "$envelope" 2>/dev/null || true)"
    citdp_depth="$(
      (
        cd "${REPO_ROOT:-.}/mcp-server" 2>/dev/null || exit 0
        node --input-type=module -e "
          import fs from 'node:fs';
          import yaml from 'js-yaml';
          const raw = yaml.load(fs.readFileSync(process.argv[1], 'utf8'));
          const keys = Object.keys(raw ?? {});
          const inner =
            keys.length === 1 && typeof raw[keys[0]] === 'object' ? raw[keys[0]] : raw;
          const ai = inner?.risk_analysis?.adversarial_inquiry ?? inner?.adversarial_inquiry ?? {};
          const d = ai.depth_tier ?? inner?.depth_tier ?? '';
          process.stdout.write(String(d));
        " "$citdp_file"
      ) 2>/dev/null || true
    )"
    if [[ -n "$env_depth" && -n "$citdp_depth" && "$env_depth" != "$citdp_depth" ]]; then
      printf 'DIAGNOSTIC: WF_TRIAL_ENVELOPE_DEPTH_MISMATCH request=%s envelope_depth=%s citdp_depth=%s envelope=%s citdp=%s\n' \
        "$req_token" "$env_depth" "$citdp_depth" "$envelope" "$citdp_file" >&2
    fi
  done
  return 0
}
