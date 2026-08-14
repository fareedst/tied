---
name: use-skill
description: Imports skills and applies them to the project with full TIED Refine, Plan, and Implement gates. Use when the caller names use-skill, imports Cursor skills to a project, or applies skill instructions in the invocation remainder. Do not use for prompt-type-router, question, or non-tied-plan.
disable-model-invocation: true
---

# use-skill

Explicit invocation only (`@use-skill` or `prompt-type: use-skill`).

This skill is the workflow source of truth for client prompt-type invocation.
`copy_files.sh` installs it under `.cursor/skills/use-skill/`. Task wrappers under
`.cursor/agents/` remain TIED-source development artifacts only.
[REQ-PROMPT_TYPE_GLOBAL_SKILLS] [ARCH-PROMPT_TYPE_GLOBAL_SKILLS]
[IMPL-PROMPT_TYPE_GLOBAL_SKILLS]


## Inputs

- **Optional prompt envelope:** `prompt-type: use-skill`, `git-condition:`
- **Invocation remainder:** the skill instruction after the skill or agent name.

## TIED applicability

Full TIED — [tied-boundary.md](../prompt-shared/tied-boundary.md).

## Procedure

Import a set of skills and apply them to this project. Process the
invocation remainder in this order:

1. **Refine** — [tied-refine.md](../prompt-shared/tied-refine.md)
2. **Plan** — [tied-plan-citdp.md](../prompt-shared/tied-plan-citdp.md)
3. **Implement** — [tied-implement.md](../prompt-shared/tied-implement.md)

## Gates

Same as plan-new-feature.

## Forbidden

`pbpaste`/`pbcopy`, automatic git, routing through prompt-type-router recursively.
