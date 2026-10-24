# Heimsbakk “AI-generated Ontologies” × TIED — refined plan (pass 1)

| Field | Value |
| --- | --- |
| **Working token** | `DOC-HEIMSBBAKK-ONTOLOGY-COMPARISON` (outreach doc bundle; **no REQ mint**) |
| **Refined** | 2026-10-22 |
| **Source** | [On AI-generated Ontologies](https://veronahe.substack.com/p/on-ai-generated-ontologies) — **Heimsbakk-reported**; **full text not in repo** |
| **Process** | [external-service-three-wave-comparison-template.md](../../../tied-bundle/docs/external-service-three-wave-comparison-template.md) |
| **Sibling pattern** | [Ludanyi stub + analysis](../../../docs/comparisons/andras-ludanyi-illusion-of-measurement-judgment-cooperation-vs-tied-agent-management.md) |

---

## Refine (Touchpoint 1 — RESOLVE)

**PRELOAD (session):** [tied-methodology.md](../../../tied-project/vocab/tied-methodology.md) (vocabulary layer), [sponsor-agent-relationship.md](../../../tied-project/vocab/sponsor-agent-relationship.md), [pseudocode-and-citdp.md](../../../tied-project/vocab/pseudocode-and-citdp.md), [quality-assurance.md](../../../tied-project/vocab/quality-assurance.md) (proof boundaries).

| Sponsor / article term | TIED canonical term | Layer | Notes |
| --- | --- | --- | --- |
| Ontology (OWL/RDF) | **Not TIED core** — analogy only | Outreach | [vocabulary-layer-tied-leap-citdp.md](../../../tied-bundle/docs/vocabulary-layer-tied-leap-citdp.md) FAQ: SKOS-adjacent vocab, no reasoner |
| Human blueprint | **`tied-project/vocab/`** + sponsor-owned REQ/ARCH spine | Methodology | Conversation before machine-readable stack |
| SKOS draft enrichment | Synonym / naming-bridge tables (**RECORD** after curation) | Vocab | LLM may propose; sponsor/reviewer owns |
| SHACL scaffold | **`pseudocode_validate`**, checklist gates, test scaffolding | Process | Validates **against** known IMPL/REQ—not alien intent |
| Meaning ownership | Sponsor **person branch** + vocab **RESOLVE/RECORD** + traceability | Cross-cutting | **RESOLVE charter**: names only, not intent authority |
| Authorship vs review | Anti-pattern: bulk MCP token mint without conversation artifact | Gap → doc remedy P1 | Not gate-enforced until P3 |
| What / Why / Who | Glossary row + REQ criterion + hinge `owner` (partial) | Governance P2 | Heimsbakk competency-question analog |

**Ambiguity cleared:** Scope is **Wave 1–2 comparison docs + P1–P2 bundle doc edits** only; no OWL import; no `tied-project` YAML mint from outreach.

**Adversarial / depth:** `profile_depth: **minimal**` — doc-only outreach, no auth/network/persistence behavior change. External article is labeled **Heimsbakk-reported**; integrated inquiry **Defer** unless sponsor reopens for strict_candidate on comparison prose.

**Consequence ladder:**

| Decision | Class | Default |
| --- | --- | --- |
| Publish P0 comparison + git allowlist | Reversible | Proceed |
| P1 blueprint subsection + checklist cross-ref | Reversible | Proceed |
| P2 Steward/Why governance prose | Reversible | Proceed |
| P2 glossary RECORD (`meaning ownership`, `ontology blueprint`) | Costly | **Defer** unless sponsor asks |
| P3 matrix row | Costly | **Defer** |
| P3 MCP `competency_question` on token create | Costly | **Defer** — scoped `add-feature` |

**Gate (refine-plan):** `pre_implementation` checklist gate applies at **`build-plan` / execution** with [checklist-tracker-refine.yaml](./checklist-tracker-refine.yaml); refine pass does not execute file deliverables.

---

## Plan (CITDP-lite)

**Change class:** Methodology outreach + bundle documentation (**no** project REQ/ARCH/IMPL index mutation).

**Impact:**

| Area | Blast radius |
| --- | --- |
| `docs/comparisons/veronika-heimsbakk-*.md` | New allowlisted files |
| `.gitignore` | Two new `!` lines (explicit filenames) |
| `tied-bundle/docs/vocabulary-layer-tied-leap-citdp.md` | One new subsection + link |
| `tied-bundle/docs/agent-req-implementation-checklist.md` | One anti-pattern bullet or footnote under vocabulary gate (prefer over duplicating `ai-principles.md`) |
| `tied-bundle/docs/vocabulary-index-analysis-and-standards.md` | Optional governance bullets (P2) |

**Risk:** Accidental commit of Substack body — mitigated by stub template + post-commit grep (test strategy).

**Test strategy (doc-only):**

1. **Copyright:** `rg -i` for distinctive long phrases from user paste (e.g. `Every single d`, `Opus 5.5`) under `docs/comparisons/veronika-heimsbakk-*` — expect **no matches**.
2. **Links:** Relative links from analysis → stub, bundle anchors, Ludanyi sibling resolve.
3. **Parity:** Wave 2 analysis includes all 14 template sections (see Implement checklist).
4. **Lint:** Optional markdown spell-check; no `lint_yaml` (no TIED YAML changed in P0–P2).

**LEAP / CITDP persist:** **Defer** — no `tied-project/citdp/CITDP-*.yaml` until Wave 3 behavior (P3).

**Out-of-scope capture:** P3 tooling → note in analysis phased table + optional `tied_feedback_operational_add` after P0 ships (**Defer**).

---

## Implement (execution order when sponsor runs build-plan)

### Phase 0 — Git allowlist + Wave 1 stub

1. Add to [`.gitignore`](../../../.gitignore) (after Ludanyi lines):

   ```gitignore
   !docs/comparisons/veronika-heimsbakk-on-ai-generated-ontologies.md
   !docs/comparisons/veronika-heimsbakk-ai-generated-ontologies-vs-tied-agent-management.md
   ```

2. Create [docs/comparisons/veronika-heimsbakk-on-ai-generated-ontologies.md](../../../docs/comparisons/veronika-heimsbakk-on-ai-generated-ontologies.md) — mirror Ludanyi stub: metadata table, “Why no body”, TL;DR bullets only, sibling link.

### Phase 1 — Wave 2 analysis (Ludanyi parity)

Create [docs/comparisons/veronika-heimsbakk-ai-generated-ontologies-vs-tied-agent-management.md](../../../docs/comparisons/veronika-heimsbakk-ai-generated-ontologies-vs-tied-agent-management.md) with **required sections in order**:

1. Metadata table (**Purpose**, **Audience**, **Source URL**, **Sibling stub**, **Status**, **Executable follow-up**, **Distinct from**, **TIED anchors**)
2. Executive summary + center-of-gravity table (Heimsbakk KG/meaning vs TIED traceability)
3. Source summary (**Heimsbakk-reported** bullets only)
4. Relationship to sibling comparisons (own **semantic/meaning ownership**; cross-link Ludanyi **people/metrics**, LangChain/Cursor **harness**, [tied-vs-well-known-methodologies](../../../docs/comparisons/tied-vs-well-known-methodologies.md))
5. Harness lessons → TIED agent management (thematic subsections + mapping tables from draft plan)
6. Touchpoint 1 — RESOLVE (vocabulary disposition table + claim labeling)
7. Primary capability matrix (~12 rows: blueprint, average meaning, review≠authorship, SHACL-on-wrong-intent, etc.)
8. Authority boundary (mermaid: external KG practice → harness-adjacent → TIED core)
9. Anti-patterns table
10. Compose-don’t-replace table
11. Bounded operator recommendations (numbered)
12. Phased recommendations (Phase 0 done at commit; P1–P3 with **Defer** defaults)
13. Explicit non-adoptions (OWL core, reasoner, domain correctness = consistency green)
14. Proof boundary + Related documents

**Back-links:** Stub **Analysis (sibling)** → analysis path.

### Phase 2 — P1 bundle doc improvements

1. [vocabulary-layer-tied-leap-citdp.md](../../../tied-bundle/docs/vocabulary-layer-tied-leap-citdp.md): new **“Blueprint pattern (meaning ownership)”** after FAQ — human-owned vocab + REQ spine; LLM drafts SKOS-like/SHACL-like **scaffolds** only; link Heimsbakk stub; cite **What / Why / Who** hooks.
2. [agent-req-implementation-checklist.md](../../../tied-bundle/docs/agent-req-implementation-checklist.md): under vocabulary gate — **anti-pattern**: minting full REQ/ARCH/IMPL graphs or bulk MCP tokens without Touchpoint 1 **RESOLVE/RECORD** and without sponsor-explainable blueprint; agent output is **draft** until RECORD.

### Phase 3 — P2 optional (same PR or follow-up)

1. [vocabulary-index-analysis-and-standards.md](../../../tied-bundle/docs/vocabulary-index-analysis-and-standards.md) governance: optional **Steward** / **Why (REQ or competency one-liner)** guidance per major concept.
2. **Defer:** `client-development-index` three-wave row, matrix row, project vocab RECORD.

### Phase 4 — Verification (P0–P2)

- Run copyright grep test strategy.
- `tied_validate_consistency` — **skip** if no project YAML touched (expected).
- VALIDATE vocab naming only if P2 RECORD executed.

---

## Wave 2 — Primary capability matrix (draft rows for analysis)

| Concern | TIED COG | Disposition | One-line rationale |
| --- | --- | --- | --- |
| Conversation before machine-readable | Vocab → REQ stack | **Align** | Same epistemic order as ontology workshops |
| Human-owned blueprint | `tied-project/vocab/` + explainable REQ spine | **Align** | FAQ already SKOS-adjacent, not OWL |
| LLM plausible-average domain model | Ungoverned agent YAML mint | **Tension** | SKU-like failures → false synonyms / over-contracts |
| Review ≠ authorship | Bulk approve token dumps | **Gap** | Doc + optional future gate (P3) |
| SHACL on wrong intent | Green gates, missing sponsor intent | **Tension** | Proof boundary + PRELOAD |
| Surprising “inferences” | No reasoner; implicit test/IMPL logic | **Tension** | LEAP + pseudo-code validation |
| What / Why / Who accountability | Traceability + hinge owner | **Partial align** | Steward/Why in vocab **Gap** |
| Non-deterministic models from same prompt | Divergent token graphs | **Gap** | Conversation artifact before mint |
| Understand your codebase (NOKIOS theme) | LEAP + pseudo-code blueprint | **Align** | Composes with Ludanyi “understand repo” |
| Enterprise KG / OWL engineering | — | **Defer** | TIED not a graph database methodology |
| `tied_validate_consistency` = domain truth | — | **Align** (anti-pattern) | Matches “validation on wrong intent” warning |

---

## Proof boundary (unchanged)

Heimsbakk OWL examples are pedagogy; TIED does not replace professional ontology engineering; Wave 3 REQ only via scoped **add-feature**.
