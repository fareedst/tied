---
name: leap-ad-hoc
description: Fortifies staged ad-hoc code: Read Ad-Hoc Changes, Refine, Plan (no Tracker copy), Implement. Use when the caller names leap-ad-hoc, fortifies git-staged work without prior CITDP, or LEAP-syncs ad-hoc changes. Do not use without caller-supplied staged context; do not auto-run git diff.
disable-model-invocation: true
---

# leap-ad-hoc

Explicit invocation only (`@leap-ad-hoc` or `prompt-type: leap-ad-hoc`).

This skill is the workflow source of truth for client prompt-type invocation.
`copy_files.sh` installs it under `.cursor/skills/leap-ad-hoc/`. Task wrappers under
`.cursor/agents/` remain TIED-source development artifacts only.
[REQ-PROMPT_TYPE_GLOBAL_SKILLS] [ARCH-PROMPT_TYPE_GLOBAL_SKILLS]
[IMPL-PROMPT_TYPE_GLOBAL_SKILLS]


## Inputs

- **Optional prompt envelope:** `prompt-type: leap-ad-hoc`, `git-condition:`
- **Staged changes context:** caller must supply (no automatic `git diff`)
- **Invocation remainder:** optional issue text after the skill or agent name.

## TIED applicability

Git-context + TIED — [tied-boundary.md](../prompt-shared/tied-boundary.md).

## Procedure

Process staged changes and the optional invocation remainder in this order:

1. **Read Ad-Hoc** — [tied-read-ad-hoc.md](../prompt-shared/tied-read-ad-hoc.md)
2. Apply caller git note from [git-context-templates.md](../prompt-shared/git-context-templates.md) (leap-ad-hoc section)
3. **Refine (ad-hoc)** — [tied-refine.md](../prompt-shared/tied-refine.md) ad-hoc variant
4. **Plan (ad-hoc)** — [tied-plan-ad-hoc.md](../prompt-shared/tied-plan-ad-hoc.md) (no Tracker copy step)
5. **Implement** — [tied-implement.md](../prompt-shared/tied-implement.md)

## Gates

Understand staged work first; pseudo-code + test strategy before code.

## Forbidden

Automatic `git diff`/`git status`; `pbpaste`/`pbcopy`; proceeding without staged context.
