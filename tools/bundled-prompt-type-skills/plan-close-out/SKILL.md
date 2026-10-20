---
name: plan-close-out
description: "Staged LEAP close-out with CHANGELOG, default git hygiene preview, and traceable commit when unified close_out allows. Use when the caller names plan-close-out, closes out staged TIED work, or finishes a REQ with commit. Do not use for ammend-commit, leap-diff-promote, or planning new features."
disable-model-invocation: true
---

# plan-close-out

Explicit invocation only (`@plan-close-out` or `prompt-type: plan-close-out`).

This skill is the workflow source of truth for client prompt-type invocation.
`tied-install.sh` installs it under `.cursor/skills/plan-close-out/`. Task wrappers under
`.cursor/agents/` remain TIED-source development artifacts only.
[REQ-PROMPT_TYPE_GLOBAL_SKILLS] [ARCH-PROMPT_TYPE_GLOBAL_SKILLS]
[IMPL-PROMPT_TYPE_GLOBAL_SKILLS]


## Inputs

- **Optional prompt envelope:** `prompt-type: plan-close-out`, `git-condition:`
- **Git context:** caller-pasted [git_preamble_plan_close_out](../prompt-shared/git-context-templates.md) (or close-out variant when describing prep-only state)
- **Invocation remainder:** optional issue text after the skill or agent name.

## TIED applicability

Git-context + TIED — [tied-boundary.md](../prompt-shared/tied-boundary.md).

## Procedure

1. Apply caller-supplied git preamble ([git_preamble_plan_close_out](../prompt-shared/git-context-templates.md) preferred)
2. **Process** — [tied-close-out-process.md](../prompt-shared/tied-close-out-process.md) (process steps 1–6 only; defer prologue)
3. Apply optional invocation remainder
4. **Optional Jev plan-skills adjunct** (after `sub-close-out-evidence-sync`, before close-out gate) — [jev-plan-skills-adjunct.md](../prompt-shared/jev-plan-skills-adjunct.md)
5. **Optional plan process tools adjunct** (DAE + BBCE) — [plan-process-tools-adjunct.md](../prompt-shared/plan-process-tools-adjunct.md)

Before writing CHANGELOG or making completion claims, select/confirm the
recorded `profile_depth` and gate policy, then call
`tied_checklist_gate_validate` with `phase: close_out`, the final Tracker and
CITDP, and identity-bound activation evidence when `depth_tier` is
`integrated` or `strict_candidate` (prefer `tied_checklist_activation_collect`
when phase artifact dirs exist). **Unified close-out:** also validate
`request-evidence-envelope.v1.json` with `fail_on_error_gaps: true` (or run
`tools/bootstrap/templates/run-close-out-gates.mjs --envelope-blocking --sync-dispositions --reconcile`).
Completion requires gate `allowed: true` **and** zero blocking envelope error
gaps (advisory/warn gaps remain visible). At integrated depth,
`fail_on_error_gaps: true` also blocks process-adherence warn gaps (Wave 6).
**Do not claim complete** without the three completion signals table in handoff.
If either check fails, label the work **incomplete** in the parent handoff — do
not claim completion. Missing, malformed, stale, or unjustified process evidence
is a hard stop. Return the three completion signals per
[completion-signals-handoff.md](../prompt-shared/completion-signals-handoff.md).

6. **When close_out allows** — MCP **`tied_git_hygiene`** with `context_mode: plan_close_out`, `apply: false` (default); write `evidence/git-hygiene-receipt-{YYYY-MM-DD}.md`. Guarded `apply: true` only with sponsor exact `allowed_paths` ([REQ-TIED_GIT_HYGIENE]).
7. **Prologue (plan-close-out)** — [tied-close-out-process.md](../prompt-shared/tied-close-out-process.md): CHANGELOG entry, then [traceable-commit-close-out.md](../prompt-shared/traceable-commit-close-out.md).
8. **When close_out blocked** — Skip steps 6–7 commit portions; handoff lists blockers and **commit skipped** rationale.

## Gates

LEAP close-out complete only after the `close_out` gate allows progression.
**Traceable commit** runs only when step 7 preconditions pass; otherwise incomplete handoff with no commit.

## Outputs

Updated IMPL/ARCH/REQ as needed; gitignore hygiene handoff bullet per
[gitignore-close-out-hygiene.md](../prompt-shared/gitignore-close-out-hygiene.md);
git hygiene receipt path; CHANGELOG entry; **commit SHA** (or explicit **commit skipped**);
`evidence/proposed-commit-message.txt` and `evidence/traceable-commit-evidence.md` when commit runs.

## Forbidden

`git push` unless explicitly asked, `pbpaste`/`pbcopy`, unprompted repo inspection before close-out scope is known.
Do not commit when unified close_out or envelope blocking checks fail.
