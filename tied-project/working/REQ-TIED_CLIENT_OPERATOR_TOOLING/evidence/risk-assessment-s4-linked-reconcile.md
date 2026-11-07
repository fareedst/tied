# Risk assessment — S4 linked reconcile

**REQ:** [REQ-TIED_CLIENT_OPERATOR_TOOLING]  
**depth_tier:** minimal  
**gate_policy:** advisory  

## Reversible choices

- Resolver arm ordering (self-anchor before disk).
- Deprecating `repo_root` for binary lookup (monolithic fallback retained).
- Subprocess `cwd = workspace`.

## Costly choices

- None in S4 if CHANGELOG documents S3 `repo_root` correction and clients refresh store MCP.

## Counterexamples

1. Multiple store checkouts on one machine — anchor may hit nearest ancestor with agentstream dist; mitigated by mcp.json `TIED_STORE_ROOT` arm and tests.
2. MCP dist copied without `packages/agentstream` build — fail closed with build hint (existing operator contract).

## Falsification

- If client has no `.cursor/mcp.json` and MCP cwd is not store-backed, disk arm may return null; self-anchor must still work when runner loads from store dist (close-out runner path).

## Eligibility

Integrated adversarial inquiry **not** triggered (minimal depth, tooling-only).
