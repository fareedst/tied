---
name: plan-new-feature
description: Plans a new TIED-tracked feature with Refine, CITDP analysis, and Implement gates. Use when the caller names plan-new-feature, plans a new requirement with full TIED traceability, or starts feature work with Tracker and IMPL pseudo-code. Do not use for build-plan (execute an existing linked plan), refine-plan (improve a linked plan), non-tied-plan, question, or other minimal prompts.
disable-model-invocation: true
---

# plan-new-feature

Explicit invocation only (`@plan-new-feature` or caller names `prompt-type: plan-new-feature`).

This skill is the workflow source of truth for client prompt-type invocation.
`copy_files.sh` installs it under `.cursor/skills/plan-new-feature/`. Task wrappers under
`.cursor/agents/` remain TIED-source development artifacts only.
[REQ-PROMPT_TYPE_GLOBAL_SKILLS] [ARCH-PROMPT_TYPE_GLOBAL_SKILLS]
[IMPL-PROMPT_TYPE_GLOBAL_SKILLS]


## Inputs

- **Optional prompt envelope:** `prompt-type: plan-new-feature`, `git-condition:` (informational only)
- **Invocation remainder:** the request text after the skill or agent name.
  That text is the requirement. Do not treat a linked plan as the request.
- **Git context:** caller-pasted text from [git-context-templates.md](../prompt-shared/git-context-templates.md) when relevant

## TIED applicability

Full TIED tracking — see [tied-boundary.md](../prompt-shared/tied-boundary.md).

## Procedure

Process the invocation remainder in this order:

1. **Refine** — [tied-refine.md](../prompt-shared/tied-refine.md) (default variant)
2. **Plan** — [tied-plan-citdp.md](../prompt-shared/tied-plan-citdp.md)
3. **Implement** — [tied-implement.md](../prompt-shared/tied-implement.md)

## Gates

- Refine: do not start plan until ambiguity cleared
- Plan: do not start code until IMPL pseudo-code (block comments) and test strategy in place

## Outputs

- Resolved sponsor terms; per-task Tracker copy path
- CITDP analysis (persist `tied/citdp/CITDP-*.yaml` after implementation)
- Test strategy; RED tests before code

## Forbidden

- `pbpaste`/`pbcopy`, automatic git mutation, unapproved repo inspection
- Inferring TIED from repo layout
