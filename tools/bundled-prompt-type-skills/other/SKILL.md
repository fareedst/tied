---
name: other
description: >-
  Minimal custom workflow—same shape as question with no TIED blocks. Use when
  the caller names other, needs a custom prefix without CITDP, or selects the
  Other prompt type. Do not use for question (semantic difference is caller
  intent only) or any full TIED workflow.
disable-model-invocation: true
---

# other

Explicit invocation only (`@other` or `prompt-type: other`).

This skill is the workflow source of truth for client prompt-type invocation.
`copy_files.sh` installs it under `.cursor/skills/other/`. Task wrappers under
`.cursor/agents/` remain TIED-source development artifacts only.
[REQ-PROMPT_TYPE_GLOBAL_SKILLS] [ARCH-PROMPT_TYPE_GLOBAL_SKILLS]
[IMPL-PROMPT_TYPE_GLOBAL_SKILLS]

## Inputs

- **Optional prompt envelope:** `prompt-type: other`, `git-condition:` (informational)
- **Invocation remainder:** the request after the skill or agent name.

## Procedure

Process the invocation remainder.

## Gates

None.

## Forbidden

CITDP/Tracker/Implement TIED blocks; `pbpaste`/`pbcopy`; automatic git.
