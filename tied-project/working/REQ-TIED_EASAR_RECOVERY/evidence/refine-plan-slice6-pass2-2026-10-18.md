# refine-plan — Slice 6 pass 2

**Date:** 2026-10-18  
**Linked plan:** [slice6-e2e-plan.md](./slice6-e2e-plan.md)  
**REQ:** [REQ-TIED_EASAR_RECOVERY]

## Refine

- Reconciled plan with **plan-new-feature** implementation (export module, MCP, dogfood manifest).
- **No change** to `depth_tier`, `gate_policy`, or engagement facet.
- Corrected map path conventions (`PLAN.md` working-root relative; transform `from_manifest_receipt`).
- Dropped separate `recovery-export-run.ts` from file plan (run orchestration lives in `recovery-export-v1.ts`).

## Plan

- Updated TDD table, test matrix, and file checklist with done/pending columns.
- Pointed verification inquiry payload authoring to slice 4 graph pattern.

## Implement section

- Build-plan handoff unchanged in intent; remaining work is inquiry + gate + CITDP persist only.

## Gate

- Program **`pre_implementation`** still authoritative; Slice 6 does not require a new enrollment gate.
- Verification tracker partial completion preserved; inquiry/gate dispositions **not** marked complete (no loop-back invalidation of TDD evidence).
