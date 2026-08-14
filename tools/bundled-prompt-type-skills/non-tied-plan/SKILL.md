---
name: non-tied-plan
description: Ordinary development plan inside a TIED client without TIED synchronization writes. May read TIED/YAML for context. Use when the caller names non-tied-plan, wants development outside TIED tracking, or explicitly bypasses CITDP/Tracker. Do not use for plan-new-feature, build-plan, or non-tied-debug.
disable-model-invocation: true
---

# non-tied-plan

Explicit invocation only (`@non-tied-plan` or `prompt-type: non-tied-plan`).

This skill is the workflow source of truth for client prompt-type invocation.
`copy_files.sh` installs it under `.cursor/skills/non-tied-plan/`. Task wrappers under
`.cursor/agents/` remain TIED-source development artifacts only.
[REQ-PROMPT_TYPE_GLOBAL_SKILLS] [ARCH-PROMPT_TYPE_GLOBAL_SKILLS]
[IMPL-PROMPT_TYPE_GLOBAL_SKILLS]


## Inputs

- **Optional prompt envelope:** `prompt-type: non-tied-plan`, `git-condition:`
- **Invocation remainder:** the request after the skill or agent name.

## TIED applicability

TIED-client-local — [non-tied-boundary.md](../prompt-shared/non-tied-boundary.md). Read-only TIED context allowed; **no TIED writes.**

## Procedure

Process the invocation remainder in this order:

1. **Refine (simple)** — [non-tied-refine.md](../prompt-shared/non-tied-refine.md)
2. **Plan (simple)** — [non-tied-plan.md](../prompt-shared/non-tied-plan.md) plan section
3. **Implement (simple)** — [non-tied-plan.md](../prompt-shared/non-tied-plan.md) implement section

## Gates

Test strategy before code (no TIED pseudo-code gate enforcement via TIED tools).

## Forbidden

All items in [non-tied-boundary.md](../prompt-shared/non-tied-boundary.md); `pbpaste`/`pbcopy`; automatic git.
