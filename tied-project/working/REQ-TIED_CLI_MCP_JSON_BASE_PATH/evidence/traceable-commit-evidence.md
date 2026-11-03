# Traceable commit evidence — install-only CLI paths (2026-11-03)

## VALIDATE (vocab Touchpoint 3)

Deferred immaterial renames; terms align with existing `tied-project/vocab/project-operations-mcp.md` (tied-cli, mcp.json).

## Gates

- **close_out:** `run-close-out-gates.mjs --envelope-blocking --sync-dispositions --reconcile`
- **merged_decision.allowed:** true
- **envelope blocking_gap_count:** 0
- **gate receipt:** `tied-bundle/working/REQ-TIED_CLI_MCP_JSON_BASE_PATH/gates/close_out-2026-11-03T06-54-15-323Z.json`

## Verification

- `npm test --prefix mcp-server` (after `npm run build --prefix mcp-server`)
- `node --test tools/bootstrap/lib/mcp-base-path.test.mjs tools/bootstrap/lib/tied-cli-invoke.test.mjs`

## Upstream feedback capture

- **Receipt id:** `fb-mw0b2pe8-7kp0gt`
- **Store feedback.yaml:** appended (Kaizen Phase 1, hypnos tied-cli store pollution witness)

## Hygiene

- [git-hygiene-receipt-2026-11-03.md](./git-hygiene-receipt-2026-11-03.md) (`apply: false`)

## Excluded unrelated drift

See hygiene receipt; notably Hypnos IMPL index entries in `tied-project/implementation-decisions.yaml` are **not** part of this commit.
