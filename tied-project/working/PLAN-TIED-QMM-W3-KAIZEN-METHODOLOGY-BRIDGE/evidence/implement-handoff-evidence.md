# implement-handoff-evidence — PLAN-TIED-QMM-W3-KAIZEN-METHODOLOGY-BRIDGE

**Date:** 2026-10-10

## Future REQ

`REQ-METHODOLOGY-KAIZEN-EXPERIMENT-BRIDGE` — not minted in plan-only pass.

## Implement batches (authorization)

| Batch | Scope |
| --- | --- |
| **B1** | Eligibility + draft builder + unit tests |
| **B2** | MCP register; composition; no store write on bridge |
| **B3** | Optional v1 `source_feedback_refs`; upsert demo; vocabulary VALIDATE |

## Gate to start RED

1. Sponsor record mirroring [`sponsor-authority-w2-implement-20261010.md`](../../PLAN-TIED-QMM-METHODOLOGY-LEARNING/evidence/sponsor-authority-w2-implement-20261010.md) with **`w3_scope: implement`**
2. Orchestrator `execution_authority.w3_scope: implement`
3. Fresh Tracker under `working/REQ-METHODOLOGY-KAIZEN-EXPERIMENT-BRIDGE/`
4. `CITDP-REQ-METHODOLOGY-KAIZEN-EXPERIMENT-BRIDGE` with **`depth_tier: integrated`**, **`gate_policy: per_citdp`**
5. Implement `pre_implementation` **allowed: true**

## Explicit stop (this pass)

No RED, no `mcp-server/` product changes, no REQ/ARCH/IMPL index writes until steps above complete.
