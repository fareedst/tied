---
name: non-tied-plan
description: "Plan-mode non-TIED greenfield: refine and plan under tied-project/non-tied-plans/{slug}/. Use when the caller names non-tied-plan. Hand off to non-tied-refine or non-tied-build. Do not use for add-feature or non-tied-debug."
disable-model-invocation: true
---

# non-tied-plan

Explicit invocation only (`@non-tied-plan` or `prompt-type: non-tied-plan`).

[REQ-PROMPT_TYPE_GLOBAL_SKILLS] [REQ-PROMPT_TYPE_SKILL_EXECUTION_MODE] [IMPL-PROMPT_TYPE_GLOBAL_SKILLS]

## Execution mode

**skill execution mode:** plan

See [prompt-execution-mode.md](../prompt-shared/prompt-execution-mode.md).

## Inputs

- **Invocation remainder:** the request after the skill name.
- **Optional envelope:** `prompt-type: non-tied-plan`, `git-condition:`

## TIED applicability

Non-tied plan track — [non-tied-boundary.md](../prompt-shared/non-tied-boundary.md).

## Procedure

1. **Refine (simple)** — [non-tied-refine.md](../prompt-shared/non-tied-refine.md)
2. **Plan** — [non-tied-plan-prepare.md](../prompt-shared/non-tied-plan-prepare.md)

Choose `{slug}` for `tied-project/non-tied-plans/{slug}/`.

## Outputs

- `PLAN.md` and optional CITDP in `non-tied-plans/{slug}/`
- `non-tied-plans/{slug}/evidence/session-handoff.md` § **Plan execution steps** when PLAN steps change ([prompt-skill-disk-handoff.md](../prompt-shared/prompt-skill-disk-handoff.md))
- Hand off to `@non-tied-refine` or `@non-tied-build` (chat lists paths only)

## Forbidden

- Product code/tests in plan mode; project REQ/ARCH/IMPL YAML
- `pbpaste`/`pbcopy`; automatic git
