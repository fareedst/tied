# Proposed commit — Workflow H (plan-close-out)

**Status:** pending sponsor `traceable-commit` — agent did **not** commit.

## Proposed message

```
fix(tied): close out EDPC Workflow H client assessment follow-on

Map Chart Viewer claims-ledger statement to CAM assertions; add dogfood
script and integrated close-out evidence for REQ-TIED_EDPC_CLIENT_ASSESSMENT
(retroactive inquiry run_ids edpc-cam-*).
```

## Scope (stage only these paths)

- `mcp-server/src/edpc/client-assessment-compose.ts`
- `mcp-server/src/edpc/client-assessment-compose.test.ts`
- `mcp-server/scripts/dogfood-chartviewer-cam.mjs`
- `tied-project/implementation-decisions/IMPL-TIED_EDPC_CLIENT_ASSESSMENT-pseudocode.md`
- `tied-project/citdp/CITDP-REQ-TIED_EDPC_CLIENT_ASSESSMENT.yaml`
- `tied-project/vocab/edpc-comprehension.md`
- `tied-project/working/REQ-TIED_EDPC_CLIENT_ASSESSMENT/**`
- `CHANGELOG.md`

**Exclude:** source-graph, process-cert templates, adversarial fixtures, JEV pruning, checklist gate fixtures, bootstrap vocab churn.
