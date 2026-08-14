---
name: leap-diff-promote
description: Promotes git diff patches onto a TIED-complete stage: process, CHANGELOG, proposed commit—do not commit. Use when the caller names leap-diff-promote, promotes diff onto staged TIED-complete files, or close-outs diff patches. Do not use for plan-close-out or ammend-commit.
disable-model-invocation: true
---

# leap-diff-promote

Explicit invocation only (`@leap-diff-promote` or `prompt-type: leap-diff-promote`).

This skill is the workflow source of truth for client prompt-type invocation.
`copy_files.sh` installs it under `.cursor/skills/leap-diff-promote/`. Task wrappers under
`.cursor/agents/` remain TIED-source development artifacts only.
[REQ-PROMPT_TYPE_GLOBAL_SKILLS] [ARCH-PROMPT_TYPE_GLOBAL_SKILLS]
[IMPL-PROMPT_TYPE_GLOBAL_SKILLS]


## Inputs

- **Optional prompt envelope:** `prompt-type: leap-diff-promote`, `git-condition:`
- **Git context:** caller-pasted [git_preamble_diff_promote](../prompt-shared/git-context-templates.md)
- **Invocation remainder:** optional issue text after the skill or agent name.

## TIED applicability

Git-context + TIED — [tied-boundary.md](../prompt-shared/tied-boundary.md).

## Procedure

1. Apply caller-supplied git preamble (diff-promote variant)
2. **Process** — [tied-close-out-process.md](../prompt-shared/tied-close-out-process.md) (standard prologue)
3. Apply optional invocation remainder

## Gates

**Do not commit.**

## Forbidden

`git add`, `git commit`, `pbpaste`/`pbcopy`, automatic git inspection.
