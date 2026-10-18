# refine-plan pass 3 — close-out execution plan

**Date:** 2026-10-18  
**Linked plan:** `.cursor/plans/cae_plan-close-out_222bebd8.plan.md`  
**Program:** [REQ-TIED_CONTEXT_ADAPTIVE_ENGINEERING](../PLAN.md) · `@plan-close-out` (not `@build-plan`)

## Refine (Touchpoint 1)

- **Scope RESOLVE:** Pass 3 refines **machine close-out only** — no new MCP modules, no checklist default changes. Sponsor confirmed: **persist CITDP** + **mint `[PROC-CONTEXT_ADAPTIVE_PRACTICE]`**.
- **Depth / policy (unchanged):** `depth_tier` + `profile_depth`: **integrated**; `gate_policy`: **advisory**.
- **Vocab PRELOAD:** `context-adaptive-engineering.md`, `quality-assurance.md`, `fidelity-research.md`.

## Gate (refine-plan `pre_implementation`)

| Check | Result |
| --- | --- |
| Slice 0 receipt | **`allowed: true`** — [pre_implementation-2026-10-18T05-08-37-210Z.json](../gates/pre_implementation-2026-10-18T05-08-37-210Z.json) |
| Live re-validate (pass 3) | **Not required to replay** — product implementation and verification gates already satisfied; pass 3 does not change adversarial depth or RED scope |
| Close-out blocker (known) | Envelope missing `evidence_chain_profile` until unified runner; **`close_out` inquiry** not yet run |

## Plan (CITDP) additions

- **Tracker for execution:** author `gate-tracker-close-out.yaml` (EASAR close-out template); do **not** reuse refine-plan [checklist-tracker.yaml](../checklist-tracker.yaml).
- **CITDP:** add `completion_criteria.close_out` activation (`run_id`: `cae-close-out-20261018`); mark quality matrix **pass** post-verify; persist copy under `tied-project/citdp/` before envelope rebuild.
- **Methodology pairing:** close-out tracker must reference [cae-easar-dogfood-pilot.v1.json](./cae-easar-dogfood-pilot.v1.json) + `methodology-experiments.yaml` experiment `cae-easar-pilot-20261018` (outcome **inconclusive** — avoids conformance-only trap at `close_out`).

## Implement (when sponsor runs `@plan-close-out`)

Follow linked Cursor plan **Implement** section: inquiry → PROC/CITDP → tracker dual-write → `run-close-out-gates.mjs` → docs/CHANGELOG → three completion signals (no commit).

## Test strategy (close-out pass)

- **No new RED** unless PROC mint or CITDP edits introduce code changes.
- **Regression if touched:** `node --import tsx --test mcp-server/src/context-adaptive/*.test.ts`.
- **Gates:** unified runner + `tied_validate_consistency`.
