---
name: plan-close-out
description: Staged LEAP close-out: process stack sync, CHANGELOG, and proposed commit message without committing. Use when the caller names plan-close-out, closes out staged TIED work, or prepares a commit from staged changes. Do not use for ammend-commit, leap-diff-promote, or planning new features.
disable-model-invocation: true
---

# plan-close-out

Explicit invocation only (`@plan-close-out` or `prompt-type: plan-close-out`).

This skill is the workflow source of truth for client prompt-type invocation.
`copy_files.sh` installs it under `.cursor/skills/plan-close-out/`. Task wrappers under
`.cursor/agents/` remain TIED-source development artifacts only.
[REQ-PROMPT_TYPE_GLOBAL_SKILLS] [ARCH-PROMPT_TYPE_GLOBAL_SKILLS]
[IMPL-PROMPT_TYPE_GLOBAL_SKILLS]


## Inputs

- **Optional prompt envelope:** `prompt-type: plan-close-out`, `git-condition:`
- **Git context:** caller-pasted [git_preamble_close_out](../prompt-shared/git-context-templates.md)
- **Invocation remainder:** optional issue text after the skill or agent name.

## TIED applicability

Git-context + TIED — [tied-boundary.md](../prompt-shared/tied-boundary.md).

## Procedure

1. Apply caller-supplied git preamble (close-out variant)
2. **Process** — [tied-close-out-process.md](../prompt-shared/tied-close-out-process.md) (standard prologue)
3. Apply optional invocation remainder

## Gates

LEAP close-out complete; **do not commit.**

## Outputs

Updated IMPL/ARCH/REQ as needed; CHANGELOG entry; proposed commit message.

## Forbidden

`git add`, `git commit`, `pbpaste`/`pbcopy`, automatic git inspection.
