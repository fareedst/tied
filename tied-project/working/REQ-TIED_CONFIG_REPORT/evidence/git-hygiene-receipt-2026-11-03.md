# Git hygiene receipt — REQ-TIED_CONFIG_REPORT

**Date:** 2026-11-03  
**Context:** `plan_close_out`  
**MCP:** `tied_git_hygiene` `apply: false`

## Scoped staging

Commit includes only REQ-TIED_CONFIG_REPORT product + traceability paths (see `traceable-commit-evidence.md`).

## Excluded unrelated drift

- Modified files under other REQ working folders (RDC, JEV, checklist fixtures, etc.)
- MCP test fixture envelope/index churn
- `tied-bundle/reports/*` regenerations
- Stray `tied-project/citdp/CITDP-REQ-{ACTIVATION,NESTED,...}.yaml` (not part of this REQ)
- `.cursor/logs/`

## Regenerable (not staged)

- `tied-project/working/REQ-TIED_CONFIG_REPORT/evidence/request-evidence-envelope.v1.json` (gitignore regenerable)
- `tied-project/working/REQ-TIED_CONFIG_REPORT/evidence/not-applicable-receipt.v1.json`
- `tied-bundle/working/REQ-TIED_CONFIG_REPORT/gates/*.json`
- `tied-project/working/REQ-TIED_CONFIG_REPORT/evidence/quality-manifest/`
