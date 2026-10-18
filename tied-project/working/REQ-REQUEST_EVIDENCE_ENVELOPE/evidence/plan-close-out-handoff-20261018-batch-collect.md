# plan-close-out handoff — envelope batch collect fix (2026-10-18)

**Scope:** Maintenance close-out for batch `envelope_source` fix, gap report refresh, and operator path docs. Not a full Tracker/CITDP disposition sync.

## Staged change summary

| Area | Files |
|------|--------|
| Implementation | `mcp-server/src/request-evidence-envelope/batch-collect.ts`, `mcp-server/src/cli/request-evidence-envelope-batch-collect.ts`, `mcp-server/dist/` (rebuild) |
| Tests | `mcp-server/src/request-evidence-envelope/request-evidence-envelope-batch.test.ts` |
| LEAP | `tied-project/implementation-decisions/IMPL-REQUEST_EVIDENCE_ENVELOPE_BATCH-pseudocode.md` |
| Operator corpus/report | `tied-project/working/evaluation/evaluation-corpus.v1.yaml`, `evaluation-corpus.v1.template.yaml`, `envelope-gap-report.v1.yaml` |
| Docs | `tied-bundle/docs/request-evidence-envelope.md`, `docs/pre-client-test-prior-work-plan.md`, `docs/pre-cohort-client-test-grammar-v2-and-evidence.md`, `docs/evidence-collection-conversation-patterns.md`, `tied-project/citdp/CITDP-REQ-REQUEST_EVIDENCE_ENVELOPE.yaml` |
| Changelog | `CHANGELOG.md` |

## Verification

- `npx tsx --test src/request-evidence-envelope/request-evidence-envelope-batch.test.ts` — 12/12 pass
- `node tools/bootstrap/templates/run-close-out-gates.mjs ... --run-id ree-batch-collect-fix-20261018 --envelope-blocking --rebuild-envelope-only --skip-manifest` — `merged_decision.allowed=true`, `blocking_gap_count=0`

### Completion signals

- **Machine close-out:** pass — gate `close_out` allowed=true (envelope-only refresh); envelope validate `fail_on_error_gaps` blocking_gaps=0; path=`tied-project/working/REQ-REQUEST_EVIDENCE_ENVELOPE/evidence/request-evidence-envelope.v1.json`
- **Process contract:** partial — no `sub-close-out-evidence-sync` / full unified `--sync-dispositions` run this session (maintenance slice)
- **Adherence ledger:** not_run — reconcile deferred to `traceable-commit` if sponsor wants full integrated close-out replay

### Remaining risks

- Stray copy may exist at `/Users/fareed/Documents/dev/chatgpt/tied-project/working/evaluation/envelope-gap-report.v1.yaml` from an earlier `--yaml-out ../tied-project/...` run; safe to delete if unintended.
- Stage `mcp-server/dist/` at commit if your policy tracks built CLI help text.

## Gitignore hygiene ([PROC-GITIGNORE_CLOSE_OUT])

N/A — no new ephemeral untracked patterns from this slice; evaluation report and corpus are intentional **track** aggregates under `tied-project/working/evaluation/`.

## Proposed commit message

```
Fix envelope batch collect source when backfilled file exists.

Gap reports are advisory: use normalized envelopes from on-disk files
even when strict validate would block, and keep envelope_file when shape
validation fails. Refresh operator gap report and document repo-root
batch-collect paths with --project-root ..
```

**Do not commit** — plan-close-out only.
