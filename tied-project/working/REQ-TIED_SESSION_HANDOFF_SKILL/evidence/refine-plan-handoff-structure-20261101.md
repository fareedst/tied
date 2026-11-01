# refine-plan — structured session handoff (Wave 2)

**Date:** 2026-11-01  
**Prompt type:** `@refine-plan`  
**Request:** [REQ-TIED_SESSION_HANDOFF_SKILL] — codify dependencies, environment, plan spine, and **pending prior requests** in `@handoff`  
**Linked plan (Cursor):** `handoff_skill_structure_73958f60.plan.md`

## Refine (Touchpoint 1 — RESOLVE)

| Term | Resolution |
| --- | --- |
| **Handoff skill** | Bundled `@handoff` / `/handoff`; persists **`evidence/session-handoff.md`** only ([ARCH-TIED_SESSION_HANDOFF_SKILL_BOUNDARY]). |
| **Plan spine** | Authoritative links: `PLAN.md`, checklist Tracker, persisted CITDP, optional program PLAN — preserved across chat splits. |
| **Pending prior requests** | Cross-REQ / cross-PLAN / sponsor / **TIQ** rows that **block or contextualize** the active effort; **carry-forward** table merged on each `@handoff` (dedupe by `id`). |
| **Environment** | `workspace_root`, `TIED_BASE_PATH`, `execution_site`, git policy — **paste-only** (skill forbids automatic git). |
| **DAE handoff YAML** | Additive `working/{REQ}/handoffs/{phase}.yaml` (**schema v1**, `tied handoff validate`) — **criterion evidence** for DAE; **does not replace** `session-handoff.md` or envelope ([REQ-TIED_DAE_INCORPORATION], client-development-index). |
| **session-handoff-context.v1** | Optional example YAML for copy-paste; **not** DAE schema v1; **not** MCP authority. |

**Ambiguity cleared:** Wave 1 (2026-10-18) shipped bootstrap + minimal SKILL body. Wave 2 adds **normative structure** + tests + LEAP satisfaction criteria; does **not** rename existing `*handoff*.md` files repo-wide.

**Costly choice (locked — reversible):** Section completeness in SKILL is **advisory** (WARN + still persist) so thin non-TIED threads are not blocked.

**depth_tier / gate_policy:** **minimal** / **advisory** (unchanged — doc + bootstrap tests only; no integrated inquiry).

## Plan deltas vs Cursor draft

1. **Explicit DAE boundary** in structure doc and PLAN — avoid sponsors conflating markdown log with `handoffs/*.yaml`.
2. **Working folder:** all Wave 2 artifacts under [`../PLAN.md`](../PLAN.md) (this REQ), not a new PLAN token.
3. **Tracker loop-back:** invalidate `unit-test-red`, `unit-test-green` until structure doc test lands; `test-strategy.md` superseded by Wave 2 section.
4. **REQ index status:** remains **Planned** until Wave 2 implement + verify; close-out from 2026-10-18 covered bootstrap only.

## Sponsor next

Execute Wave 2 via **`@build-plan`** @ [`PLAN.md`](../PLAN.md) (or `@non-tied-plan` if sponsor bypasses Tracker gates for doc-only trial — full path uses TIED LEAP per plan).
