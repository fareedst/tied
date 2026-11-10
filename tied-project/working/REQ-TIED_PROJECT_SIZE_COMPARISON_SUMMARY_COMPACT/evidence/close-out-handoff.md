# Close-out handoff — REQ-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_COMPACT

**Date:** 2026-11-10  
**depth_tier / gate_policy:** minimal / advisory

## Completion signals

| Signal | Status |
| --- | --- |
| Machine close-out | `run-close-out-gates.mjs` merged_decision.allowed true; envelope 0 blocking gaps |
| Process contract | build-plan v2 + regen evidence; scoped commit |
| Adherence ledger | thin_ledger (advisory) |

## Verification

- `node --test tools/bootstrap/lib/project-size-comparison-render.test.mjs` — 10/10
- `npx tsx --test mcp-server/src/project-size/project-size.test.ts` — 7/7
- `tied_validate_consistency` — ok: true

## Scope

Comparison summary v2: epoch floor, dedupe, `wall_time`, snapshot `orchestrator_wall_time_seconds`, cohort table regen.

## Parent

[REQ-TIED_PROJECT_SIZE_LAYERS](../../REQ-TIED_PROJECT_SIZE_LAYERS/PLAN.md)
