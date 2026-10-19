# Slice C follow-on — workflows B + C + F

**Date:** 2026-10-19  
**Run id:** `edpc-slice-c-bcf-20261019`  
**Tier:** `toolchain_readonly` · **Target:** stdd · **Bounded path:** `mcp-server/src/edpc`  
**Baseline:** `eb8e1ed2`

## Charter question

What does the EDPC **workflow-route** module do, and how does **`evidence_access_tier`** alter the planned **B→C→F** choreography for module comprehension?

Recorded in [edpc/engagement-charter.v1.yaml](./edpc/engagement-charter.v1.yaml) and [edpc/slice-c-investigation.v1.yaml](./edpc/slice-c-investigation.v1.yaml).

## Route (workflow A table)

| Input | Tool | Output |
| --- | --- | --- |
| `question_class: module_comprehension` | `tied_edpc_workflow_route` | **B → C → F** (not defaulted) |

Receipt: [workflow-route-module-comprehension.v1.json](./workflow-route-module-comprehension.v1.json)

## Execution

| Step | Workflow | Action | Result |
| --- | --- | --- | --- |
| B | Baseline | `tied_easar_inventory_receipt_build` (9 TS files) | [inventory.v1.json](./inventory.v1.json) |
| C | Deep slice | `tied_source_graph_refresh` + trace `routeEdpcWorkflow` | [source-graph-index.v1.json](./source-graph-index.v1.json), [source-graph-trace-routeEdpcWorkflow.v1.json](./source-graph-trace-routeEdpcWorkflow.v1.json) |
| C | Deep slice | Ledger rows **Derived** + **Observed** | [edpc/claims-ledger.v1.yaml](./edpc/claims-ledger.v1.yaml) (3 claims) |
| C | Deep slice | `npm test --prefix mcp-server -- src/edpc` | [slice-c-test-run-receipt.v1.json](./slice-c-test-run-receipt.v1.json) |
| F | Publish | `tied_edpc_access_validate` | **ok: true** |
| F | Publish | `tied_edpc_publish_build` | **ok: true** → [edpc/edpc-publish-manifest.v1.json](./edpc/edpc-publish-manifest.v1.json) |

**Claims-evidence review:** Chart Viewer frozen surface — [slice-c-claims-evidence-review-chartviewer.md](./slice-c-claims-evidence-review-chartviewer.md) (`4/4 shown`, manifest **`gaps: []`**).

## Acceptance

| Criterion | Status |
| --- | --- |
| Charter question + bounded path documented | **met** |
| **claims-ledger** non-empty with tier-appropriate classes | **met** (2 Derived, 1 Observed) |
| **edpc-publish-manifest.v1** `gaps[]` explicit | **met** (`gaps: []` after Chart Viewer CER receipt) |
| SCM shell minimum fields + receipt refs | **met** [edpc/scm-snapshot-shell.v1.yaml](./edpc/scm-snapshot-shell.v1.yaml) |

## Comprehension answer (summary)

`workflow-route.ts` exposes **`routeEdpcWorkflow`**, which selects workflow lists from **`ROUTE_TABLE`** (`module_comprehension` → **B, C, F**). At **`source_static`**, it calls **`stripWorkflows`** to drop **D** and **E** (source-graph trace shows that callee edge). MCP registration of the tool is **not** statically proven — noted as ledger limitation on CL-EDPC-C-001.
