# Risk assessment — refine-plan pass 1 (Workflow H)

**Date:** 2026-10-19 · **CITDP:** [CITDP-REQ-TIED_EDPC_CLIENT_ASSESSMENT.yaml](../CITDP-REQ-TIED_EDPC_CLIENT_ASSESSMENT.yaml)

## Consequence ladder

| Decision | Class | Default |
| --- | --- | --- |
| Separate PROC Workflow H vs sub-step of F | Reversible | Separate H (keeps §18 consulting layer distinct from publish) |
| MCP pure JSON vs server-side file writes | Costly | Keep pure (matches EDPC modules; clients depend on contract) |
| Fail-closed on stale/unresolved receipt refs | Costly | Block or explicit refresh gap only |
| New Chart Viewer REQ for assessment | Reversible | No new REQ; extend engagement evidence only |
| PDF/HTML export | Reversible | Defer v1 |

## Open items (sponsor)

1. **Chart Viewer access:** H0 audit requires sponsor-approved work in the chartviewer repo or exported artifact bundle — not implicit agent inspection.
2. **Slice D readiness:** Platform compose rules referencing OFSM health rows should wait until Slice D contracts are merged or fixtures document D-lite stub behavior explicitly.

## depth_tier / gate_policy

Recorded in CITDP: `integrated` / `advisory`. Integrated inquiry mandatory before RED per eligibility (external input + MCP expansion).
