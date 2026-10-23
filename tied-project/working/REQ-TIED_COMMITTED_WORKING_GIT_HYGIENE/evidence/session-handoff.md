# Session handoff — REQ-TIED_COMMITTED_WORKING_GIT_HYGIENE

## Status

**Implement:** core policy + migration applied (600 paths `git rm --cached`). **Close-out:** deferred — verification gate, envelope sync, and canonical CITDP persist not run this session.

## Metrics

| Metric | Value |
| --- | --- |
| Baseline tracked `tied-project/working` | 6851 |
| After wave untrack | 6251 |
| Inventory | `evidence/migration-inventory.v1.json` |
| Report | `evidence/migration-report.v1.json` |

## Delivered

- TIED stack: `REQ/ARCH/IMPL-TIED_COMMITTED_WORKING_GIT_HYGIENE` + pseudo-code sidecar
- Classifier: `evidence/gate-*` → `tied-bundle/working/` (TS, bootstrap `.mjs`, agentstream)
- Gitignore: `applyCommittedWorkingHygieneProfile` + managed block on root `.gitignore`
- Scripts: `inventory-committed-working-regenerable.mjs`, `migrate-tracked-committed-working-regenerable.mjs`
- Tests: `committed-working-gitignore.test.mjs`
- WAP + vocab RECORD

## Phase 4 (consumer fixes) — done

See `evidence/phase-4-consumer-fixes-evidence.md` (pairing fixture, install matrix, client-development-index).

## Next (close-out — Phase 5)

1. Hydrate tracker evidence; `tied_checklist_gate_validate` pre_implementation → verification
2. `tied_verify` + optional grep for tests still assuming **git-tracked** gate JSON under committed working
3. `persist-citdp-record` → `tied-project/citdp/`
4. `run-close-out-gates.mjs --envelope-blocking --sync-dispositions --reconcile`
5. Sponsor `traceable-commit` (large index-only diff)
