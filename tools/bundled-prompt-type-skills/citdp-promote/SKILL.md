---
name: citdp-promote
description: "Promote a named standalone CITDP into full TIED enforcement (V+R+A+I, Tracker, gates, implement). Use when the caller names citdp-promote and supplies a CITDP filename. Do not use for citdp-record (CITDP-only), build-plan (linked PLAN execute), or add-feature (greenfield without a CITDP entry)."
disable-model-invocation: true
---

# citdp-promote

Explicit invocation only (`@citdp-promote` or `prompt-type: citdp-promote`).

This skill is the workflow source of truth for client prompt-type invocation.
`tied-install.sh` installs it under `.cursor/skills/citdp-promote/`. Task wrappers under
`.cursor/agents/` remain TIED-source development artifacts only.
[REQ-PROMPT_TYPE_CITDP_RECORD_PROMOTE] [REQ-PROMPT_TYPE_GLOBAL_SKILLS]
[ARCH-PROMPT_TYPE_GLOBAL_SKILLS] [IMPL-PROMPT_TYPE_GLOBAL_SKILLS]

## Inputs

- **Optional prompt envelope:** `prompt-type: citdp-promote`, `citdp-file:`, `git-condition:` (informational)
- **Invocation remainder:** must name `CITDP-*.yaml` when `citdp-file:` is absent.

## TIED applicability

Full TIED — [tied-boundary.md](../prompt-shared/tied-boundary.md).

## Procedure

1. **Refine** — [tied-refine.md](../prompt-shared/tied-refine.md) (confirm promotion scope and token slugs)
2. **Guiding vocab** — [guiding-vocab.md](../prompt-shared/guiding-vocab.md)
3. **Plan** — [tied-promote-citdp.md](../prompt-shared/tied-promote-citdp.md)
4. **Implement** — [tied-implement.md](../prompt-shared/tied-implement.md)

Select `profile_depth` and gate policy before depth-dependent inquiry. Copy the per-task Tracker; use the named CITDP as the change record input to gates.

If no CITDP file is named, stop.

## Gates

- Before RED/code: `tied_checklist_gate_validate` with `phase: pre_implementation`, Tracker, and CITDP.
- At verification: same validator with `phase: verification`; pass result to `tied_verify` when updating status.
- Token creation only when listed in CITDP `impact_analysis.tied_tokens_new` and sponsor-confirmed.

## Outputs

- Updated project V+R+A+I as scoped
- Implementation per Tracker; CITDP `leap_feedback` updated on divergence

## Forbidden

`pbpaste`/`pbcopy`, automatic git, unapproved repo inspection, promotion without a named CITDP file.
