# traceable-commit

**Adherence ledger commit:** (pending — 2026-10-19). **Slice C commit:** `16c1e9de`. **v1 program wave:** `d80f00d2` … `eb8e1ed2`.

## Adherence ledger scope (2026-10-19)

- Refreshed gate receipts + [gate-ledger.jsonl](../gate-ledger.jsonl) (3 phase rows)
- [adherence-ledger-reconcile.md](./adherence-ledger-reconcile.md), [adherence-reconcile-close-out.json](./adherence-reconcile-close-out.json)
- Envelope revision from gate receipt persistence
- `.gitignore` CLEAR-WORKSPACE ephemeral paths

## Proposed scope (from [session-handoff.md](./session-handoff.md))

- `docs/methodologies/EDPC_Methodology_and_Workflows.md`
- `mcp-server/src/edpc/`
- `tied-project/` REQ/ARCH/IMPL enrollment + `tied-project/citdp/CITDP-REQ-TIED_EDPC_COMPREHENSION.yaml` (includes `completion_criteria.close_out`)
- `tied-project/working/REQ-TIED_EDPC_COMPREHENSION/` committed evidence (envelope, manifests, gate trackers, slice notes)
- Optional: `.gitignore` negation for this REQ’s envelope path if sponsor wants envelope in git without broad rule changes

## Pre-commit checks (sponsor)

- `npm test --prefix mcp-server -- edpc`
- `tied_validate_consistency`
- Touchpoint 3 vocabulary VALIDATE per `[PROC-VOCABULARY_INDEX]`
