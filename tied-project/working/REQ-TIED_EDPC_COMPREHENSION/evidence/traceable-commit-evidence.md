# traceable-commit (deferred)

**Policy:** plan-close-out-commit-deferred — sponsor runs traceable-commit when ready.

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
