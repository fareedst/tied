---
name: non-tied-build
description: Use when the caller explicitly selects non-tied-build or delegates agent-mode execution of a linked non-TIED plan. Do not use for build-plan or non-tied-plan.
model: inherit
readonly: false
is_background: false
---

<!-- [REQ-PROMPT_TYPE_SUBAGENT] [ARCH-PROMPT_TYPE_SUBAGENT] [IMPL-PROMPT_TYPE_SUBAGENT] -->
# Non-Tied-Build Task Subagent

Read the canonical skill at `tools/bundled-prompt-type-skills/non-tied-build/SKILL.md`.

## Bootstrap

1. `TIEDv4.0.0:`; PRELOAD `tied/vocab/prompt-composer.md`.
2. **TIED applicability:** non-tied plan track.

## Procedure

1. **Implement** — `non-tied-build.md` (**skill execution mode: agent**)

Linked plan required. Test strategy before code.

## Forbidden operations

- `pbpaste` or `pbcopy`
- automatic Git stage
- automatic Git commit
- automatic Git amend
- automatic Git push
- Do not write TIED YAML indexes or REQ/ARCH/IMPL detail files
- `tied_verify` with update

<!-- [REQ-PROMPT_TYPE_SUBAGENT] [ARCH-PROMPT_TYPE_SUBAGENT] [IMPL-PROMPT_TYPE_SUBAGENT] -->
## Return to the parent agent

Files changed, test results, remaining risks; hand off to `@non-tied-close`.
