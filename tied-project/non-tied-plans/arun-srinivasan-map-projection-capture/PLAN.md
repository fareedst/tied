# Plan: Arun Srinivasan “Every map has a projection” (Wave 1, local-only)

**Slug:** `arun-srinivasan-map-projection-capture`  
**Track:** Cursor plan → `@non-tied-refine` (this plan) → `@non-tied-build` → optional `@non-tied-close`  
**Source:** [Every map has a projection](https://arunsr1ni.substack.com/p/every-map-has-a-projection) (Substack, Arun Srinivasan — “Here Be Dragons”, part 3)  
**Template (Wave 1 only):** [`tied-bundle/docs/external-service-three-wave-comparison-template.md`](../../../tied-bundle/docs/external-service-three-wave-comparison-template.md) — capture sections, not Wave 2 matrix  
**Evaluation charter (proof only):** [`docs/tied-methodology-evaluation-framework.md`](../../../docs/tied-methodology-evaluation-framework.md) — external reference informs ontology/Q3 discussion, **not** comparable-arms metrics

## Scope

Doc-only **Wave 1 summary capture**: distill Srinivasan’s argument that **LLM-extracted graphs are unprojected maps**; upper ontologies (BFO/IOF, DOLCE/DnS, UFO/gUFO/UFO-L) are **projections** tested on a supply-chain contract (Ever Given / General Average); agents need **legends** (layered projections + PROV for decisions). **No** Wave 2 TIED × agent-management analysis, **no** project REQ/ARCH/IMPL YAML, **no** `.gitignore` allowlist unless sponsor opts in.

| Boundary | Choice |
| --- | --- |
| Deliverable | `docs/comparisons/arun-srinivasan-every-map-has-a-projection.md` |
| Publish | **Local only** — parent rule `docs/comparisons/*` |
| Evidence tool | **agent-browser** (primary per sponsor); preflight fetch may cross-check only |
| Body style | **Summary stub** (Heimsbakk pattern): metadata, TL;DR, thematic sections — **no** full Substack reproduction |
| Claims | **Srinivasan-reported**; stdd **not_measured** for UFO-L experiment replication |

## Refine outcomes (Touchpoint 1)

| Term | Meaning |
| --- | --- |
| **Wave 1** | Link + labeled summary for comparison routing; no token mint |
| **Projection** | Upper-ontology commitments (what kinds exist, identity, relations) — not “truth” |
| **Legend** | Per-layer projection declaration + governance (type-before-extract, SHACL, seam tests) |
| **Gitignored capture** | Sponsor intent: keep summary under `docs/comparisons/` without allowlist |

**Gate:** Ambiguity cleared — single deliverable, local-only, browser-primary read.

## Evidence inputs (read-only)

| Role | Source |
| --- | --- |
| Primary | Substack URL above (full post via agent-browser) |
| Cross-check | Optional second pass if lazy-load truncates body |
| Context (link only) | Prior “Here Be Dragons” parts — cite series in metadata, do not assume part 1–2 content |

## Deliverable outline (`@non-tied-build`)

1. **Metadata table** — Source URL, author, published **2026-11-03**, captured date, purpose, proof boundary, sibling Wave 2 placeholder filename, related captures (Heimsbakk, Open Ontologies, Netflix, NDTP).
2. **Why no article body** — Redistribution / summary-only note (Heimsbakk-style).
3. **TL;DR** — 8–12 bullets, all **Srinivasan-reported**.
4. **Thematic summary** (condensed, non-verbatim):
   - Ever Given scenario; agent Q1 (where) vs Q2 (breach / force majeure) vs Q3 (General Average security).
   - LLM extraction → “ontology” mistake; Figay / Vasiliev category errors (role/kind, representation/thing, judgment/fact, event/status).
   - Map projection metaphor; BFO+IOF vs DOLCE/DnS vs UFO/gUFO/UFO-L on PO-4471; scorecard + UFO-L AWS experiment (72.6% → 83.2%).
   - Edge-as-property vs relator-as-node; n-ary promotion; RDF 1.2 triple terms ≠ relator.
   - Valid time vs record time; PROV-O for force-majeure assessment pattern.
   - **Legend:** BFO/IOF material, UFO-L commitments, PROV knowledge; seven governance bullets; seam testing.
   - Closing: “Babel with confidence”; who draws the legend.
5. **Notes for stdd readers** — Proof boundary; evaluation-framework link (Q3 stack-origin / ontology comparisons, not effectiveness proof); cross-links to sibling captures.

## Plan package paths

| Artifact | Path |
| --- | --- |
| Capture | `docs/comparisons/arun-srinivasan-every-map-has-a-projection.md` |
| Plan folder | `tied-project/non-tied-plans/arun-srinivasan-map-projection-capture/PLAN.md`, `test-strategy.md`, `evidence/session-handoff.md` |

## Forbidden

Minting REQ/ARCH/IMPL from capture prose; MCP project YAML writes; `.gitignore` allowlist without sponsor opt-in; pasting full Substack body; treating Srinivasan’s ontology scorecard as TIED validation evidence; Wave 2 matrix in Wave 1 file.

## Verification

See [test-strategy.md](test-strategy.md). Handoff: [evidence/session-handoff.md](evidence/session-handoff.md).
