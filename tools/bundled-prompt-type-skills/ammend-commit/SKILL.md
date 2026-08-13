---
name: ammend-commit
description: >-
  Staged patches to amend the last commit: TIED process, CHANGELOG, proposed
  amend message—do not commit. Use when the caller names ammend-commit (preserve
  spelling), amends the most recent commit from staged patches, or prepares an
  amend message. Do not use for plan-close-out or leap-diff-promote.
disable-model-invocation: true
---

# ammend-commit

Explicit invocation only (`@ammend-commit` or `prompt-type: ammend-commit`).

The project-scoped Task wrapper at
`.cursor/agents/ammend-commit.md` delegates to this skill when isolated
foreground amend preparation is requested; this skill remains the workflow source
of truth. `copy_files.sh` installs that wrapper into client projects as a
managed artifact. [REQ-PROMPT_TYPE_SUBAGENT]
[ARCH-PROMPT_TYPE_SUBAGENT] [IMPL-TIED_FILES]

**Spelling:** directory and `name:` use `ammend-commit` (not amend-commit).

## Inputs

- **Optional prompt envelope:** `prompt-type: ammend-commit`, `git-condition:`
- **Git context:** caller-pasted [git_preamble_ammend](../prompt-shared/git-context-templates.md)
- **Invocation remainder:** optional issue text after the skill or agent name.

## TIED applicability

Git-context + TIED — [tied-boundary.md](../prompt-shared/tied-boundary.md).

## Procedure

1. Apply caller-supplied git preamble (ammend variant)
2. **Process** — [tied-close-out-process.md](../prompt-shared/tied-close-out-process.md)
3. **Prologue (ammend)** — same file, ammend-commit section
4. Apply optional invocation remainder

## Gates

**Do not commit.**

## Forbidden

`git add`, `git commit`, `git commit --amend`, `pbpaste`/`pbcopy`, automatic git.
