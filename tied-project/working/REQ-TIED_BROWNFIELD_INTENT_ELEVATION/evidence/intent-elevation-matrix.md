# Intent elevation matrix — REQ-TIED_BROWNFIELD_INTENT_ELEVATION

**Baseline revision:** `6f3accc86b46882c86c4cedc8364ac32b824ae5f`  
**Scope tokens:** REQ-TIED_BROWNFIELD_INTENT_ELEVATION, ARCH-TIED_BROWNFIELD_EVIDENCE_MODEL, IMPL-TIED_BROWNFIELD_VALIDATION, PROC-BROWNFIELD_INTENT_ELEVATION  
**Author / date:** build-plan dogfood / 2026-10-13

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
| 1 | `brownfield_intent_evidence_validate` MCP tool is registered and returns a structured receipt on valid input | test | mcp-server/src/brownfield-intent-evidence/brownfield-intent-evidence-composition.test.ts | observed | high | Does not prove production MCP wiring in every IDE host | |
| 2 | Validate path does not mutate `tied-project/requirements.yaml` mtime | test | mcp-server/src/brownfield-intent-evidence/brownfield-intent-evidence-composition.test.ts | observed | high | Does not prove immutability of all project YAML files or detail dirs | |
| 3 | Markdown matrix tables normalize to the same internal model as intent-elevation.v1 YAML for equivalent rows | code | mcp-server/src/brownfield-intent-evidence | observed | medium | Does not prove parity for every Markdown authoring edge case | |
| 4 | `tied_source_graph_refresh` builds deterministic `.tied/source-graph/source-graph-index.v1.json` on fixture mini-repo | code_graph | mcp-server/src/source-graph/source-graph.test.ts | observed | high | Static TS/JS extraction only; not runtime or multi-language parity | |
| 5 | `tied_source_graph_trace` returns caller/callee edges for fixture symbol id | code_graph | mcp-server/src/source-graph/source-graph.test.ts | observed | high | Does not prove complete dynamic dispatch coverage | |
| 6 | Graph MCP path does not mutate `tied-project/requirements.yaml` | code_graph | mcp-server/src/source-graph/source-graph-composition.test.ts | observed | high | Does not prove immutability of all non-index project files | |

---

## Acceptance (pilot)

- [x] 100% rows dispositioned (dogfood scope: observed only, no promotion targets)
- [ ] ≥80% promoted REQ criteria map to IMPL block + evidence location
- [ ] ARCH decisions cite boundary + rationale
- [x] Zero product behavior diffs (operator matrix + receipt only)
