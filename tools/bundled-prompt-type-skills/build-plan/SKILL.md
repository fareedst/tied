---
name: build-plan
description: Executes a refined TIED linked plan with guiding vocab, CITDP build Plan, and Implement gates—no Refine section. Use when the caller names build-plan, executes an approved linked plan, or implements from a completed plan document. Do not use for refine-plan (improve the linked plan first), plan-new-feature (new feature from scratch), or non-tied-plan.
disable-model-invocation: true
---

# build-plan

Explicit invocation only (`@build-plan` or `prompt-type: build-plan`).

This skill is the workflow source of truth for client prompt-type invocation.
`copy_files.sh` installs it under `.cursor/skills/build-plan/`. Task wrappers under
`.cursor/agents/` remain TIED-source development artifacts only.
[REQ-PROMPT_TYPE_GLOBAL_SKILLS] [ARCH-PROMPT_TYPE_GLOBAL_SKILLS]
[IMPL-PROMPT_TYPE_GLOBAL_SKILLS]


## Inputs

- **Optional prompt envelope:** `prompt-type: build-plan`, `git-condition:` (informational)
- **Linked plan:** the attached or in-message approved plan to execute. Required.
- **Invocation remainder:** optional constraints; do not invent a plan from remainder alone.

## TIED applicability

Full TIED execute — [tied-boundary.md](../prompt-shared/tied-boundary.md). **Omits Refine.**

## Procedure

Execute the linked plan in this order:

1. **Guiding vocab** — [guiding-vocab.md](../prompt-shared/guiding-vocab.md)
2. **Plan** — [tied-plan-citdp-build.md](../prompt-shared/tied-plan-citdp-build.md)
3. **Implement** — [tied-implement.md](../prompt-shared/tied-implement.md)

Select `profile_depth` (`minimal`, `integrated`, or `strict_candidate`) and
gate policy before depth-dependent inquiry. The linked Tracker and CITDP are
inputs to every gate; do not substitute caller assertions for their evidence.

If neither a linked plan nor an in-message plan is present, stop.

## Gates

- Before implementation, call `tied_checklist_gate_validate` with
  `phase: pre_implementation`. Do not start code until it allows progression.
- At verification, call the same validator with `phase: verification` and pass
  its validated result to `tied_verify`; integrated depth requires the matching
  inquiry receipt and all four bounded artifacts.
- Missing, malformed, stale, or unjustified process evidence blocks progression.

## Outputs

Implementation per Tracker; CITDP record after behavior changes; verification gate.

## Forbidden

`pbpaste`/`pbcopy`, automatic git, unapproved repo inspection, Refine section.
