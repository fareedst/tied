---
name: non-tied-refine
description: "Plan-mode improvement of a linked non-TIED plan under non-tied-plans/. Use when the caller names non-tied-refine. Do not use for refine-plan (full TIED) or non-tied-build."
disable-model-invocation: true
---

# non-tied-refine

Explicit invocation only (`@non-tied-refine` or `prompt-type: non-tied-refine`).

[REQ-PROMPT_TYPE_SKILL_EXECUTION_MODE] [REQ-PROMPT_TYPE_GLOBAL_SKILLS]

## Execution mode

**skill execution mode:** plan

See [prompt-execution-mode.md](../prompt-shared/prompt-execution-mode.md).

## Inputs

- **Linked plan:** required (path under `tied-project/non-tied-plans/` or in-message).
- **Invocation remainder:** optional refine notes.

## Procedure

1. **Refine (simple)** — [non-tied-refine.md](../prompt-shared/non-tied-refine.md)
2. **Plan** — [non-tied-plan-prepare.md](../prompt-shared/non-tied-plan-prepare.md)

If no linked plan, stop.

## Outputs

Updated `PLAN.md`; hand off to `@non-tied-build`.

## Forbidden

- Product mutations; TIED V+R+A+I writes; `pbpaste`/`pbcopy`; automatic git
