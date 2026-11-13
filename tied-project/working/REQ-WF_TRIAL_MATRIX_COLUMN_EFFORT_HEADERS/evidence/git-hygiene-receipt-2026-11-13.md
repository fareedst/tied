# Git hygiene — REQ-WF_TRIAL_MATRIX_COLUMN_EFFORT_HEADERS

**date:** 2026-11-13  
**context_mode:** plan_close_out  
**apply:** false  
**request_token:** REQ-WF_TRIAL_MATRIX_COLUMN_EFFORT_HEADERS

## MCP preview (`tied_git_hygiene`)

- **ok:** true · **mode:** preview
- **committed_working_stage_candidates:** `tied-project/working/REQ-WF_TRIAL_MATRIX_COLUMN_EFFORT_HEADERS/evidence/request-evidence-envelope.v1.json` (regenerable; `.gitignore` — not staged)

## Traceable commits (this REQ)

| SHA | Role |
| --- | --- |
| `56c24915` | Feature — effort headers and 9-column manifest |
| `884eadca` | Post-close-out handoff parity |

## Staging scope (shipped)

- `tools/bootstrap/lib/wf-trial-comparison-matrix.mjs`
- `tools/bootstrap/lib/wf-trial-comparison-matrix.test.mjs`
- `docs/demos/traditional-workflow-trial-runs-registry.md`
- `tied-project/working/PLAN-WF-TRIAL-COMPARISON-MATRIX/PLAN.md`
- `tied-project/working/PLAN-WF-TRIAL-COMPARISON-MATRIX/evidence/build-comparison-matrix.mjs`
- `tied-project/working/REQ-WF_TRIAL_MATRIX_COLUMN_EFFORT_HEADERS/` (trackable artifacts)
- `tied-project/CHANGELOG.md`

## REQ workspace

`tied-project/working/REQ-WF_TRIAL_MATRIX_COLUMN_EFFORT_HEADERS/` — **clean** vs HEAD after `884eadca`.

## Excluded unrelated drift (not restored; not deleted)

**Tracked dirty (26):** root `CHANGELOG.md`; WF-09 demo docs; agentstream HMEP hooks; yaml-canonicalizer; build-commands; HMEP/HEMC/R+A+I YAML; sibling REQ trackers (`REQ-HARNESS_EVAL_METERING_CANARY_WORKFLOW`, `REQ-TIED_HARNESS_MODEL_EVAL_PLATFORM`, `REQ-WF_TRIAL_RANGE_CANONICAL_INPUT`, …); `PLAN-WF-TRIAL-COMPARISON-MATRIX/test-strategy.md`.

**Untracked (21):** WF-09 readouts; HMEP stream capture + import; promoted REQ YAML for `REQ-WF_TRIAL_RANGE_HMEP_AUTO_INGEST` / `REQ-WF_TRIAL_REGISTRY_COMPARISON_MATRIX_CELLS`; facilitator folders; `REQ-WF_TRIAL_COMPARISON_MATRIX_TOOLSET_FIX/`; sibling working PLAN folders.

**apply:** not run — `allowed_paths` must match full untracked set exactly; deleting would remove in-flight sibling REQs.
