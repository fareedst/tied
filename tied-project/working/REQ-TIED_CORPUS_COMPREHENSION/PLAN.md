# REQ-TIED_CORPUS_COMPREHENSION — add-feature (refine + plan)

| Field | Value |
| --- | --- |
| **Change ID** | `REQ-TIED_CORPUS_COMPREHENSION` |
| **Status** | **Slice 1 implemented** (build-plan 2026-10-31) · verification gate passed · **close-out deferred** |
| **Origin** | [gap-planning-handoff.md](../DOC-STDD-TIED-PROJECT-BROWNFIELD/evidence/gap-planning-handoff.md) **G3** · manifest gap `methodology:tied_yaml_corpus_not_in_source_graph` |
| **Parent engagement** | `DOC-STDD-TIED-PROJECT-BROWNFIELD` (brownfield comprehension; gaps are backlog until this REQ locks) |
| **Depends on** | `[REQ-TIED_SOURCE_GRAPH_COMPREHENSION]` (code graph), `tied_scoped_analysis_run` patterns (impact roots) |
| **Depth** | `minimal` · **gate_policy:** `advisory` |
| **Working folder** | `tied-project/working/REQ-TIED_CORPUS_COMPREHENSION/` |

---

## Refine disposition

**Problem:** EDPC and brownfield matrices cannot trace **REQ → detail file → IMPL sidecar** via `tied_source_graph_*` alone (TS/JS static graph only). Gap **G3** in [edpc-publish-manifest.v1.json](../DOC-STDD-TIED-PROJECT-BROWNFIELD/evidence/edpc/edpc-publish-manifest.v1.json).

**Intent:** Add **evidence-only** corpus graph MCP tools that index **project TIED YAML** under `tied-project/` (indexes + detail paths + static cross-refs). Same authority model as source graph: **observed** receipts, no project YAML mutation, no checklist gate authority from graph output.

### Resolved terms

| Term | Meaning |
| --- | --- |
| **corpus graph** | Deterministic index of TIED tokens, detail paths, and static reference edges from YAML/Markdown under `tied-project/` |
| **corpus_graph** | Matrix / EDPC `source_type` for rows citing corpus MCP receipts (always **observed** until sponsor **approved**) |
| **slice 1** | YAML index rows + detail YAML token refs; optional Markdown scan of `implementation-decisions/*-pseudocode.md` for `[REQ-*]` / `[IMPL-*]` mentions |
| **regenerable index** | Default under `tied-bundle/reports/corpus-graph/` (parallel to source-graph cache layout) |

### Reversible defaults (recorded in CITDP)

| ID | Default |
| --- | --- |
| C1 | **Separate** `corpus-graph-index.v1` schema and `mcp-server/src/corpus-graph/` module (compose with, do not merge into TS symbol index) |
| C2 | **Slice 1** languages: project YAML + detail YAML + pseudocode sidecar Markdown only (no methodology `tied-bundle/` index mutation path) |
| C3 | **One umbrella REQ** with modular `[IMPL-TIED_CORPUS_GRAPH_*]` slices (mirror Phase 2 source graph) |
| C4 | Freshness diagnostics **advisory** at verification (inherit C5 from source graph) |

### Costly choices (sponsor confirm before build-plan if changed)

| ID | Choice | Default |
| --- | --- | --- |
| CC1 | New REQ vs extend `[REQ-TIED_SOURCE_GRAPH_COMPREHENSION]` | **New REQ** (`REQ-TIED_CORPUS_COMPREHENSION`) per brownfield handoff |
| CC2 | Unified MCP tool names vs `tied_corpus_graph_*` prefix | **`tied_corpus_graph_refresh|map|trace|freshness`** |
| CC3 | Markdown pseudo-code in slice 1 vs deferred | **Included** as static regex scan (no AST) |

### Stop boundaries

No LLM enrichment; no writes to `tied-project/*.yaml`; no auto-promotion of graph edges to REQ status; no substitution for `tied_verify`. Route expansions (e.g. merged view / methodology bundle indexes) via CITDP amendment.

---

## Plan sketch (slice 1)

| Capability | Tool | IMPL slice |
| --- | --- | --- |
| Build index | `tied_corpus_graph_refresh` | `[IMPL-TIED_CORPUS_GRAPH_REFRESH]` |
| Hub / counts | `tied_corpus_graph_map` | `[IMPL-TIED_CORPUS_GRAPH_MAP]` |
| Token → detail → refs | `tied_corpus_graph_trace` | `[IMPL-TIED_CORPUS_GRAPH_TRACE]` |
| Stale detection | `tied_corpus_graph_freshness` | (shared with refresh module) |
| Process | `[PROC-TIED_CORPUS_GRAPH_COMPREHENSION]` | When to run + link to EDPC / brownfield |

**ARCH:** `[ARCH-TIED_CORPUS_GRAPH_EVIDENCE_MODEL]` — evidence-only; `proof_boundary` on every receipt; cross-link `[ARCH-TIED_SOURCE_GRAPH_EVIDENCE_MODEL]`.

**Tests:** Fixture mini-repo under `mcp-server/test/fixtures/corpus-graph/` with 3 REQ tokens and one broken cross-ref; composition test for MCP registration.

**Dogfood:** Re-run DOC engagement slice C; extend [code-to-token-map.md](../DOC-STDD-TIED-PROJECT-BROWNFIELD/evidence/reports/code-to-token-map.md) with corpus edges.

---

## TIED enrollment (this add-feature pass)

Enroll REQ → ARCH → IMPL slices → PROC via TIED MCP; author IMPL pseudo-code sidecars; RED tests before production code per `[PROC-TIED_DEV_CYCLE]`.

**Gate:** `tied_checklist_gate_validate` `phase: pre_implementation` before RED/code (see `checklist-tracker-pre-implementation.yaml`).

**Note:** Brownfield **G6** (`identity` config gate) may still affect IDE MCP gate tools on the store; corpus work does not depend on gate schema but honest gates remain program priority 1 in [gap-planning-handoff.md](../DOC-STDD-TIED-PROJECT-BROWNFIELD/evidence/gap-planning-handoff.md).

---

## Other handoff gaps (out of scope for this REQ)

| Gap | Track |
| --- | --- |
| G6 | `@debug` / Wave 6 identity gate |
| G1, G5, G4, G7 | `@non-tied-plan` or small fixes |
| G2 | Document N/A |
