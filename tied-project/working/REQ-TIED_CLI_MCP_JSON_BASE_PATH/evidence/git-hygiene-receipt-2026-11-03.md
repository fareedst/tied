# Git hygiene receipt — REQ-TIED_CLI_MCP_JSON_BASE_PATH (2026-11-03)

- **Tool:** `tied_git_hygiene`
- **context_mode:** `plan_close_out`
- **apply:** false
- **request_token:** REQ-TIED_CLI_MCP_JSON_BASE_PATH

## Scoped commit (this close-out)

Implementation + Kaizen witness for install-only CLI path authority (`fb-mw0b2pe8-7kp0gt`).

## Excluded unrelated drift (not staged)

- `tied-project/implementation-decisions.yaml` (Hypnos IMPL index pollution)
- Source/corpus graph fixture regenerations under `mcp-server/test/fixtures/`
- `tied-bundle/reports/source-graph/source-graph-index.v1.json`
- `tied-project/working/REQ-TIED_JEV_*` checklist/benchmark churn
- Untracked `tied-project/citdp/CITDP-REQ-{ACTIVATION,NESTED,...}.yaml` (fixture artifacts)

## Post-close-out workspace pass (2026-11-03, second `@close-out`)

- **Restored:** `tied-project/implementation-decisions.yaml`, `tied-bundle/{project-identity.v1.yaml,requirements/REQ-TIED_SETUP.yaml,reports/source-graph/...}`, MCP test fixture graph/envelope indexes, unrelated `tied-project/working/REQ-TIED_*` churn
- **Removed (untracked):** six `CITDP-REQ-{ACTIVATION,NESTED,PRESERVE,UNIT_TEST,UPGRADE,UPGRADE-MISSING}.yaml` gate-test litter files under `tied-project/citdp/`
- **Gate replay:** `run-close-out-gates.mjs --envelope-blocking --sync-dispositions --reconcile` → `allowed: true`, `blocking_gap_count: 0`, `depth_tier: minimal`, process_grade band B
