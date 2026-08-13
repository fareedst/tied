---
name: use-skill
description: >-
  Imports skills and applies them to the project with full TIED Refine, Plan,
  and Implement gates. Use when the caller names use-skill, imports Cursor
  skills to a project, or applies skill instructions in the invocation
  remainder. Do not use for prompt-type-router, question, or non-tied-plan.
disable-model-invocation: true
---

# use-skill

Explicit invocation only (`@use-skill` or `prompt-type: use-skill`).

The project-scoped Task wrapper at
`.cursor/agents/use-skill.md` delegates to this skill when isolated
foreground implementation is requested; this skill remains the workflow source
of truth. `copy_files.sh` installs that wrapper into client projects as a
managed artifact. [REQ-PROMPT_TYPE_SUBAGENT]
[ARCH-PROMPT_TYPE_SUBAGENT] [IMPL-TIED_FILES]

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
