# Git hygiene receipt — REQ-TIED_CLI_MCP_JSON_BASE_PATH

**Date:** 2026-10-25  
**Tool:** `tied_git_hygiene` · `context_mode: plan_close_out` · `apply: false`

## Scoped untracked (this REQ)

- `tools/bootstrap/lib/mcp-base-path.mjs` (+ test)
- `tools/bundled-tied-yaml-skill/scripts/resolve-tied-cli-env.mjs`
- TIED tokens under `tied-project/{requirements,architecture-decisions,implementation-decisions}/`
- `tied-project/citdp/CITDP-REQ-TIED_CLI_MCP_JSON_BASE_PATH.yaml`
- `tied-project/working/REQ-TIED_CLI_MCP_JSON_BASE_PATH/` (PLAN, tracker, committed evidence)

## Excluded unrelated drift (not staged)

- `mcp-server/test/fixtures/**/request-evidence-envelope.v1.json`
- `tied-bundle/reports/source-graph/source-graph-index.v1.json`
- `tied-project/working/REQ-TIED_CHECKLIST_GATE_ENFORCEMENT/fixture-*`
- `tied-project/working/REQ-TIED_JEV_CONTEXT_LOG_PRUNING/**`
- `tied-project/working/evaluation/envelope-gap-report.v1.yaml`

## Regenerable (gitignored, not staged)

- `tied-project/working/REQ-TIED_CLI_MCP_JSON_BASE_PATH/gates/`
- `tied-project/working/REQ-TIED_CLI_MCP_JSON_BASE_PATH/evidence/adherence-ledger.jsonl`
- `tied-project/working/REQ-TIED_CLI_MCP_JSON_BASE_PATH/evidence/request-evidence-envelope.v1.json`
- `tied-project/working/REQ-TIED_CLI_MCP_JSON_BASE_PATH/evidence/not-applicable-receipt.v1.json`
