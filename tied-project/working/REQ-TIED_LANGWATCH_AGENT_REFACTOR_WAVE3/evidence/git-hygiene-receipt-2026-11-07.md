# Git hygiene receipt — REQ-TIED_LANGWATCH_AGENT_REFACTOR_WAVE3

**Date:** 2026-11-07  
**context_mode:** `plan_close_out`  
**apply:** false  
**MCP:** `tied_git_hygiene`

## committed_working_stage_candidates

- `tied-project/working/REQ-TIED_LANGWATCH_AGENT_REFACTOR_WAVE3/evidence/verification-evidence-manifest.v1.json` (**track** — `!` negation in `.gitignore`)
- `tied-project/working/REQ-TIED_LANGWATCH_AGENT_REFACTOR_WAVE3/evidence/request-evidence-envelope.v1.json` (regenerable per `tied-project/working/**/evidence/request-evidence-envelope.v1.json`; validate on disk; not staged)

## Gitignore hygiene ([PROC-GITIGNORE_CLOSE_OUT])

**N/A — already covered:** untracked `FACILITATOR-WF-*`, `docs/demos/trial-readout-*`, and `tied-project/non-tied-plans/arun-srinivasan-map-projection-vs-tied/` are **excluded** from this REQ staging map (unrelated WIP). REQ-scoped paths match existing conventions; no new `.gitignore` patterns.

## Excluded unrelated drift (documented for traceable commit)

- `docs/demos/*` trial readouts and catalog edits (WF program)
- `tied-project/working/FACILITATOR-WF-*/`
- `tied-project/non-tied-plans/arun-srinivasan-map-projection-capture/evidence/session-handoff.md`
- `tied-project/non-tied-plans/store-vendor-skills/evidence/session-handoff.md`
- `tied-project/non-tied-plans/arun-srinivasan-map-projection-vs-tied/`
