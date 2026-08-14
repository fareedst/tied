---
name: debug
description: TIED bug workflow: Refine (debug gate), Capture Failure, Plan, Implement. Use when the caller names debug, reports a TIED-tracked bug, or needs failure reproduction before planning. Do not use for non-tied-debug, question, or plan-new-feature.
disable-model-invocation: true
---

# debug

Explicit invocation only (`@debug` or `prompt-type: debug`).

This skill is the workflow source of truth for client prompt-type invocation.
`copy_files.sh` installs it under `.cursor/skills/debug/`. Task wrappers under
`.cursor/agents/` remain TIED-source development artifacts only.
[REQ-PROMPT_TYPE_GLOBAL_SKILLS] [ARCH-PROMPT_TYPE_GLOBAL_SKILLS]
[IMPL-PROMPT_TYPE_GLOBAL_SKILLS]


## Inputs

- **Optional prompt envelope:** `prompt-type: debug`, `git-condition:`
- **Invocation remainder:** the bug report after the skill or agent name.

## TIED applicability

Full TIED debug — [tied-boundary.md](../prompt-shared/tied-boundary.md).

## Procedure

Process the invocation remainder in this order:

1. **Refine (debug)** — [tied-refine.md](../prompt-shared/tied-refine.md) debug variant
2. **Capture Failure** — [tied-capture-failure.md](../prompt-shared/tied-capture-failure.md)
3. **Plan** — [tied-plan-citdp.md](../prompt-shared/tied-plan-citdp.md)
4. **Implement** — [tied-implement.md](../prompt-shared/tied-implement.md)

## Gates

- Refine: do not test or code until ambiguity cleared
- Capture Failure: do not start plan until test reproduces failure
- Plan: pseudo-code + test strategy before code

## Forbidden

`pbpaste`/`pbcopy`, automatic git, unapproved repo inspection.
