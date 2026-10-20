# Refine-plan pass 2 — close-out execution plan

**Date:** 2026-10-20  
**Prompt type:** refine-plan  
**Linked plan:** Cursor `plan-close-out_commit_1907d592.plan.md` (close-out continuation)  
**Authoritative PLAN:** [../PLAN.md](../PLAN.md)

## Refine outcomes

- **Phase 3 expanded** — explicit `run-close-out-gates.mjs` command (`--reconcile`), envelope **minimal** rebuild note, dedicated [checklist-tracker.yaml](../checklist-tracker.yaml), hygiene + traceable-commit sequence, explicit **LEGACY decommission exclude**.
- **Tracker split** — close-out authority in `checklist-tracker.yaml`; [checklist-tracker-refine.yaml](../checklist-tracker-refine.yaml) retained as refine history (pass 2 metadata).
- **CITDP** — close-out success criteria + quality matrix `result: pass` (build complete); disconfirming observation wording aligned to post-build tests.
- **Test strategy** — close-out gate table added.

## Gates (refine phase)

- **`pre_implementation`:** **`allowed: true`** — `run_id=pco-refine-preimpl-20261020-p2`, receipt [pre_implementation-2026-10-20T05-07-20-634Z.json](../gates/pre_implementation-2026-10-20T05-07-20-634Z.json).
- **CITDP MCP shape:** unwrapped record body to `tied_checklist_gate_validate` (unchanged from pass 1).
- **No git commit** in refine-plan.

## Next step

`@plan-close-out` (or execute Phase 3 in [PLAN.md](../PLAN.md)): close_out gates → hygiene preview → traceable-commit when `merged_decision.allowed`.
