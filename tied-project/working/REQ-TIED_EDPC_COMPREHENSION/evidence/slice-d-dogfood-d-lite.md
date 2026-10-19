# Slice D — D-lite dogfood (Workflow D)

**Date:** 2026-10-19  
**Tier:** `toolchain_readonly` · **production_touch:** `none`  
**Charter paths:** [edpc/engagement-charter.v1.yaml](./edpc/engagement-charter.v1.yaml) · [edpc/evidence-access-matrix.v1.yaml](./edpc/evidence-access-matrix.v1.yaml)

## Workflows exercised

| Step | Workflow | Evidence |
| --- | --- | --- |
| Baseline | B | Existing EASAR receipts (v1 close-out) |
| Failure / ops | D | Git history (local) + `npm test --prefix mcp-server -- src/edpc` as **Observed** for dev toolchain only |
| Verify | F | `tied_edpc_failure_state_validate` / `_build` via unit tests; publish gaps include `ofsm:` when bundle absent |

## Forbidden claims (honored)

- No production billing health or SLO compliance claims  
- No aggregate “all green” / `summary_healthy` without row-level `evidence_ids`  
- No production telemetry (`production_touch: none`)

## Proof boundary

This dogfood proves **OFSM validators and route/publish choreography** — not operational health of any production system.
