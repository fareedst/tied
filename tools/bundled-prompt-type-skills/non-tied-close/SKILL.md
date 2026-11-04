---
name: non-tied-close
description: "Agent-mode scoped git close for non-TIED sequence work without unified TIED close_out gates. Use when the caller names non-tied-close. Do not use for close-out (full TIED)."
disable-model-invocation: true
---

# non-tied-close

Explicit invocation only (`@non-tied-close` or `prompt-type: non-tied-close`).

[REQ-PROMPT_TYPE_SKILL_EXECUTION_MODE] [REQ-PROMPT_TYPE_GLOBAL_SKILLS]

## Execution mode

**skill execution mode:** agent

See [prompt-execution-mode.md](../prompt-shared/prompt-execution-mode.md).

## Inputs

- **Invocation remainder:** optional close notes.
- **Git context:** [git-context-templates.md](../prompt-shared/git-context-templates.md) when relevant.

## Procedure

1. **Close** — [non-tied-close.md](../prompt-shared/non-tied-close.md)

## Forbidden

- Unified TIED `close_out` gate stack unless sponsor switches to `@close-out`
- `pbpaste`/`pbcopy`; automatic push
