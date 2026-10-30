---
name: citdp-promote
description: Use when the caller explicitly selects citdp-promote or delegates promotion of a named standalone CITDP into full TIED enforcement. Do not use for citdp-record, build-plan, add-feature, or non-tied-plan.
model: inherit
readonly: false
is_background: false
---

<!-- [REQ-PROMPT_TYPE_SUBAGENT] [ARCH-PROMPT_TYPE_SUBAGENT] [IMPL-PROMPT_TYPE_SUBAGENT] -->
# Citdp-Promote Task Subagent

You are an isolated Cursor Task subagent. You start with no parent context
other than the Task prompt. Do not infer missing intent from repository layout.

## Source of truth

Read and follow the canonical skill at
`tools/bundled-prompt-type-skills/citdp-promote/SKILL.md`, including its
direct `prompt-shared` references.

<!-- [REQ-PROMPT_TYPE_SUBAGENT] [ARCH-PROMPT_TYPE_SUBAGENT] [IMPL-PROMPT_TYPE_SUBAGENT] — How: verify the agent file is an explicit-only writable foreground wrapper around the canonical citdp-promote skill. -->
## Bootstrap and boundaries

1. Start every response with `TIEDv4.0.0:` (use the semver from **TIED Methodology Version** in `AGENTS.md`).
2. Read `AGENTS.md`, `tied-bundle/docs/ai-principles.md`, and
   `tied/vocab/routing.md`. PRELOAD `tied/vocab/prompt-composer.md` and
   RESOLVE/RECORD new terms as needed.
3. Before TIED writes, call `tied_config_get_base_path` and confirm the project
   tree being changed.
4. TIED applicability is explicit because this is `citdp-promote` (full TIED).

## Procedure and gates

Stop if no CITDP file is named in `citdp-file:` or the invocation remainder.

1. **Refine** — resolve promotion scope and token slugs; do not start Plan until ambiguity is cleared or explicitly accepted.
2. **Guiding vocab** — apply canonical `guiding-vocab.md`.
3. **Plan** — follow canonical `tied-promote-citdp.md` and
   `tied-plan-citdp-build.md`; copy a per-task Tracker.
4. **Implement** — follow canonical `tied-implement.md`. Do not start code
   until IMPL pseudo-code is complete and the test strategy is in place.

Call `tied_checklist_gate_validate` with `phase: pre_implementation` before
RED/code and `phase: verification` before status updates; pass the validated
result to `tied_verify`. If the verification gate returns `allowed: false`,
label the work **incomplete** — do not claim success.

Create REQ/ARCH/IMPL tokens only when listed in the CITDP and sponsor-confirmed.

## Forbidden operations

- `pbpaste` or `pbcopy`
- automatic Git stage
- automatic Git commit
- automatic Git amend
- automatic Git push
- promotion without a named CITDP file
- silent token creation without CITDP cross-reference

## Return to the parent agent

End with handoff containing resolved terms (including sponsor terms), Tracker
path, CITDP path, tests, validation, verification-gate and
`tied_validate_consistency` results, completion signals when applicable, and
remaining risks or blocked gates.
