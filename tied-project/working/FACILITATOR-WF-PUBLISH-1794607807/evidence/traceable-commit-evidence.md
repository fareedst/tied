# Traceable commit — facilitator WF cohort close-out

**Date:** 2026-11-13  
**Scope:** Store facilitator batch (no single disposable product REQ)

## Verification

- `node --test` wf-trial-comparison-matrix, registry-refresh, summaries-publish contract — **pass**
- `build-wf-trial-comparison-matrix.mjs --check` — exit 0
- `wf-trial-summaries-publish.mjs --check` — exit 0

## Gates

Formal `close_out` gate N/A (facilitator store docs). Git hygiene preview **ok**.

## Staging map

Cohort readouts, registry/catalog/README, size-batch evidence, publish orchestrator + skill, matrix layout code, REQ-WF_TRIAL_SUMMARIES_PUBLISH TIED YAML, facilitator working evidence, CHANGELOG rows.

## Feedback capture

N/A

## Commit

**SHA:** `f6467a58` — `docs(wf-trials): cohort readouts, publish skill, matrix layout`
