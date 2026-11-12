# Close-out handoff — REQ-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_COMPACT

**Date:** 2026-11-12  
**depth_tier / gate_policy:** minimal / advisory  
**Wave:** v3 (SC-CSC-11 cross-layer column order) on top of v2 close-out `652c81a2`

## Completion signals

| Signal | Status |
| --- | --- |
| Machine close-out | pass — `run-close-out-gates.mjs` merged_decision.allowed true; envelope blocking_gaps=0 |
| Process contract | partial — minimal tracker; build-plan v3 + regen evidence; scoped traceable commit |
| Adherence ledger | thin_ledger advisory — reconcile process_grade B (88) |

## Verification

- `node --test tools/bootstrap/lib/project-size-comparison-render.test.mjs` — 13/13 (SC-CSC-11)
- `tied_validate_consistency` — CSC tokens valid; **pre-existing** WF proof-manifest subtype drift unstaged

## Commit

*(SHA recorded after traceable commit)*

## Scope

v3: Summary cross-layer columns `utf8/atom | oi/atom | pf/atom` before `wall_clock`; regen `comparison-table.md` + batch receipts/manifest; promote `tied-project/citdp/CITDP-REQ-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_COMPACT.yaml`.

## Parent

[REQ-TIED_PROJECT_SIZE_LAYERS](../../REQ-TIED_PROJECT_SIZE_LAYERS/PLAN.md)
