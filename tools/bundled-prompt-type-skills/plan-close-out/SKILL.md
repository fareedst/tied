---
name: plan-close-out
description: >-
  Staged LEAP close-out: process stack sync, CHANGELOG, and proposed commit
  message without committing. Use when the caller names plan-close-out, closes
  out staged TIED work, or prepares a commit from staged changes. Do not use
  for ammend-commit, leap-diff-promote, or planning new features.
disable-model-invocation: true
---

# plan-close-out

Explicit invocation only (`@plan-close-out` or `prompt-type: plan-close-out`).

The project-scoped Task wrapper at
`.cursor/agents/plan-close-out.md` delegates to this skill when isolated
foreground close-out is requested; this skill remains the workflow source
of truth. `copy_files.sh` installs that wrapper into client projects as a
managed artifact. [REQ-PROMPT_TYPE_SUBAGENT]
[ARCH-PROMPT_TYPE_SUBAGENT] [IMPL-TIED_FILES]

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
