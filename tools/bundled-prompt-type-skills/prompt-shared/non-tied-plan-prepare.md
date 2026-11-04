# Plan (prepare only — non-TIED sequence)

[REQ-PROMPT_TYPE_SKILL_EXECUTION_MODE]

For **`non-tied-plan`** and **`non-tied-refine`** ([prompt-execution-mode.md](prompt-execution-mode.md) **plan** mode). Artifacts under `tied-project/non-tied-plans/{slug}/`.

## Plan (when the request is refined)

1. **Refine (simple)** — [non-tied-refine.md](non-tied-refine.md)
2. Design tests and security mitigations in `test-strategy.md` — **do not write RED test files** in plan mode.
3. Optional CITDP under `tied-project/non-tied-plans/{slug}/CITDP-*.yaml` with **`tied_tokens_new: []`**.
4. RECORD vocabulary in `tied-project/vocab/` when new terms appear ([non-tied-boundary.md](non-tied-boundary.md) plan track).

**Gate:** Plan-mode handoff; next `@non-tied-refine` or `@non-tied-build`. Do not mutate product code.
