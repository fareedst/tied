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
  (cd "$QUAL" && node --experimental-strip-types "$SCRIPTS/$1")
}

case "${1:-all}" in
  scan)
    run_ts scan-corpus.ts
    ;;
  baseline)
    run_ts scan-corpus.ts
    run_ts run-baseline.ts
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
    echo "Usage: $0 {scan|baseline|pilot|compare|annotation|qualify|all}"
    exit 1
    ;;
esac
