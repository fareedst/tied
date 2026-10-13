# scope-hygiene-evidence — PLAN-TIED-LANGGRAPH-ORCHESTRATION

**Date:** 2026-10-12

## Sponsor override (build-plan)

Refine-plan pass 2 recommended reverting stdd `REQ/ARCH/IMPL-BOUNDED_WORKER_POOL` as a fixture leak. Sponsor directive on build-plan: **keep BOUNDED_WORKER_POOL for future completion** in **stdd** `tied-project/`.

## Dual-track contract

| Track | Role | Location |
| --- | --- | --- |
| **Stdd port (deferred)** | Future in-repo implementation / reference stack | `tied-project/requirements/REQ-BOUNDED_WORKER_POOL.yaml` (+ ARCH/IMPL); status In Progress; no stdd `src/worker-pool/` in P0 |
| **Fixture ground truth** | LangGraph phases 3–7 executable proof | Client `/Users/fareed/Documents/dev/test/1791767366`; readout `docs/demos/trial-readout-PROMPT-GF-09-1791767366.md` |

## Hygiene checks

- `semantic-tokens.yaml` registers REQ/ARCH/IMPL-BOUNDED_WORKER_POOL (2026-10-12).
- Program CITDP `tied_tokens_new: []` — enrollment did not mint new product tokens.
- LangGraph pilot runs against fixture phases must set `TIED_BASE_PATH` to fixture `tied-project/`, not stdd.
