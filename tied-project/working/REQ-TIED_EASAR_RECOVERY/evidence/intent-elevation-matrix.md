# Intent elevation matrix — REQ-TIED_EASAR_RECOVERY

**Baseline revision:** `HEAD` (see `evidence/inventory.v1.json`)  
**Scope tokens:** REQ-TIED_EASAR_RECOVERY, ARCH-TIED_EASAR_ARTIFACT_MODEL, IMPL-TIED_EASAR_RECEIPTS, PROC-EASAR_RECOVERY  
**Author / date:** build-plan dogfood / 2026-10-17

Copy from `tied-bundle/templates/brownfield-evidence-to-intent-matrix.md` per [working-artifact-placement.md](../../../../tied-bundle/docs/working-artifact-placement.md).

---

## Legend

| Column | Description |
| --- | --- |
| Claim | Testable statement (not sidecar prose paste) |
| Source type | `code` \| `code_graph` \| `impl_sidecar` \| `test` \| `help` \| `arch` \| `req` |
| Location | Path or block id + revision |
| Disposition | `observed` \| `approved` \| `unresolved` \| `rejected` |
| Confidence | `high` \| `medium` \| `low` |
| Proof boundary | What this row does **not** prove |
| REQ/ARCH target | Token + field (if promoted) |

---

## Matrix

| # | Claim | Source type | Location | Disposition | Confidence | Proof boundary | REQ/ARCH target |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `validateEasarEngagementFacet` rejects `easar_full` when BFIE mode is `report_only` | test | mcp-server/src/checklist-validator.test.ts | observed | high | Does not prove all Tracker shapes in every client | |
| 2 | `buildInventoryV1FromWalkSummary` yields stable `content_hash` for identical walk input | test | mcp-server/src/easar-receipts/easar-receipts.test.ts | observed | high | Walk scope limits; not full-repo coverage | |
| 3 | MCP `tied_easar_inventory_receipt_build` registered on tool surface | code | mcp-server/src/tools/index.ts | observed | medium | IDE MCP host may lag rebuilt dist until restart | |
| 4 | `tied_source_graph_refresh` remains read-only on project YAML (regression guard for slice 2) | code_graph | mcp-server/src/source-graph/source-graph-composition.test.ts · receipt [code-graph-matrix-receipt.v1.json](./code-graph-matrix-receipt.v1.json) (`graph_freshness_run_id=easar-sg-freshness-20261018`) | observed | high | Static TS/JS graph only | |

---

## Acceptance (pilot)

- [x] 100% rows dispositioned (dogfood scope: observed only)
- [ ] ≥80% promoted REQ criteria map to IMPL block + evidence location
- [ ] ARCH decisions cite boundary + rationale
- [x] Zero product behavior diffs beyond planned EASAR modules (receipt builders + gate facet)
