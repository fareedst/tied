# DAE CLI demo — REQ-USER_PROCESS_LIST (post-close-out)

**Date:** 2026-09-25  
**Process:** `PROCESS-REDDIT-CLIENT-1790356640`  
**Client root:** `/Users/fareed/Documents/dev/test/1790356640`  
**Toolchain:** `@tied/cli` from `stdd/mcp-server` (DAE Wave 1 — [REQ-TIED_DAE_INCORPORATION])

## Commands

From methodology repo after `npm run build --prefix mcp-server`:

```bash
export TIED_BASE_PATH=/Users/fareed/Documents/dev/test/1790356640/tied
CLI=/Users/fareed/Documents/dev/chatgpt/stdd/mcp-server/packages/cli/dist/index.js
PR=/Users/fareed/Documents/dev/test/1790356640
TRACK=working/REQ-USER_PROCESS_LIST/agent-req-implementation-checklist.yaml
CITDP=tied/citdp/CITDP-REQ-USER_PROCESS_LIST.yaml

node "$CLI" gate check \
  --request-token REQ-USER_PROCESS_LIST \
  --phase close_out \
  --project-root "$PR" \
  --tracker "$TRACK" \
  --citdp "$CITDP" \
  --json-only

node "$CLI" next \
  --request-token REQ-USER_PROCESS_LIST \
  --project-root "$PR" \
  --tracker "$TRACK"
```

## Results

| Command | Exit | Summary |
| --- | --- | --- |
| `tied gate check` (`close_out`) | **0** | `allowed: true` — composes `tied_checklist_gate_validate` (same semantics as MCP Step-0) |
| `tied next` | **0** | Recommends slug `translate-sponsor-intent` (first pending in YAML order per discovery rules) |

### `tied gate check` JSON (stdout)

```json
{"allowed":true,"exit_code":0,"phase":"close_out","request_token":"REQ-USER_PROCESS_LIST","reasons":[],"receipt_path":null}
```

### `tied next` JSON (stdout)

```json
{"exit_code":0,"slug":"translate-sponsor-intent","open_request_tokens":["REQ-USER_PROCESS_LIST"],"citdp_phases":{},"current_branch":"main","rationale":"first_pending_slug_in_checklist_order:translate-sponsor-intent"}
```

**Note:** The greenfield build used MCP gate validate directly during implementation; this pass demonstrates optional DAE Wave 1 CLI ergonomics available on the same MCP server pointed at by the client `.mcp.json`.

## Envelope refresh (same session)

- Re-persisted phase gate receipts with current tracker (`run_id: envelope-refresh-20260925`).
- Re-ran `request-evidence-envelope-backfill` on the client.
- `request_evidence_envelope_validate`: `ok: true`, `blocking_gap_count: 0`, **`advisory_gap_count: 0`** (gate-hash drift cleared after envelope `cross_links.tracker_hash` aligns with gate receipt semantic hash — [REQ-REQUEST_EVIDENCE_ENVELOPE] build fix in `mcp-server`).
