# Close (non-TIED sequence — agent mode)

[REQ-PROMPT_TYPE_SKILL_EXECUTION_MODE]

For **`non-tied-close`**. Lightweight close without unified TIED `close_out` gate stack.

## Procedure

1. Review scoped changes (plan folder + product diff from `non-tied-build`).
2. Optional git hygiene preview; classify ephemeral artifacts.
3. **Traceable commit** when sponsor authorizes: stage scoped paths only; do not push unless asked.
4. Do not invoke `tied_checklist_gate_validate` with `phase: close_out` unless sponsor explicitly switches to TIED `@close-out`.

**Forbidden:** `pbpaste`/`pbcopy`, automatic push, mutating TIED indexes or CITDP under `tied-project/citdp/` from this leaf.
