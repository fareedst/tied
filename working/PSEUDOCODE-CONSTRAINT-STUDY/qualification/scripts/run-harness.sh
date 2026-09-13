#!/usr/bin/env bash
# [REQ-PSEUDOCODE_TYPED_FLOW] Qualification harness runner — builds analyzer then executes scripts.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
MCP="$ROOT/mcp-server"
QUAL="$(cd "$(dirname "$0")/.." && pwd)"
SCRIPTS="$QUAL/scripts"

echo "TRACE: building mcp-server analyzer"
(cd "$MCP" && npm run build --silent)

run_ts() {
  local script=$1
  shift
  (cd "$QUAL" && node --experimental-strip-types "$SCRIPTS/${script}" "$@")
}

corpus_available() {
  [[ -d "${EXTERNAL_CORPUS_ROOT:-/Users/fareed/Documents/dev/test}" ]]
}

EXTERNAL_CORPUS_ROOT="${EXTERNAL_CORPUS_ROOT:-/Users/fareed/Documents/dev/test}"

case "${1:-all}" in
  scan)
    run_ts scan-corpus.ts
    ;;
  baseline)
    if corpus_available; then
      run_ts scan-corpus.ts
    else
      echo "TRACE: scan skipped — external corpus unavailable at ${EXTERNAL_CORPUS_ROOT}"
    fi
    run_ts run-baseline.ts
    ;;
  fleet-g1)
    if corpus_available; then
      run_ts scan-corpus.ts
    else
      echo "TRACE: scan skipped — external corpus unavailable; fleet-g1 runs Tier B + exemplars"
    fi
    run_ts run-fleet-g1-qualification.ts
    ;;
  pilot)
    run_ts run-pilot.ts
    ;;
  compare)
    run_ts compare-reports.ts
    ;;
  annotation)
    run_ts run-annotation-study.ts
    ;;
  fp-measurement)
    run_ts run-fleet-g1-fp-measurement.ts
    ;;
  rollback-g1)
    run_ts run-fleet-g1-rollback-exercise.ts
    ;;
  p2g)
    run_ts run-annotation-study.ts
    run_ts run-fleet-g1-fp-measurement.ts
    run_ts run-fleet-g1-rollback-exercise.ts
    run_ts write-f11-fp-thresholds.ts
    ;;
  pilot-inventory)
    run_ts run-pilot-inventory-scan.ts "$@"
    ;;
  pilot-g2)
    run_ts run-pilot-inventory-scan.ts --apply
    run_ts run-pilot-g2-receipts.ts
    ;;
  pilot-g2-rollback)
    run_ts run-pilot-g2-rollback-exercise.ts
    ;;
  pilot-external-scan)
    run_ts run-pilot-external-scan.ts
    ;;
  fleet-external-scan)
    run_ts run-fleet-external-client-scan.ts "$@"
    ;;
  fleet-external-apply-dry-run)
    for w in W-ext-1789069630-1 W-ext-1789136889-1 W-ext-1789147101-1; do
      run_ts run-fleet-external-client-apply.ts --wave-id "$w" || echo "TRACE: fleet-external-apply-dry-run skip $w"
    done
    ;;
  fleet-external-apply)
    echo "TRACE: fleet-external-apply mutates enrolled external repos — set APPLY=1 to enable --apply"
    for w in W-ext-1789069630-1 W-ext-1789136889-1 W-ext-1789147101-1; do
      run_ts run-fleet-external-client-apply.ts --wave-id "$w"
      if [[ "${APPLY:-0}" == "1" ]]; then
        run_ts run-fleet-external-client-apply.ts --wave-id "$w" --apply
      fi
    done
    if [[ "${APPLY:-0}" == "1" ]]; then
      run_ts run-fleet-inventory-scan.ts --apply
      run_ts run-fleet-dashboard-refresh.ts
    fi
    ;;
  pilot-p3)
    run_ts run-pilot-inventory-scan.ts --apply
    run_ts run-pilot-g2-receipts.ts
    run_ts run-pilot-g2-rollback-exercise.ts
    run_ts run-pilot-external-scan.ts
    ;;
  fleet-inventory)
    run_ts run-fleet-inventory-scan.ts "$@"
    ;;
  fleet-g3-wave)
    run_ts run-fleet-g3-wave.ts "$@"
    ;;
  fleet-g3-refresh-stdd)
    run_ts run-fleet-g3-refresh-stdd.ts "$@"
    run_ts run-fleet-inventory-scan.ts --apply
    run_ts run-fleet-dashboard-refresh.ts
    ;;
  fleet-p4)
    run_ts run-fleet-inventory-scan.ts
    run_ts run-fleet-g3-wave.ts --wave-id "${FLEET_WAVE_ID:-W-stdd-2}"
    ;;
  fleet-dashboard)
    run_ts run-fleet-dashboard-refresh.ts
    ;;
  fleet-g4-ci)
    echo "TRACE: G4 continuous CI (P5-E) — grammar audit + waiver registry + enrolled track"
    (cd "$ROOT" && node scripts/run-fleet-g4-ci-checks.mjs)
    ;;
  fleet-stop-go-closeout|fleet-p4-g)
    run_ts run-fleet-p4-g-closeout.ts
    ;;
  fleet-stdd-waves-3-10)
    run_ts run-fleet-stdd-wave-plan.ts --write
    for w in W-stdd-3 W-stdd-4 W-stdd-5 W-stdd-6 W-stdd-7 W-stdd-8 W-stdd-9 W-stdd-10; do
      run_ts run-fleet-g3-wave.ts --wave-id "$w" || echo "TRACE: fleet-stdd-waves-3-10 skip $w"
    done
    run_ts run-fleet-p4-g-closeout.ts
    run_ts run-fleet-dashboard-refresh.ts
    run_ts run-fleet-inventory-scan.ts --apply
    ;;
  fleet-stdd-apply-dry-run)
    # Default safe path: dry-run only (no sidecar byte changes).
    run_ts run-fleet-stdd-apply.ts --all-legacy
    ;;
  fleet-stdd-apply)
    echo "TRACE: fleet-stdd-apply is destructive — run dry-run first; pass APPLY=1 to enable --apply"
    run_ts run-fleet-stdd-apply.ts --all-legacy
    if [[ "${APPLY:-0}" == "1" ]]; then
      run_ts run-fleet-stdd-apply.ts --all-legacy --apply --receipts
      run_ts run-fleet-inventory-scan.ts --apply
      run_ts run-fleet-dashboard-refresh.ts
    fi
    ;;
  fleet-stdd-constraint-ready-report)
    run_ts run-fleet-stdd-constraint-ready.ts --report
    ;;
  fleet-stdd-constraint-ready-dry-run)
    run_ts run-fleet-stdd-constraint-ready.ts --all-waves
    ;;
  qualify)
    run_ts run-pilot.ts
    run_ts compare-reports.ts
    run_ts run-annotation-study.ts
    ;;
  all)
    run_ts scan-corpus.ts
    run_ts run-baseline.ts
    ;;
  *)
    echo "Usage: $0 {scan|baseline|pilot|compare|annotation|fp-measurement|rollback-g1|p2g|pilot-inventory|pilot-g2|pilot-g2-rollback|pilot-external-scan|fleet-external-scan|fleet-external-apply-dry-run|fleet-external-apply|pilot-p3|fleet-inventory|fleet-g3-wave|fleet-g3-refresh-stdd|fleet-p4|fleet-stdd-waves-3-10|fleet-stdd-apply-dry-run|fleet-stdd-apply|fleet-stdd-constraint-ready-report|fleet-stdd-constraint-ready-dry-run|fleet-dashboard|fleet-g4-ci|fleet-stop-go-closeout|fleet-p4-g|qualify|fleet-g1|all}"
    exit 1
    ;;
esac
