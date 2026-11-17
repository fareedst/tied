# Traceable commit evidence — Facilitator WF trial cohort

**prompt_type:** sponsor traceable-commit  
**date:** 2026-11-16  
**context:** `REQ-WF_TRIAL_MODEL_EFFORT` (facilitator docs only; no store REQ YAML)

## Scope

| Area | Paths |
| --- | --- |
| Readouts | `docs/agent-harness-evaluation/readouts/trial-readout-PROMPT-WF-*.md` (Haiku/Sonnet high + effort-tier batch) |
| Cohort receipts | `docs/agent-harness-evaluation/cohort/evidence/receipts/*.json` |
| Registry / manifest | `docs/agent-harness-evaluation/registries/traditional-workflow-trial-runs-registry.md`, `cohort/evidence/manifest.v1.json`, `cohort/comparison-table.md` |
| Catalog links | `docs/agent-harness-evaluation/catalogs/catalog-traditional-workflow-trial-prompts.md` |
| Matrix builder | `tools/bootstrap/lib/build-wf-trial-comparison-matrix.mjs` (if changed) |
| Changelog | `tied-project/CHANGELOG.md` (facilitator readout entries) |
| Facilitator evidence | `tied-project/working/FACILITATOR-WF-*` (record + publish handoffs) |
| Related handoff | `tied-project/working/REQ-WF_TRIAL_MATRIX_CLAUDE_EFFORT_TIERS/evidence/session-handoff.md` |

## Pre-commit verification

```bash
node tools/bootstrap/lib/build-wf-trial-comparison-matrix.mjs --check
```

## Excluded

- `tied-bundle/` methodology YAML
- Unrelated open WIP outside facilitator batch

## Suggested commit message

```
docs(wf-trials): commit Haiku/Sonnet facilitator readouts and cohort evidence.

Record @record-wf-trial readouts, cohort receipts, registry/manifest refresh,
FACILITATOR-WF-* handoffs, and CHANGELOG for Claude effort-tier matrix batch.
```

## Commits

| SHA | Scope |
| --- | --- |
| `788b719b` | 117 files — readouts, receipts, registry/manifest, FACILITATOR-WF-*, CHANGELOG |