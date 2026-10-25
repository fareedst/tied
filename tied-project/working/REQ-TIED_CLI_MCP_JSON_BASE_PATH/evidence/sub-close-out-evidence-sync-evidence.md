# sub-close-out-evidence-sync — REQ-TIED_CLI_MCP_JSON_BASE_PATH

**Run:** `close-out-req-tied-cli-mcp-json-base-path-2026-10-25`  
**Command:** `node tools/bootstrap/templates/run-close-out-gates.mjs --envelope-blocking --sync-dispositions --reconcile`

## Outcomes

- Dispositions synced from tracker execution evidence.
- Envelope rebuilt/validated: `request-evidence-envelope.v1.json` blocking gaps **0** after `request_evidence_envelope_backfill` (minimal NA receipt).
- Reconcile: process_grade band **A** (94); findings note missing typed step evidence stubs (refine-plan artifacts substitute — see PLAN.md / CITDP).

## Gate receipts

- `gates/close_out-*` (latest after successful merged_decision.allowed=true)
