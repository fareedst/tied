---
name: add-feature
description: "Plan-mode greenfield TIED feature: Refine and CITDP prepare only. Use when the caller names add-feature or starts a new requirement. Hand off to refine-plan or build-plan; do not implement in this leaf. Do not use for build-plan, non-tied-plan, or question."
disable-model-invocation: true
---

# add-feature

Explicit invocation only (`@add-feature` or caller names `prompt-type: add-feature`).

[REQ-PROMPT_TYPE_GLOBAL_SKILLS] [REQ-PROMPT_TYPE_SKILL_EXECUTION_MODE] [ARCH-PROMPT_TYPE_GLOBAL_SKILLS] [IMPL-PROMPT_TYPE_GLOBAL_SKILLS]

## Execution mode

**skill execution mode:** plan

See [prompt-execution-mode.md](../prompt-shared/prompt-execution-mode.md).

## Inputs

- **Optional prompt envelope:** `prompt-type: add-feature`, `git-condition:` (informational only)
- **Invocation remainder:** the requirement text after the skill name. Do not treat a linked plan as the request.
- **Git context:** [git-context-templates.md](../prompt-shared/git-context-templates.md) when relevant

## TIED applicability

Full TIED tracking — [tied-boundary.md](../prompt-shared/tied-boundary.md).

## Procedure

1. **Refine** — [tied-refine.md](../prompt-shared/tied-refine.md)
2. **Optional Jev plan-skills adjunct** — [jev-plan-skills-adjunct.md](../prompt-shared/jev-plan-skills-adjunct.md)
3. **Optional plan process tools adjunct** — [plan-process-tools-adjunct.md](../prompt-shared/plan-process-tools-adjunct.md)
4. **Plan** — [tied-plan-prepare.md](../prompt-shared/tied-plan-prepare.md) ([methodology-surface-enrollment-advisory.md](../prompt-shared/methodology-surface-enrollment-advisory.md))

Select `profile_depth` and gate policy during impact discovery. Copy per-task Tracker under `tied-project/working/{REQ-TOKEN}/`.

## Gates

- Refine: do not start plan until ambiguity cleared
- Plan: optional advisory `tied_checklist_gate_validate` (`phase: pre_implementation`); blocking RED is expected in plan mode

## Outputs

- `tied-project/working/{REQ-TOKEN}/PLAN.md`, tracker, draft CITDP, test-strategy design
- `tied-project/working/{REQ-TOKEN}/evidence/session-handoff.md` § **Plan execution steps** when PLAN steps change ([prompt-skill-disk-handoff.md](../prompt-shared/prompt-skill-disk-handoff.md))
- **Plan-mode handoff:** next `@refine-plan` or `@build-plan` (chat lists paths only)

## Forbidden

- `tied-implement.md` procedure; product code/tests/fixtures/data; RED tests
- `pbpaste`/`pbcopy`, automatic git mutation, unapproved repo inspection
- Inferring TIED from repo layout
