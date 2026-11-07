# Close-out handoff — S4 linked reconcile ([REQ-TIED_CLIENT_OPERATOR_TOOLING])

**Date:** 2026-11-06  
**Plan:** [PLAN-s4-linked-reconcile.md](../PLAN-s4-linked-reconcile.md)  
**CITDP:** [tied-project/citdp/CITDP-REQ-TIED_CLIENT_OPERATOR_TOOLING-s4-linked-reconcile.yaml](../../../citdp/CITDP-REQ-TIED_CLIENT_OPERATOR_TOOLING-s4-linked-reconcile.yaml)

## Completion signals

| Signal | Status |
|--------|--------|
| Machine close_out | **pass** — `merged_decision.allowed=true`; envelope `blocking_gap_count=0`; run `close-out-client-ops-s4-linked-reconcile-20261106-r3` |
| Process contract | **pass** — `run-close-out-gates.mjs --envelope-blocking --sync-dispositions --reconcile` |
| Adherence ledger | **partial** — reconcile `process_grade` band **B**; advisory `evidence_stale` on prior gate receipts (non-blocking at minimal advisory) |

## Client rollout (hl7receiver)

Rebuild store `mcp-server`, restart MCP; no `ADHERENCE_RECONCILE_BIN` wrapper required.

## Excluded from this commit

Unrelated workspace drift: `tied-project/non-tied-plans/*`, `ordered-list-audit.jsonl`, `REQ-WF_TRIAL_FOUR_PHASE_HARDENING` evidence.

## Upstream feedback

N/A — store-native tooling slice; no client feedback capture in this pass.
