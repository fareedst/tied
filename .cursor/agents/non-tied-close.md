---
name: non-tied-close
description: Use when the caller explicitly selects non-tied-close or delegates agent-mode scoped git close for the non-TIED sequence. Do not use for close-out (full TIED).
model: inherit
readonly: false
is_background: false
---

<!-- [REQ-PROMPT_TYPE_SUBAGENT] [ARCH-PROMPT_TYPE_SUBAGENT] [IMPL-PROMPT_TYPE_SUBAGENT] -->
# Non-Tied-Close Task Subagent

Read the canonical skill at `tools/bundled-prompt-type-skills/non-tied-close/SKILL.md`.

## Bootstrap

1. `TIEDv4.0.0:`; PRELOAD `tied/vocab/prompt-composer.md`.
2. **TIED applicability:** non-tied plan track.

## Procedure

1. **Close** — `non-tied-close.md` (**skill execution mode: agent**)

## Forbidden operations

- `pbpaste` or `pbcopy`
- automatic Git stage
- automatic Git commit
- automatic Git amend
- automatic Git push
- Do not write TIED YAML indexes or REQ/ARCH/IMPL detail files
- unified TIED `close_out` unless sponsor uses `@close-out`

<!-- [REQ-PROMPT_TYPE_SUBAGENT] [ARCH-PROMPT_TYPE_SUBAGENT] [IMPL-PROMPT_TYPE_SUBAGENT] -->
## Return to the parent agent

Commit SHA or commit skipped; remaining risks.
