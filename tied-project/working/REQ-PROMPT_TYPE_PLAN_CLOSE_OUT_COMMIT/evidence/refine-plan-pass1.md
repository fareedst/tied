# Refine-plan pass 1 — plan-close-out traceable-commit

**Date:** 2026-10-19  
**Prompt type:** refine-plan  
**Linked plan:** `plan-close-out_commit_c1bbb590.plan.md`  
**Authoritative PLAN:** [../PLAN.md](../PLAN.md)

## Refine outcomes

- **Commit policy:** `@plan-close-out` executes **traceable-commit** when unified **close_out** allows; **no commit** when blocked (sponsor confirmed).
- **Hygiene:** Default **`tied_git_hygiene`** preview (`plan_close_out`); apply deletes only with exact **`allowed_paths`**.
- **DRY:** New **`traceable-commit-close-out.md`** in `prompt-shared`; split **`tied-close-out-process`** prologue.
- **Inventory fix:** Static test already lists **18** shared refs; add 19th — do not rely on stale “15 direct” IMPL prose without updating.
- **Vocab:** Replace **plan-close-out (commit deferred)** in `prompt-composer.md` during implement.

## Gates (refine phase)

- **`pre_implementation`:** **`allowed: true`** — `run_id=pco-refine-preimpl-20261019-r4`, receipt [pre_implementation-2026-10-20T04-57-55-060Z.json](../gates/pre_implementation-2026-10-20T04-57-55-060Z.json).
- **CITDP MCP shape:** pass **unwrapped** record body to `tied_checklist_gate_validate` (not `{ CITDP-TOKEN: { ... } }` wrapper).
- **No git commit** in refine-plan (orchestration only).

## Next step

`@build-plan` linked to [PLAN.md](../PLAN.md) or implement Phase 0 RED tests first.
