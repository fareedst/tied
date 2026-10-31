# Build-plan handoff — DOC-STDD-TIED-PROJECT-BROWNFIELD

**Date:** 2026-10-31

## Completion signals (minimal DOC engagement)

| Signal | Status |
| --- | --- |
| Machine close-out | **deferred** (no integrated inquiry / no REQ verify) |
| Process contract | **satisfied** for non-tied comprehension + hygiene scope |
| Adherence ledger | **not_applicable** |

## Verification run

| Check | Result |
| --- | --- |
| `tied_edpc_access_validate` | ok |
| `tied_edpc_engagement_validate` | ok:false (report_only mode — expected) |
| `tied_validate_consistency` (indexes only) | ok:true |
| `brownfield_intent_evidence_validate` | ok, non-blocking |
| `tied_edpc_publish_build` | ok (gaps recorded in manifest) |
| Envelope batch collect | ok — [envelope-gap-report.v1.yaml](../evaluation/envelope-gap-report.v1.yaml) |

### Scoped npm tests

Run manually or in CI follow-up:

```bash
cd mcp-server && npm test -- --test-path-pattern='source-graph|brownfield-intent-evidence|working-root'
```

**2026-10-31:** `npx tsx --test` on `source-graph.test.ts`, `brownfield-intent-evidence-composition.test.ts`, `working-root.test.ts` — **pass**. Full `npm test` pattern run hit missing GF05 working CITDP after dedupe; restored one file from `tied-project/citdp/`.

## Staging candidates (traceable-commit)

- `tied-project/working/DOC-STDD-TIED-PROJECT-BROWNFIELD/**`
- `docs/stdd-workflows.md`
- `tied-project/working/evaluation/envelope-gap-report.v1.yaml`
- Deleted `tied-project/working/**/CITDP-*.yaml` (65 files)
- **Exclude:** `project-identity.v1.yaml` at repo root
