# Traceable commit evidence

**REQ:** REQ-TIED_INSTALL_JSON_REFRESH_SEMVER  
**Commit:** `f543f1f4a93ad7ac0406f9e794a5570ebe63cf61`  
**Gate:** close_out `allowed=true` run `close-out-req-tied-install-json-refresh-semver-20261108-r2`  
**Envelope:** `blocking_gap_count=0`  
**Hygiene:** [git-hygiene-receipt-2026-11-08.md](git-hygiene-receipt-2026-11-08.md)

**Verification:**

- `node --test tools/bootstrap/lib/store-methodology-version.test.mjs`
- `cd mcp-server && npm test -- tied-methodology-version.test.ts`

**Upstream feedback:** N/A + reason (store install/MCP tooling; no client feedback ingest).

**Post-close-out:** Scope A WF trial docs committed as `4de8da0d` (separate from this REQ).

**Excluded drift:** facilitator WF working dirs (in `4de8da0d`), unrelated CITDP fixture files, mcp-server test fixture envelopes, evaluation envelope-gap-report, Morluto/LangGraph program trackers.
