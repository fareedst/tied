# RISK-UNIFIED-004 — Phase 4c default flip (lightweight note)

| Field | Value |
| --- | --- |
| **Risk** | TS subprocess orchestration performance vs Go |
| **Trigger** | Before **4c** default flip (PLAN verification table) |
| **Outcome** | **No block** — flip proceeds on parity test evidence |

## Evidence used

- Phase **4a** live executor parity tests (`live-executor.test.ts`, Go oracle fixtures).
- Workspace `npm test` includes dispatcher + executor dry-run + parity suites for both `TIED_AGENTSTREAM_IMPL=ts` and `go` where applicable.
- No sponsor threshold defined for latency regression; no measured critical gap in CI.

## Follow-up

If operators report slow live runs after **4c**, capture wall time for a fixed fixture with `impl=ts` vs `impl=go` and attach to CITDP evidence before **4d** removal.
