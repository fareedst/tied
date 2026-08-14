---
name: question
description: Minimal question workflow—no CITDP, Tracker, or Implement blocks. Use when the caller names question, wants a quick answer, or needs a minimal agent prefix. Do not use for full TIED planning, debug, or build-plan workflows.
disable-model-invocation: true
---

# question

Explicit invocation only (`@question` or `prompt-type: question`).

This skill is the workflow source of truth for client prompt-type invocation.
`copy_files.sh` installs it under `.cursor/skills/question/`. Task wrappers under
`.cursor/agents/` remain TIED-source development artifacts only.
[REQ-PROMPT_TYPE_GLOBAL_SKILLS] [ARCH-PROMPT_TYPE_GLOBAL_SKILLS]
[IMPL-PROMPT_TYPE_GLOBAL_SKILLS]

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
