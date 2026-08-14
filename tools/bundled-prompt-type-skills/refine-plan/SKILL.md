---
name: refine-plan
description: Refines an existing linked or in-message plan with TIED Refine, CITDP Plan, and Implement sections. Use when the caller names refine-plan, asks to improve a linked plan, or says "Improve the plan below." Do not use for build-plan (execute a linked plan), plan-new-feature (new requirement), or non-tied-plan.
disable-model-invocation: true
---

# refine-plan

Explicit invocation only (`@refine-plan` or `prompt-type: refine-plan`).

This skill is the workflow source of truth for client prompt-type invocation.
`copy_files.sh` installs it under `.cursor/skills/refine-plan/`. Task wrappers under
`.cursor/agents/` remain TIED-source development artifacts only.
[REQ-PROMPT_TYPE_GLOBAL_SKILLS] [ARCH-PROMPT_TYPE_GLOBAL_SKILLS]
[IMPL-PROMPT_TYPE_GLOBAL_SKILLS]


## Inputs

- **Optional prompt envelope:** `prompt-type: refine-plan`, `git-condition:` (informational)
- **Linked plan:** the attached or in-message plan to improve. Required.
- **Invocation remainder:** optional notes on what to change; not the plan itself.

## TIED applicability

Full TIED tracking — [tied-boundary.md](../prompt-shared/tied-boundary.md).

## Procedure

Improve the linked plan in this order:

1. **Refine** — [tied-refine.md](../prompt-shared/tied-refine.md)
2. **Plan** — [tied-plan-citdp.md](../prompt-shared/tied-plan-citdp.md)
3. **Implement** — [tied-implement.md](../prompt-shared/tied-implement.md)

If neither a linked plan nor an in-message plan is present, stop.

## Gates

Same as plan-new-feature.

## Outputs

Improved plan document; Tracker copy; test strategy outline.

## Forbidden

`pbpaste`/`pbcopy`, automatic git, unapproved repo inspection.
