# Traceable commit — PLAN-EVALUATION-ENVELOPE-CORPUS-FULL

**Gap:** G5 `process:envelope_sample_ten_tokens_not_full_corpus`  
**Prompt:** `@non-tied-plan` G5  
**Commit:** `2fa173cc` — feat(evaluation): full store envelope corpus manifest and gap report (G5)

## Staged scope

- `mcp-server/src/request-evidence-envelope/batch-collect.ts` — `envelope-corpus-manifest.v1` + working-folder token grammar
- `mcp-server/src/request-evidence-envelope/request-evidence-envelope-batch.test.ts`
- `tools/evaluation/build-envelope-corpus-manifest.mjs`
- `tied-project/working/evaluation/README.md`
- `tied-project/working/evaluation/envelope-corpus-manifest.v1.yaml`
- `tied-project/working/evaluation/envelope-corpus-manifest-build-summary.v1.json`
- `tied-project/working/evaluation/envelope-gap-report.v1.yaml` (133 rows; `validation_errors: []`)
- `tied-project/working/PLAN-EVALUATION-ENVELOPE-CORPUS-FULL/**`
- `tied-project/working/DOC-STDD-TIED-PROJECT-BROWNFIELD/evidence/gap-planning-handoff.md` (G5 row only)

## Excluded

- Unrelated working-tree churn (fixtures, source-graph indexes, meta-hub session handoff, workspace-clear)
- Untracked `tied-project/citdp/CITDP-REQ-*.yaml` test fixtures
