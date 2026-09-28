# Plan process tools adjunct (optional — DAE + BBCE)

**Scope:** Advisory guidance for the four **explicit** main plan skills:
`plan-new-feature`, `refine-plan`, `build-plan`, `plan-close-out`.

**Traceability:** [REQ-TIED_SETUP](../../../tied/requirements/REQ-TIED_SETUP.yaml) · [REQ-PROMPT_TYPE_GLOBAL_SKILLS](../../../tied/requirements/REQ-PROMPT_TYPE_GLOBAL_SKILLS.yaml)

---

## When to run

1. Complete normal **PRELOAD** and checklist authority first.
2. Run this adjunct only when the current skill is one of the four plan skills above.
3. **Never** block gates, envelope validation, or integrated adversarial inquiry when this adjunct is skipped.

## DAE (gate check + CRAP config)

- **MCP:** `tied_gate_check` · **CLI:** `tied gate check` (bundled with tied-yaml when MCP dist is built).
- Read optional repo keys from `.tied-yaml.yaml` (`dae.crap_threshold`, explicit `dae.branch_check` opt-out). Bootstrap may seed `dae.crap_threshold: 30` with `--with-dae` / `--full-tools`; it does **not** default `dae.agentstream_gate_check`.
- CRAP reports still require CITDP `diff_scoped_crap: true` per activation map §3.4.

## BBCE (advisory locality)

- PRELOAD `tied/vocab/behavior-bounded-change-engineering.md` when the CITDP or Tracker references BBCE.
- Optional client starter: `tied/analysis/slice-map.yaml` and declared surface under `working/{REQ-TOKEN}/`.
- Run checklist BBCE sub-procedures (`sub-bbce-advisory-verification-pass`, etc.) at verification when the operator opts in — **advisory only** (W2).
- Optional MCP: `tied_plumb_diff_impact_preview` when configured; not gate-blocking.

## Operator bootstrap

Disposable clients: `test-new-tied-client --full-tools` (Unix) or `test-new-tied-client.cmd --full-tools` (Windows) seeds repo config and analysis starters; see `tools/bootstrap/README.md` and `tied/docs/fresh-client-prompt-activation-map.md`.
