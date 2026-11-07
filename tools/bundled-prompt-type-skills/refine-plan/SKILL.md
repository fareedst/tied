---
name: refine-plan
description: "Plan-mode improvement of a linked TIED plan: Refine and CITDP prepare only. Use when the caller names refine-plan or asks to improve a linked plan. Improve the plan below. Do not use for build-plan, add-feature, or non-tied-refine."
disable-model-invocation: true
---

# refine-plan

Explicit invocation only (`@refine-plan` or `prompt-type: refine-plan`).

[REQ-PROMPT_TYPE_GLOBAL_SKILLS] [REQ-PROMPT_TYPE_SKILL_EXECUTION_MODE] [IMPL-PROMPT_TYPE_GLOBAL_SKILLS]

## Execution mode

**skill execution mode:** plan

See [prompt-execution-mode.md](../prompt-shared/prompt-execution-mode.md).

## Inputs

- **Linked plan:** attached or in-message plan. Required.
- **Invocation remainder:** optional notes; not the plan body.
- **Optional envelope:** `prompt-type: refine-plan`, `git-condition:`

## TIED applicability

Full TIED — [tied-boundary.md](../prompt-shared/tied-boundary.md).

## Procedure

1. **Refine** — [tied-refine.md](../prompt-shared/tied-refine.md)
2. **Optional Jev plan-skills adjunct** — [jev-plan-skills-adjunct.md](../prompt-shared/jev-plan-skills-adjunct.md)
3. **Optional plan process tools adjunct** — [plan-process-tools-adjunct.md](../prompt-shared/plan-process-tools-adjunct.md)
4. **Plan** — [tied-plan-prepare.md](../prompt-shared/tied-plan-prepare.md)

When scope or depth changes, invalidate dependent downstream tracker dispositions and re-run advisory gates.

If no linked plan, stop.

## Gates

- Advisory `tied_checklist_gate_validate` (`phase: pre_implementation`) when tracker exists

## Outputs

Improved `PLAN.md`; tracker; test-strategy design. Update `evidence/session-handoff.md` § **Plan execution steps** when PLAN steps change ([prompt-skill-disk-handoff.md](../prompt-shared/prompt-skill-disk-handoff.md)). When **`plan_phase: pre-implementation`**, **Do next** MUST recommend **`@build-plan`** ([plan-build-sequence-guard.md](../prompt-shared/plan-build-sequence-guard.md)). When post-build, set `plan_phase` accordingly; Do next optional `@close-out` only.

## Forbidden

- `tied-implement.md` procedure; product mutations; RED tests
- `pbpaste`/`pbcopy`, automatic git, unapproved repo inspection
