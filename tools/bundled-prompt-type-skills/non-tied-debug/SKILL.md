---
name: non-tied-debug
description: >-
  Ordinary bug debugging inside a TIED client without TIED synchronization
  writes. May read TIED/YAML for domain context. Use when the caller names
  non-tied-debug, debugs outside TIED tracking, or reproduces failures without
  CITDP. Do not use for debug (TIED), plan-new-feature, or non-tied-plan.
disable-model-invocation: true
---

# non-tied-debug

Explicit invocation only (`@non-tied-debug` or `prompt-type: non-tied-debug`).

This skill is the workflow source of truth for client prompt-type invocation.
`copy_files.sh` installs it under `.cursor/skills/non-tied-debug/`. Task wrappers under
`.cursor/agents/` remain TIED-source development artifacts only.
[REQ-PROMPT_TYPE_GLOBAL_SKILLS] [ARCH-PROMPT_TYPE_GLOBAL_SKILLS]
[IMPL-PROMPT_TYPE_GLOBAL_SKILLS]


## Inputs

- **Optional prompt envelope:** `prompt-type: non-tied-debug`, `git-condition:`
- **Invocation remainder:** the request after the skill or agent name.

## TIED applicability

TIED-client-local — [non-tied-boundary.md](../prompt-shared/non-tied-boundary.md).

## Procedure

Process the invocation remainder in this order:

1. **Refine (simple)** — [non-tied-refine.md](../prompt-shared/non-tied-refine.md)
2. **Plan (simple debug)** — [non-tied-plan.md](../prompt-shared/non-tied-plan.md) debug plan section
3. **Implement (simple)** — [non-tied-plan.md](../prompt-shared/non-tied-plan.md) implement section

## Gates

Do not start code until test strategy in place.

## Forbidden

All items in [non-tied-boundary.md](../prompt-shared/non-tied-boundary.md); `pbpaste`/`pbcopy`; automatic git.
