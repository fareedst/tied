# wf-trial-handoff-verification-claim.inc.sh — build-plan handoff verification pass-claim detection.
# [REQ-WF_TRIAL_VERIFICATION_RECEIPT_CLOSEOUT_SYNC] [IMPL-WF_TRIAL_VERIFICATION_RECEIPT_CLOSEOUT_SYNC]

# shellcheck source=scripts/lib/wf-trial-product-req.inc.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)/wf-trial-product-req.inc.sh"

wf_trial_find_verification_receipt() {
  local ws="$1"
  local token="$2"
  local gates_dir="${ws}/tied-project/working/${token}/gates"
  [[ -d "$gates_dir" ]] || return 1
  find "$gates_dir" -maxdepth 1 -name 'verification-*.json' 2>/dev/null | head -n 1
}

# Returns 0 when handoff claims verification pass but no verification receipt on disk (Tier A signal).
wf_trial_handoff_claims_verification_pass_without_receipt() {
  local ws="$1"
  local token="$2"

  local handoff="${ws}/tied-project/working/${token}/evidence/phase-handoff-build-plan.md"
  [[ -f "$handoff" ]] || return 1

  if [[ -n "$(wf_trial_find_verification_receipt "$ws" "$token")" ]]; then
    return 1
  fi

  if ! command -v node >/dev/null 2>&1; then
    printf 'DIAGNOSTIC: WF trial handoff claim: node missing; skip parse\n' >&2
    return 1
  fi

  node -e '
    const fs = require("fs");
    const path = require("path");
    const [handoffPath, ws] = process.argv.slice(1);
    const body = fs.readFileSync(handoffPath, "utf8");
    const wsRoot = ws;

    const fmMatch = body.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (fmMatch) {
      const fm = fmMatch[1];
      if (/^verification_receipt_status:\s*(deferred|not_run)\s*$/im.test(fm)) {
        process.exit(1);
      }
      const pathLine = fm.match(/^verification_receipt_path:\s*(.+)$/im);
      if (pathLine) {
        const rel = pathLine[1].trim().replace(/^["'"'"']|["'"'"']$/g, "");
        const candidates = [
          path.join(wsRoot, rel),
          path.join(path.dirname(handoffPath), rel),
          path.join(path.dirname(handoffPath), "..", "..", rel),
        ];
        if (candidates.some((p) => fs.existsSync(p))) {
          process.exit(1);
        }
      }
      if (/^verification_receipt_status:\s*persisted\s*$/im.test(fm) && pathLine) {
        process.exit(0);
      }
      if (/^in_progress:\s*true\s*$/im.test(fm) && !/\|\s*Verification gate\s*\|/i.test(body)) {
        process.exit(1);
      }
    }

    for (const line of body.split("\n")) {
      if (!/\|\s*Verification gate\s*\|/i.test(line)) continue;
      if (/allowed\s*:\s*true/i.test(line)) {
        process.exit(0);
      }
    }
    process.exit(1);
  ' "$handoff" "$ws"
}