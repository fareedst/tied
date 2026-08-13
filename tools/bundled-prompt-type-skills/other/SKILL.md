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

The project-scoped Task wrapper at
`.cursor/agents/other.md` delegates to this skill when isolated
Task execution is requested; this skill remains the workflow source
of truth. `copy_files.sh` installs that wrapper into client projects as a
managed artifact. [REQ-PROMPT_TYPE_SUBAGENT]
[ARCH-PROMPT_TYPE_SUBAGENT] [IMPL-TIED_FILES]

## Inputs

- **Optional prompt envelope:** `prompt-type: other`, `git-condition:` (informational)
- **Invocation remainder:** the request after the skill or agent name.

## Procedure

Process the invocation remainder.

## Gates

None.

## Forbidden

CITDP/Tracker/Implement TIED blocks; `pbpaste`/`pbcopy`; automatic git.
