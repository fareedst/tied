---
name: citdp-record
description: "Standalone CITDP analysis and persist via citdp_record_write without project V+R+A+I writes. Use when the caller names citdp-record, wants a change record before or after work, or needs CITDP-only traceability. Do not use for non-tied-plan (no CITDP), citdp-promote (full enforcement), or add-feature (full stack from the start)."
disable-model-invocation: true
---

# citdp-record

Explicit invocation only (`@citdp-record` or `prompt-type: citdp-record`).

This skill is the workflow source of truth for client prompt-type invocation.
`tied-install.sh` installs it under `.cursor/skills/citdp-record/`. Task wrappers under
`.cursor/agents/` remain TIED-source development artifacts only.
[REQ-PROMPT_TYPE_CITDP_RECORD_PROMOTE] [REQ-PROMPT_TYPE_GLOBAL_SKILLS]
[ARCH-PROMPT_TYPE_GLOBAL_SKILLS] [IMPL-PROMPT_TYPE_GLOBAL_SKILLS]

## Inputs

- **Optional prompt envelope:** `prompt-type: citdp-record`, `git-condition:` (informational)
- **Invocation remainder:** the change description; note **prospective** or **retrospective** timing when relevant.

## TIED applicability

CITDP-only — [citdp-only-boundary.md](../prompt-shared/citdp-only-boundary.md).

## Procedure

Process the invocation remainder in this order:

1. **Refine** — [tied-refine-citdp-record.md](../prompt-shared/tied-refine-citdp-record.md)
2. **Plan** — [tied-plan-citdp-record.md](../prompt-shared/tied-plan-citdp-record.md)

**No Implement section** in this leaf. Pair with `@non-tied-plan` for token-free code or `@citdp-promote` for enforcement.

## Gates

- Select `depth_tier` and `gate_policy` at `risk-assessment`.
- Do not mutate project V+R+A+I indexes or IMPL pseudo-code sidecars.

## Outputs

- Persisted `tied-project/citdp/CITDP-*.yaml`
- Working-folder evidence path when used
- Handoff to `@citdp-promote` or `@non-tied-plan`

## Forbidden

All items in [citdp-only-boundary.md](../prompt-shared/citdp-only-boundary.md); `pbpaste`/`pbcopy`; automatic git; production code in this leaf unless sponsor explicitly changes prompt type.
