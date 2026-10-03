# Refine-plan — close-out orchestration (pass)

**Date:** 2026-09-24  
**Input:** Cursor plan `dae-close-out-commit_83c0ccb8.plan.md`  
**Program:** [REQ-TIED_DAE_INCORPORATION](../PLAN.md) (W0–5 closed on disposition log)

## Refine outcomes

- **CRAP demotion:** Canonical prose **diff-scoped change-risk report**; stable ids unchanged (`diff_scoped_crap`, `diff-scoped-crap.ts`, etc.).
- **Dual REQ close-out:** Parent + child each get CITDP `phase: closed`, gate runner invocation, and close-out receipt.
- **Verification-gated status:** Run `tied_verify` with update after `npm test` before marking REQ/IMPL Implemented.
- **Git scope:** Explicit include/exclude list for single DAE commit; excludes unrelated working folders.

## Gates (refine phase)

- `tied_checklist_gate_validate` **pre_implementation** on program tracker + on-disk CITDP: run at execute time (refine did not mutate TIED YAML).
- **No commit** in refine-plan (orchestration document only).

## Next step

Execute refined plan (Implement sections 1–6) or delegate **plan-close-out** then commit per user request.
