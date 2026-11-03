# Close-out handoff — REQ-TIED_CLI_MCP_JSON_BASE_PATH (install-only paths wave)

**Date:** 2026-11-03  
**Kaizen:** `fb-mw0b2pe8-7kp0gt` (hypnos client tied-cli → store corpus pollution)

## Completion signals

- **Machine close-out:** pass — `close_out` allowed=true; envelope validate blocking_gaps=0 (`tied-project/working/REQ-TIED_CLI_MCP_JSON_BASE_PATH/evidence/request-evidence-envelope.v1.json`)
- **Process contract:** pass — gate runner `--sync-dispositions --reconcile`; tracker sub-adversarial sub_procedure disposition synced
- **Adherence ledger:** pass — reconcile process_grade band B (hash_alignment evidence_stale advisory on legacy manifest; non-blocking at minimal depth)
- **Workspace cleanliness (scoped REQ):** partial — scoped implementation staged; unrelated repo drift documented in hygiene receipt (Hypnos IMPL pollution, graph fixtures)

## Commit

See traceable-commit SHA after `git commit` (this handoff updated post-commit).

## Remaining risks

- Operators must run `./tied-install.sh` in each client; shell `export TIED_BASE_PATH` no longer overrides mcp.json.
- Store may still contain accidental Hypnos YAML from prior pollution — audit separately.
