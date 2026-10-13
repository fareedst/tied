# REQ-TIED_SOURCE_GRAPH_COMPREHENSION — Phase 2 (refined)

| Field | Value |
| --- | --- |
| **Change ID** | `REQ-TIED_SOURCE_GRAPH_COMPREHENSION` |
| **Status** | **Slice 1 implemented** (2026-10-13 build-plan) · verification/close_out **deferred** |
| **Parent program** | [TIED comprehension phases](file:///Users/fareed/.cursor/plans/tied_comprehension_phases_79fbed92.plan.md) Phase 2 |
| **Phase 1 entry** | [REQ-TIED_BROWNFIELD_INTENT_ELEVATION](../REQ-TIED_BROWNFIELD_INTENT_ELEVATION/evidence/session-handoff.md) close_out complete |
| **CITDP** | [CITDP-REQ-TIED_SOURCE_GRAPH_COMPREHENSION.yaml](./CITDP-REQ-TIED_SOURCE_GRAPH_COMPREHENSION.yaml) |
| **Comparison anchor** | [docs/comparisons/tied-vs-trail-code.md](../../../docs/comparisons/tied-vs-trail-code.md) |
| **Depth** | `minimal` · **gate_policy:** `advisory` |
| **Working folder** | `tied-project/working/REQ-TIED_SOURCE_GRAPH_COMPREHENSION/` |

**Refinement boundary:** Plan + CITDP + gate fixture only until `@build-plan`. No REQ/ARCH/IMPL index enrollment, pseudo-code sidecars, tests, or source in this pass.

---

## Current refinement disposition

### Refine

**Structural comprehension** is **evidence**, not authority: native graph tools accelerate impact discovery; TIED gates, sponsor adjudication, and Phase 1 **intent elevation** remain authoritative ([compose, do not substitute](../../../docs/comparisons/tied-vs-trail-code.md)).

Phase 1 entry criteria are met: verification manifest and dogfood validator receipt exist under `REQ-TIED_BROWNFIELD_INTENT_ELEVATION`. Inherited sponsor defaults from Phase 1 CITDP: **C2** native graph in `mcp-server`, **C3** one umbrella REQ with modular IMPL slices.

**Resolved terms**

| Term | Meaning |
| --- | --- |
| **source graph** | Deterministic tree-sitter symbol index + edges (refresh, map, trace, freshness) |
| **code_graph** | Matrix `source_type` for rows citing graph MCP receipts—always **observed** until sponsor **approved** |
| **regenerable index** | Default under `tied-bundle/reports/source-graph/` per ARCH—local cache, not canonical TIED YAML |
| **slice 1** | refresh + map + symbol traversal + freshness only |

**Reversible defaults (C4–C5 recorded in CITDP):** TS/JS first; freshness diagnostics **advisory** at verification.

**Stop boundaries:** no LLM enrichment, no blast/skeleton/search MCP, no external Graft dependency as authority, no `tied-project/*.yaml` writes from graph path, no checklist `allowed` from graph output. Route expansions through CITDP amendment + new refine/build cycle.

### CITDP Plan

Working CITDP holds change definition, SC-SGC-* success criteria, adversarial block, test strategy matrix, and TDD sequence. Persist canonical copy to `tied-project/citdp/` during **`@build-plan`** after enrollment begins—not in this refine pass.

**Phase 2 capability map (slice 1 vs deferred)**

| Trail/Graft analogue | Slice 1 (build) | Deferred slice |
| --- | --- | --- |
| refresh / check freshness | `tied_source_graph_refresh`, `tied_source_graph_freshness` | — |
| map | `tied_source_graph_map` | — |
| callers / callees | `tied_source_graph_trace` | — |
| ask / grep / skeleton | — | search MCP slice |
| blast | — | blast-radius slice |
| deep / LLM nodes | — | data-egress policy + sponsor gate |

**ARCH sketch (for build-plan enrollment)**

- Index schema version `source-graph-index.v1` with content hash and `proof_boundary` field on every receipt.
- Static limits: dynamic dispatch, re-exports, generated code, monorepo multi-root, symlinks—reuse fidelity **proof boundary** vocabulary.
- MCP handlers: INPUT repo root + optional path scope; OUTPUT receipts + graph views; **no** `yaml_index_*` / `yaml_detail_*`.

**Brownfield link:** Graph receipts attach to intent matrix rows (`source_type: code_graph`); promotion still human-gated via `[PROC-BROWNFIELD_INTENT_ELEVATION]`.

### Implement (not executed)

Build order (from CITDP `tdd_sequence`):

1. Enroll REQ → ARCH → IMPL slices → PROC via TIED MCP/CLI.
2. Author IMPL pseudo-code sidecars (`IMPL-TIED_SOURCE_GRAPH_*-pseudocode.md`) with PRE/POST/EFFECTS on active blocks.
3. RED → GREEN units per slice on fixtures under `mcp-server/test/fixtures/source-graph/`.
4. Composition: register MCP tools in `mcp-server/src/tools/index.ts`.
5. Verification gate, `tied_validate_consistency`, envelope sync.

---

## TIED enrollment (build-plan)

| Token | Role |
| --- | --- |
| `[REQ-TIED_SOURCE_GRAPH_COMPREHENSION]` | SC-SGC-* satisfaction criteria |
| `[ARCH-TIED_SOURCE_GRAPH_EVIDENCE_MODEL]` | Evidence-only graph; cache layout; static proof boundaries |
| `[IMPL-TIED_SOURCE_GRAPH_REFRESH]` | Index build, hash, freshness |
| `[IMPL-TIED_SOURCE_GRAPH_MAP]` | Map aggregation |
| `[IMPL-TIED_SOURCE_GRAPH_TRAVERSE]` | Symbol caller/callee traversal |
| `[PROC-TIED_SOURCE_GRAPH_COMPREHENSION]` | Checklist + tool table; link brownfield matrix `code_graph` |

---

## Test strategy outline

See CITDP `test_strategy.matrix`. Mandatory before code:

- Fixture mini-repo (TS import/call chain) checked into `mcp-server/test/fixtures/source-graph/`.
- No-mutation guard on `tied-project/requirements.yaml` (mirror brownfield composition test).
- Golden JSON for map + trace outputs (stable ordering).

---

## Gate record (refine-plan)

| Phase | Result | Notes |
| --- | --- | --- |
| `pre_implementation` | **allowed: true** | `tied_gate_check` 2026-10-13; `evidence/refine-plan-phase2-2026-10-13.md` |

---

## Costly choices (sponsor)

| # | Choice | Default in CITDP | Build-plan needs |
| --- | --- | --- | --- |
| C2 | Native vs external Graft | Native | Inherited ✓ |
| C3 | Umbrella REQ + modular IMPL | Yes | Inherited ✓ |
| C4 | Language scope slice 1 | TS/JS only | **Recorded** (`evidence/sponsor-decisions-evidence.md`) |
| C5 | Freshness at verification | Advisory | **Recorded** (`evidence/sponsor-decisions-evidence.md`) |

---

## Out of scope / LEAP

- OEE compatibility ledger automation.
- Auto-sync matrix rows from graph nodes.
- Trail GitHub App or telemetry paths.
