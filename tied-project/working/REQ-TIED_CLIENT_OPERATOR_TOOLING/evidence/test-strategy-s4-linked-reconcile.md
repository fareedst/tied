# Test strategy — S4 linked reconcile

**REQ:** [REQ-TIED_CLIENT_OPERATOR_TOOLING]  
**Plan:** [PLAN-s4-linked-reconcile.md](../PLAN-s4-linked-reconcile.md)  
**CITDP:** [CITDP-REQ-TIED_CLIENT_OPERATOR_TOOLING-s4-linked-reconcile.yaml](../CITDP-REQ-TIED_CLIENT_OPERATOR_TOOLING-s4-linked-reconcile.yaml)

## Unit (mcp-server)

| ID | File | Assertion |
|----|------|-----------|
| R1 | `adherence-reconcile-resolve.test.ts` (new) or extended runner tests | `resolveAdherenceReconcileArgv({ workspace })` returns argv pointing at store `packages/agentstream/dist/index.js` when module is loaded from store `dist/tools/` |
| R2 | Same | Temp linked client: `AGENTS.md`, `tied-project/requirements.yaml`, `.cursor/mcp.json` with absolute store `args[0]` and `TIED_STORE_ROOT`; no client `mcp-server/`; minimal tracker → `runAdherenceReconcile` `ok: true` |
| R3 | Same | `repo_root` set to client root does not override self-anchor |
| R4 | `adherence-reconcile-mcp.test.ts` | Existing legacy-ledger and optional Stage L corpus tests pass |

## Bootstrap

| ID | File | Assertion |
|----|------|-----------|
| R5 | `run-close-out-gates-order.test.mjs` | Source or fixture: `runAdherenceReconcileStep` does not pass client `repo_root` for store lookup; reconcile ordering unchanged from S3 |

## Manual (evidence optional)

| ID | Action |
|----|--------|
| R6 | `tied_adherence_reconcile_run` from hl7receiver with store MCP after fix |

## RED-first order

R1 → R2 → R3 (resolver) → implement → R4 → R5 → R6.

## Security

Read-only reconcile; no new network surface. Subprocess spawn uses existing agentstream CLI; validate no path escape in store resolution (use `assertMcpDistUnderStoreRoot` pattern where bootstrap config is read).
