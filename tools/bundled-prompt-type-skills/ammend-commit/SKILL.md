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

This skill is the workflow source of truth for client prompt-type invocation.
`copy_files.sh` installs it under `.cursor/skills/ammend-commit/`. Task wrappers under
`.cursor/agents/` remain TIED-source development artifacts only.
[REQ-PROMPT_TYPE_GLOBAL_SKILLS] [ARCH-PROMPT_TYPE_GLOBAL_SKILLS]
[IMPL-PROMPT_TYPE_GLOBAL_SKILLS]


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
