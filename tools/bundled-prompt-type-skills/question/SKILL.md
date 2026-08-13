---
name: question
description: >-
  Minimal question workflow—no CITDP, Tracker, or Implement blocks. Use when
  the caller names question, wants a quick answer, or needs a minimal agent
  prefix. Do not use for full TIED planning, debug, or build-plan workflows.
disable-model-invocation: true
---

# question

Explicit invocation only (`@question` or `prompt-type: question`).

The project-scoped Task wrapper at
`.cursor/agents/question.md` delegates to this skill when isolated
Task execution is requested; this skill remains the workflow source
of truth. `copy_files.sh` installs that wrapper into client projects as a
managed artifact. [REQ-PROMPT_TYPE_SUBAGENT]
[ARCH-PROMPT_TYPE_SUBAGENT] [IMPL-TIED_FILES]

## Inputs

- **Optional prompt envelope:** `prompt-type: question`, `git-condition:` (informational)
- **Invocation remainder:** the question after the skill or agent name.

## TIED applicability

None — minimal workflow only.

## Procedure

Answer the invocation remainder.

## Gates

None.

## Forbidden

CITDP/Tracker/Implement TIED blocks; `pbpaste`/`pbcopy`; automatic git.
