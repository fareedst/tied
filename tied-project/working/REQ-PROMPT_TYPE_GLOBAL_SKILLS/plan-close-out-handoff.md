# Close-out handoff — REQ-PROMPT_TYPE_GLOBAL_SKILLS

**Run id:** `ptgs-closeout-2026-10-30`  
**Date:** 2026-10-30

## Scope

Reorder project satisfaction criteria so the [REQ-PROMPT_TYPE_CITDP_RECORD_PROMOTE] citdp-record/promote criterion follows bootstrap install (documentation-only LEAP alignment). Refresh request-evidence envelope after unified close_out gates.

## Verification

- `npx tsx --test mcp-server/src/e2e/prompt-type-skills.test.ts` — 7/7 pass
- `run-close-out-gates.mjs` — `merged_decision.allowed: true`, `blocking_gap_count: 0`
- Gate receipt: `tied-bundle/working/REQ-PROMPT_TYPE_GLOBAL_SKILLS/gates/close_out-2026-10-31T04-52-30-505Z.json` (local regenerable)

## Git hygiene

MCP `tied_git_hygiene` `plan_close_out` preview `ok: true` (apply=false). Gitignore close-out: **N/A** — no new ephemeral paths for this slice.

## Upstream feedback capture

N/A — satisfaction-criteria ordering only.

## Excluded unrelated drift

Intent control plane, workflow visualization, source-graph reports, config/identity YAML, fixture envelopes — not part of this REQ close-out.

## Completion signals

- **Machine close-out:** pass — gate `close_out` allowed=true; envelope validate fail_on_error_gaps=true blocking_gaps=0
- **Process contract:** partial — minimal depth; tracker template unchanged; verification via prompt-type-skills e2e
- **Adherence ledger:** not_run — thin minimal-depth slice; gate runner `--reconcile` invoked in unified runner
- **Workspace cleanliness:** partial — scoped REQ artifacts only; other REQ WIP remains
