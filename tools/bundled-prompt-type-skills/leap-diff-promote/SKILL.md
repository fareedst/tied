---
name: leap-diff-promote
description: >-
  Promotes git diff patches onto a TIED-complete stage: process, CHANGELOG,
  proposed commit—do not commit. Use when the caller names leap-diff-promote,
  promotes diff onto staged TIED-complete files, or close-outs diff patches. Do
  not use for plan-close-out or ammend-commit.
disable-model-invocation: true
---

# leap-diff-promote

Explicit invocation only (`@leap-diff-promote` or `prompt-type: leap-diff-promote`).

The project-scoped Task wrapper at
`.cursor/agents/leap-diff-promote.md` delegates to this skill when isolated
foreground close-out is requested; this skill remains the workflow source
of truth. `copy_files.sh` installs that wrapper into client projects as a
managed artifact. [REQ-PROMPT_TYPE_SUBAGENT]
[ARCH-PROMPT_TYPE_SUBAGENT] [IMPL-TIED_FILES]

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
