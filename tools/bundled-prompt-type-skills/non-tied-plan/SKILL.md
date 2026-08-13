---
name: non-tied-plan
description: >-
  Ordinary development plan inside a TIED client without TIED synchronization
  writes. May read TIED/YAML for context. Use when the caller names non-tied-plan,
  wants development outside TIED tracking, or explicitly bypasses CITDP/Tracker.
  Do not use for plan-new-feature, build-plan, or non-tied-debug.
disable-model-invocation: true
---

# non-tied-plan

Explicit invocation only (`@non-tied-plan` or `prompt-type: non-tied-plan`).

The project-scoped Task wrapper at
`.cursor/agents/non-tied-plan.md` delegates to this skill when isolated
foreground TIED-client-local implementation is requested; this skill remains
the workflow source of truth. `copy_files.sh` installs that wrapper into client
projects as a managed artifact. [REQ-PROMPT_TYPE_SUBAGENT]
[ARCH-PROMPT_TYPE_SUBAGENT] [IMPL-TIED_FILES]

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
