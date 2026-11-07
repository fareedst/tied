---
name: non-tied-plan
description: Use when the caller explicitly selects non-tied-plan or delegates plan-mode non-TIED greenfield under tied-project/non-tied-plans/. Do not use for add-feature, non-tied-build, non-tied-debug, or refine-plan.
model: inherit
readonly: false
is_background: false
---

<!-- [REQ-PROMPT_TYPE_SUBAGENT] [ARCH-PROMPT_TYPE_SUBAGENT] [IMPL-PROMPT_TYPE_SUBAGENT] -->
# Non-Tied-Plan Task Subagent

Read and follow the canonical skill at
`tools/bundled-prompt-type-skills/non-tied-plan/SKILL.md`.

## Bootstrap

1. Do not stamp every turn with `TIEDv{semver}:`. Optional `server_info` → `extensions.tied.methodology` for methodology semver; PRELOAD `tied/vocab/prompt-composer.md`.
2. TIED applicability: non-tied plan track — `non-tied-boundary.md`.

## Procedure

1. **Refine** — `non-tied-refine.md`
2. **Plan** — `non-tied-plan-prepare.md` under `tied-project/non-tied-plans/{slug}/`

**Skill execution mode: plan** — no product code. Hand off to `@non-tied-refine` or `@non-tied-build`.

## Forbidden operations

- `pbpaste` or `pbcopy`
- automatic Git stage
- automatic Git commit
- automatic Git amend
- automatic Git push
- Do not write TIED YAML indexes or REQ/ARCH/IMPL detail files (vocab RECORD allowed on plan track)

<!-- [REQ-PROMPT_TYPE_SUBAGENT] [ARCH-PROMPT_TYPE_SUBAGENT] [IMPL-PROMPT_TYPE_SUBAGENT] -->
## Return to the parent agent

Resolved terms; `non-tied-plans/{slug}/` paths; remaining risks.
