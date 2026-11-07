# Implementation plan — Netflix ontology observability Wave 3 (matrix row + doc compose)

| Field | Value |
| --- | --- |
| **request_token** | `REQ-TIED_NETFLIX_ONTOLOGY_OBSERVABILITY_WAVE3` |
| **working_slug** | `REQ-TIED_NETFLIX_ONTOLOGY_OBSERVABILITY_WAVE3` |
| **Primary source** | [netflix-ontology-driven-observability-vs-tied-agent-management.md](../../../docs/comparisons/netflix-ontology-driven-observability-vs-tied-agent-management.md) (Wave 3 sponsor promotion — full optional) |
| **Linked Cursor plan** | `/Users/fareed/.cursor/plans/netflix_wave_3_add-feature_11e315ad.plan.md` |
| **Non-tied handoff** | [session-handoff.md](../../../non-tied-plans/netflix-ontology-observability-vs-tied/evidence/session-handoff.md) |
| **CITDP** | [CITDP-REQ-TIED_NETFLIX_ONTOLOGY_OBSERVABILITY_WAVE3.yaml](../../citdp/CITDP-REQ-TIED_NETFLIX_ONTOLOGY_OBSERVABILITY_WAVE3.yaml) |
| **Tracker** | [checklist-tracker.yaml](checklist-tracker.yaml) |
| **Test strategy** | [test-strategy.md](test-strategy.md) |
| **depth_tier** | `minimal` |
| **gate_policy** | `advisory` |
| **methodology_surface_change_class** | `none` (doc-compose scope; no enrollment `surface_ref`) |
| **Operator interruption budget** | No new gate MCP; no SPARQL/QuipuDB product scope; matrix + bundle docs + bootstrap tests only |

---

## 1. Refine (Touchpoint 1 — RESOLVE)

### Intent authority

- **Sponsor intent:** Deliver Netflix comparison **Wave 3** after `/add-feature` + full-optional promotion: **methodology-composition-matrix §2 row 17**, **vocabulary-layer** operational-identity cross-link (Heimsbakk pair-read), **HTOL** Netflix source study, **complete sibling backlinks**, three-wave **worked example** + **client-development-index** pointer; optionally same close-out as uncommitted Waves 1–2.
- **Sponsor choice (resolved):** Full optional package (not matrix-only).
- **RESOLVE charter:** Slice order and test marker strings may change; intent authority stays compose-don't-replace (outreach + bundle docs, not ops KG as TIED core).

### RESOLVE table

| External / informal | TIED preferred term / surface | Notes |
| --- | --- | --- |
| Observability Ontology / QuipuDB | **Client ops KG — Defer** | Not `tied-project/` methodology SoT |
| Catalog gate (~49k entries) | **RESOLVE before mint** / vocab PRELOAD | Harness analogy only |
| AutoRCA / correlation engine | **Outside TIED core** | Humans + checklist on costly choices |
| Agents without context hallucinate | **PRELOAD** + HTOL failure class | **Netflix-reported** diagnosis |
| Matrix promotion | **§2 row 17** | Contract **16 → 17**; LEAP **SC-MCM-DOC** |
| Meaning vs operational identity | **Heimsbakk + Netflix pair-read** | [vocabulary-layer-tied-leap-citdp.md](../../../tied-bundle/docs/vocabulary-layer-tied-leap-citdp.md) |

**PRELOAD:** [feedback-to-tied.md](../../vocab/feedback-to-tied.md), [sponsor-agent-relationship.md](../../vocab/sponsor-agent-relationship.md), [harness-trace-observation-loop.md](../../../tied-bundle/docs/harness-trace-observation-loop.md), [external-service-three-wave-comparison-template.md](../../../tied-bundle/docs/external-service-three-wave-comparison-template.md).

**Compose authority:**

- [REQ-TIED_EXTERNAL_SERVICE_COMPARISON](../../requirements/REQ-TIED_EXTERNAL_SERVICE_COMPARISON.yaml)
- [REQ-TIED_HARNESS_TRACE_OBSERVATION_LOOP](../../requirements/REQ-TIED_HARNESS_TRACE_OBSERVATION_LOOP.yaml)
- [REQ-TIED_METHODOLOGY_COMPOSITION_MATRIX](../../requirements/REQ-TIED_METHODOLOGY_COMPOSITION_MATRIX.yaml)

### Adversarial depth and gate policy

| Field | Value | Rationale |
| --- | --- | --- |
| `depth_tier` | **minimal** | Bundle docs + matrix row only |
| `gate_policy` | **advisory** | No checklist authority change |
| `research_profile` | **read-only** | Comparison + operator recipes |
| `integrated_waiver` | **n/a** | |

### Consequence ladder

| Decision | Ladder | Disposition |
| --- | --- | --- |
| Phase 3 matrix row 17 + full doc compose | **Costly** | **Do** (sponsor full optional 2026-11-07) |
| LEAP matrix SC **16→17** | **Reversible** | **Do** with REQ-TIED_METHODOLOGY_COMPOSITION_MATRIX update |
| `tied-project/vocab` RECORD (`operational_identity`) | **Costly** | **Defer** |
| QuipuDB / AutoRCA in core | **Costly** | **Do not** |
| Claim Netflix RCA/incident metrics improved TIED | **Costly** | **Do not** |

---

## 2. CITDP

**Record:** [CITDP-REQ-TIED_NETFLIX_ONTOLOGY_OBSERVABILITY_WAVE3.yaml](../../citdp/CITDP-REQ-TIED_NETFLIX_ONTOLOGY_OBSERVABILITY_WAVE3.yaml)

---

## 3. Compose-don't-replace contract

| Harness / outreach (tune here) | Platform-adjacent authority (do not replace) |
| --- | --- |
| Matrix §2 row 17 mechanism draft cells | **`tied_checklist_gate_validate`** outcomes |
| PRELOAD / vocabulary-layer pair-read prose | Project REQ/ARCH/IMPL via **TIED MCP** |
| HTOL Netflix source-study cite | **`tied_verify`**, LEAP, checklist slugs |
| Kaizen **`tied_feedback_capture_observation`** | Gate receipts for implement-complete claims |

**Authority:** Netflix **enrichers, SPARQL, correlation engine, AutoRCA** remain outside TIED authoritative core per Wave 2 authority boundary mermaid.

---

## 4. Draft §2 row 17 (implement copies into matrix)

| Column | Draft content |
| --- | --- |
| **#** | 17 |
| **Framework** | Netflix ontology-driven observability (operational identity graph) |
| **Loop(s)** | 1–2 |
| **Disposition** | **Composable** |
| **TIED center of gravity** | **Catalog-before-entity** and **shared vocabulary** for harness context (PRELOAD, RESOLVE) vs platform-adjacent proof (gates, MCP YAML, **`tied_verify`**) |
| **Evidence refs** | [Netflix × TIED](../../../docs/comparisons/netflix-ontology-driven-observability-vs-tied-agent-management.md), [vocabulary-layer](../../../tied-bundle/docs/vocabulary-layer-tied-leap-citdp.md), [HTOL](../../../tied-bundle/docs/harness-trace-observation-loop.md), [Heimsbakk × TIED](../../../docs/comparisons/veronika-heimsbakk-ai-generated-ontologies-vs-tied-agent-management.md), [Open Ontologies × TIED](../../../docs/comparisons/open-ontologies-repository-vs-tied-agent-management.md) |
| **vocabulary** | `tied-project/vocab/routing.md`; `[PROC-VOCABULARY_INDEX]` PRELOAD/RESOLVE |
| **intent_stack** | Living REQ/ARCH/IMPL graph; **not** SPARQL as SoT |
| **change_analysis** | CITDP on matrix/doc edits; **Netflix-reported metric overclaim** failure class |
| **implementation_proof** | Bootstrap doc contract tests; link audit |
| **anti_drift** | Label **Netflix-reported**; gate receipts ≠ incident graph green |
| **improvement_loop** | Kaizen Loop 2; client ops KG **Defer** |
| **sponsor_notes** | **Composable:** QuipuDB/MELT/AutoRCA **Defer**; pair **row 14–15** (Cursor/LangChain harness) for trace vs **row 17** (operational identity compose); pair Heimsbakk for meaning ownership; metrics **Netflix-reported** only |

---

## 5a. Slice C backlink inventory (build-plan)

Netflix already appears in **Distinct from** on Open Ontologies, Heimsbakk, and NDTP. These siblings still lack a Netflix reciprocal (grep 2026-11-07):

| File | Action |
| --- | --- |
| [langchain-harness-engineering-vs-tied-agent-management.md](../../../docs/comparisons/langchain-harness-engineering-vs-tied-agent-management.md) | Add **Distinct from** link — trace harness vs operational identity graph (pair rows **15** / **17**) |
| [anthropic-llm-formal-verification-vs-tied-agent-management.md](../../../docs/comparisons/anthropic-llm-formal-verification-vs-tied-agent-management.md) | Add reciprocal — proof obligations vs observability ontology compose |
| [tied-vs-well-known-methodologies.md](../../../docs/comparisons/tied-vs-well-known-methodologies.md) | Add map entry / cross-ref to Netflix comparison |

**Verify only (already linked):** [open-ontologies-repository-vs-tied-agent-management.md](../../../docs/comparisons/open-ontologies-repository-vs-tied-agent-management.md), [veronika-heimsbakk-ai-generated-ontologies-vs-tied-agent-management.md](../../../docs/comparisons/veronika-heimsbakk-ai-generated-ontologies-vs-tied-agent-management.md), [ndtp-ai-ontology-extension-vs-tied-agent-management.md](../../../docs/comparisons/ndtp-ai-ontology-extension-vs-tied-agent-management.md).

**Netflix comparison GREEN (slice A):** Phased recommendations table — flip Wave 3 **Defer** rows for vocabulary-layer cross-link, matrix §2 row, and HTOL cite to **Implemented** (or sponsor-equivalent) per [netflix-ontology-driven-observability-vs-tied-agent-management.md](../../../docs/comparisons/netflix-ontology-driven-observability-vs-tied-agent-management.md) § Phased recommendations.

---

## 5. Phased slices (build-plan executes)

| Order | Slice | Primary deliverable |
| ---: | --- | --- |
| 1 | **F** | REQ/ARCH/IMPL minted at refine-plan; pseudo-code gate |
| 2 | **0** | Optional Wave 1–2 staging per non-tied handoff |
| 3 | **A-test** | RED → GREEN: `methodology-composition-matrix-netflix-row.test.mjs` |
| 4 | **A** | Matrix row 17 + Netflix comparison Wave 3 **Implemented** + LEAP SC-MCM-DOC |
| 5 | **B-test** | RED → GREEN: extend `harness-trace-observation-loop-doc.test.mjs` (Netflix markers) |
| 6 | **B** | `vocabulary-layer-tied-leap-citdp.md` subsection + HTOL source study |
| 7 | **C** | Sibling backlinks (LangChain, Anthropic FV, tied-vs-well-known; verify ontology siblings) |
| 8 | **D** | `external-service-three-wave-comparison-template.md` + `client-development-index.md` |
| 9 | **E** | `tied_validate_consistency` + verification gate |

**Forbidden:** SPARQL/QuipuDB as TIED core; auto YAML from comparison prose; Netflix effectiveness claims; new harness skill.

---

## 6. RED test contract (build-plan copies pattern from LangChain row 15)

Author **`tools/bootstrap/lib/methodology-composition-matrix-netflix-row.test.mjs`** mirroring [methodology-composition-matrix-langchain-row.test.mjs](../../../tools/bootstrap/lib/methodology-composition-matrix-langchain-row.test.mjs):

| Assertion | Expected after GREEN |
| --- | --- |
| Status line | `§2 **17** rows` and `exactly **17** data rows` in matrix header |
| Row inventory | `countSection2DataRows` → `1..17` contiguous |
| Row 17 label | `Netflix ontology-driven observability` (or PLAN draft framework string) |
| Comparison link | `netflix-ontology-driven-observability-vs-tied-agent-management.md` |
| Proof boundary | `Netflix-reported` in row 17 `sponsor_notes` (table line starting `\| 17 \|`) |
| Harness pairing | Row 17 `sponsor_notes` references rows **14–15** (Cursor/LangChain trace harness) |
| Bundle refs | `vocabulary-layer-tied-leap-citdp.md`, `harness-trace-observation-loop.md` in evidence refs or row cells |

**HTOL doc test (slice B RED):** Append to `REQUIRED_MARKERS` in [harness-trace-observation-loop-doc.test.mjs](../../../tools/bootstrap/lib/harness-trace-observation-loop-doc.test.mjs): `netflix-ontology-driven-observability-vs-tied-agent-management.md`, `REQ-TIED_NETFLIX_ONTOLOGY_OBSERVABILITY_WAVE3`, and (if added) `## Source studies (Netflix compose)`.

---

## 7. Test strategy

See [test-strategy.md](test-strategy.md). **RED first:** matrix row 17 + HTOL Netflix markers before GREEN content.

---

## 8. Implement handoff

Run **`@build-plan`** on this PLAN after **`pre_implementation` gate allowed**.

**Refine-plan pass 2 (2026-11-07):** RED contract + slice C backlink inventory; revalidated gates. **No** matrix/doc GREEN edits in refine pass.

**Gate operator recipe (client paths):**

```bash
.cursor/skills/tied-yaml/scripts/tied-cli.sh tied_gate_check "$(cat <<'EOF'
{
  "request_token": "REQ-TIED_NETFLIX_ONTOLOGY_OBSERVABILITY_WAVE3",
  "phase": "pre_implementation",
  "project_root": "/Users/fareed/Documents/dev/chatgpt/stdd",
  "citdp_path": "tied-project/citdp/CITDP-REQ-TIED_NETFLIX_ONTOLOGY_OBSERVABILITY_WAVE3.yaml",
  "tracker_path": "tied-project/working/REQ-TIED_NETFLIX_ONTOLOGY_OBSERVABILITY_WAVE3/checklist-tracker.yaml"
}
EOF
)"
```

Use explicit `citdp_path` / `tracker_path` under `tied-project/` (default `tied/citdp/` resolution fails in this repo layout).

---

## 9. Gate status (refine-plan)

**`pre_implementation` (2026-11-07, pass 2):** `tied_gate_check` → **`allowed: true`**, `depth_tier: minimal`, `gate_policy: advisory`, `methodology_surface_change_class: none`. `sub-adversarial-inquiry-pass` → **not_applicable** ([not-applicable-receipt.v1.json](evidence/not-applicable-receipt.v1.json)). `pseudocode_validate` `gate_mode` → **ok**.
