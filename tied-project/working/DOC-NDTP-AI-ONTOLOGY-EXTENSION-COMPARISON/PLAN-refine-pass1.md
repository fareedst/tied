# NDTP AI Ontology Extension × TIED — refined plan (pass 1)

| Field | Value |
| --- | --- |
| **Working token** | `DOC-NDTP-AI-ONTOLOGY-EXTENSION-COMPARISON` (outreach doc bundle; **no REQ mint**) |
| **Refined** | 2026-10-26 |
| **Source plan** | [ndtp_ontology_comparison_c8740da2.plan.md](/Users/fareed/.cursor/plans/ndtp_ontology_comparison_c8740da2.plan.md) |
| **Target evidence** | Local read-only inspection of `/Users/fareed/Downloads/ndtp-ai-ontology-extension-main` — **target-repo-observed**; upstream [National-Digital-Twin/ndtp-ai-ontology-extension](https://github.com/National-Digital-Twin/ndtp-ai-ontology-extension) (**NDTP-reported** in README) |
| **Process** | [@external-service-comparison](../../../tools/bundled-prompt-type-skills/external-service-comparison/SKILL.md) + [external-service-three-wave-comparison-template.md](../../../tied-bundle/docs/external-service-three-wave-comparison-template.md) — **Wave 1 + Wave 2** |
| **Tracker** | [checklist-tracker-refine.yaml](./checklist-tracker-refine.yaml) |

**Sibling pattern:** [Open Ontologies × TIED](../../../docs/comparisons/open-ontologies-repository-vs-tied-agent-management.md) (ontology **governance engine**); [Heimsbakk × TIED](../../../docs/comparisons/veronika-heimsbakk-ai-generated-ontologies-vs-tied-agent-management.md) (meaning ownership); [LangChain](../../../docs/comparisons/langchain-harness-engineering-vs-tied-agent-management.md) / [Traefik](../../../docs/comparisons/traefik-harness-platform-vs-tied-agent-management.md) (harness/platform seam); [Anthropic FV × TIED](../../../docs/comparisons/anthropic-llm-formal-verification-vs-tied-agent-management.md) (formal proof vs heuristic validation).

---

## Refine (Touchpoint 1 — RESOLVE)

**PRELOAD (session):** [tied-methodology.md](../../../tied-project/vocab/tied-methodology.md), [quality-assurance.md](../../../tied-project/vocab/quality-assurance.md), [sponsor-agent-relationship.md](../../../tied-project/vocab/sponsor-agent-relationship.md), [pseudocode-and-citdp.md](../../../tied-project/vocab/pseudocode-and-citdp.md), [prompt-composer.md](../../../tied-project/vocab/prompt-composer.md).

| NDTP / target term | TIED canonical term | Layer | Notes |
| --- | --- | --- | --- |
| **Streamlit four-step wizard** (input → process → generate → validate) | Prompt-type skills + `[PROC-AGENT_REQ_CHECKLIST]` steps | Process | **Gap** — domain ontology UX, not agent-management harness |
| **Human-in-the-loop / ontologist feedback** | Sponsor **person branch**, vocab before machine-readable intent | Agency | **Partial align** — cross-link Heimsbakk **conversation before syntax** |
| **IES Common Ontology extension** (templates in `app/templates/`) | Client domain vocab; **not** TIED core OWL | Domain | **Defer** product scope — cite as **target-repo-observed** |
| **BORO-framed LLM prompts** (`src/generation/generator.py`) | IMPL contract vocabulary (INPUT/OUTPUT/PRE/POST) | Methodology | **Composable** metaphor — different artifact (TTL vs pseudo-code) |
| **LLM TTL syntax repair** (`iterative_chatgpt_fix_ttl`, `max_chatgpt_fixes`) | LEAP + gated edits; pseudo-code before code | Harness | **Tension** — auto-repair without checklist gate |
| **Owlready2 + optional SHACL** (`src/validation/validator.py`) | `pseudocode_validate`, `tied_validate_consistency` | Quality | **Tension** — RDF/reasoner green ≠ intent YAML consistency |
| **Multi-agent persona simulation (ABM)** (`src/validation/abm.py`) | `[REQ-TIED_ADVERSARIAL_INQUIRY]` at integrated depth | Quality | **Composable** metaphor only — not inquiry artifacts |
| **NER / embeddings / fuzzy match** (`src/ingestion/*`) | — | ML pipeline | **Defer** |
| **OpenAI API dependency** | External LLM; operator env | Infra | **Defer** |
| **`pytest` with mocked OpenAI** (`tests/`) | TDD + `[REQ-MODULE_VALIDATION]` | Discipline | **Partial align** on module tests, not on ontology artifacts |
| **OSS checker workflow** (`.github/workflows/oss-checker.yml`) | Gov OSPO compliance | CI | **Defer** — not ontology correctness CI |
| **No MCP / agent harness surface** | Bounded TIED YAML MCP + `@external-service-comparison` | Platform | Contrast Open Ontologies **122-tool** story |
| **Reasoner green = domain truth** | Proof boundary in QA vocab | Proof | **Align** (anti-pattern parity with Open Ontologies cert limits) |

**Ambiguity cleared:** Scope is **Wave 1 repository capture + Wave 2 analysis + `.gitignore` allowlist** only. No TIED YAML, vocab **RECORD**, target test execution, Streamlit launch, OpenAI calls, or Wave 3 REQ from comparison prose.

**Adversarial / depth:** `profile_depth: **minimal**` — doc-only outreach; local external repo read; no stdd auth/network/persistence behavior change. Integrated inquiry **Defer**.

**Consequence ladder:**

| Decision | Class | Default |
| --- | --- | --- |
| Publish Wave 1 + Wave 2 + git allowlist | Reversible | Proceed at **build-plan** |
| Cross-link Open Ontologies / Heimsbakk / harness / Anthropic FV siblings | Reversible | Proceed in Wave 2 §3 and Related |
| Reciprocal back-links from sibling comparison files | Reversible | **Defer** unless sponsor expands blast radius |
| Bundle doc subsection (vocabulary-layer FAQ) | Reversible | **Defer** |
| [methodology-composition-matrix.md](../../../docs/comparisons/methodology-composition-matrix.md) row | Costly | **Defer** |
| Wave 3 REQ (ABM → inquiry, ontology export adapters) | Costly | **Defer** — list in analysis § phased recommendations |
| Project vocab RECORD (`ontology extension wizard`, `LLM TTL repair`) | Costly | **Defer** unless sponsor asks |

**Distinct from Open Ontologies:** Open Ontologies owns **plan/apply/monitor**, Lean certificates, and a large **MCP** ontology engine. This bundle owns **Streamlit HITL extension authoring** from CSV/JSON/RDF with LLM generation and Owlready2/SHACL checks — **authoring assistant**, not governance engine. Cross-link both in Related documents; do not merge scopes.

**Distinct from Heimsbakk:** Heimsbakk owns **essay-level meaning ownership**; this bundle owns an **executable wizard** with `ontologist_feedback` in generation prompts — compose both, do not duplicate essay prose in Wave 1.

**Gate (refine-plan):** Record `pre_implementation` with [checklist-tracker-refine.yaml](./checklist-tracker-refine.yaml); refine pass does **not** write comparison deliverables — **build-plan** executes Implement section.

**Gate state (2026-10-26):** `tied_checklist_gate_validate` → `allowed: false` (sparse outreach tracker; `invalid_slug`; `missing_required_step:sub-adversarial-inquiry-pass`). Same honest limitation as [DOC-OPEN-ONTOLOGIES-COMPARISON](../DOC-OPEN-ONTOLOGIES-COMPARISON/PLAN-refine-pass1.md) and [DOC-ANTHROPIC-FORMAL-VERIFICATION-COMPARISON](../DOC-ANTHROPIC-FORMAL-VERIFICATION-COMPARISON/evidence/refine-pass1-gate-note.md) — **not** a signal to add integrated inquiry to doc-only outreach. Do not claim gate success; **build-plan** for two markdown files remains the sponsor next step. Details: [evidence/refine-pass1-gate-note.md](./evidence/refine-pass1-gate-note.md).

---

## Plan (CITDP-lite)

**Change class:** Methodology outreach — **two comparison markdown files** under `docs/comparisons/` (**no** project REQ/ARCH/IMPL index mutation).

**Impact:**

| Area | Blast radius |
| --- | --- |
| `docs/comparisons/ndtp-ai-ontology-extension.md` | New Wave 1 capture (repo-as-source) |
| `docs/comparisons/ndtp-ai-ontology-extension-vs-tied-agent-management.md` | New Wave 2 analysis (14 template sections) |
| `.gitignore` | Two new `!docs/comparisons/ndtp-ai-ontology-extension*.md` lines after Anthropic FV allowlist |
| `tied-project/` YAML, vocab, methodology | **Unchanged** |

**Risk:** (1) Treating Owlready2/SHACL success as TIED effectiveness — mitigated by proof boundary + **not_measured**. (2) Implying NDTP wizard replaces CITDP/checklist agent management — mitigated by authority mermaid + non-adoptions. (3) Treating ABM persona chat as adversarial inquiry — mitigated by explicit **Composable** / non-substitution language. (4) Conflating NDTP with Open Ontologies — mitigated by sibling ownership table.

**LEAP / CITDP persist:** **Defer** — no `tied-project/citdp/CITDP-*.yaml` until Wave 3 behavior.

**Out-of-scope capture:** Wave 3 candidates in analysis phased table; optional `tied_feedback_operational_add` after commit (**Defer**).

---

## Test strategy (doc-only)

1. **Token grep:** `rg '\[REQ-[A-Z0-9_]+\]|\[ARCH-[A-Z0-9_]+\]|\[IMPL-[A-Z0-9_]+\]' docs/comparisons/ndtp-ai-ontology-extension*.md` — no **newly minted** project tokens in body (reference-only cites to existing stdd tokens OK).
2. **Claim labels:** README bullets → **NDTP-reported**; file paths and module behavior → **target-repo-observed**; TIED surfaces → **TIED-existing**; suggestions → **Recommendation-only**; Wave 3 → **Defer**; effectiveness → **not_measured**.
3. **Links:** Wave 1 ↔ Wave 2 metadata; analysis → Open Ontologies, Heimsbakk, LangChain, Traefik, Anthropic FV, template, `AGENTS.md`.
4. **Section parity:** Wave 2 contains all **14** template sections in order (Implement Phase 2).
5. **Wave 1 exit:** Metadata table, TL;DR, observation boundary, validation limits from `validator.py` docstring (`max_chatgpt_fixes`), no duplicated README chrome.
6. **Evidence boundary:** Both docs state target **`pytest` / Streamlit / OpenAI** were **not** re-run from stdd.
7. **Lint:** No `lint_yaml` (no TIED YAML changed).

---

## Implement (execution order — sponsor runs **build-plan**)

### Phase 0 — Git allowlist

Add to [`.gitignore`](../../../.gitignore) after the Anthropic FV comparison lines:

```gitignore
!docs/comparisons/ndtp-ai-ontology-extension.md
!docs/comparisons/ndtp-ai-ontology-extension-vs-tied-agent-management.md
```

Do not revert or reorder unrelated working-tree changes.

### Phase 1 — Wave 1 repository capture

Create [docs/comparisons/ndtp-ai-ontology-extension.md](../../../docs/comparisons/ndtp-ai-ontology-extension.md):

| Block | Content |
| --- | --- |
| Metadata table | GitHub URL + local path + **Captured** 2026-10-26; **Purpose** read-only repo summary; **Analysis (sibling)** → filled in Phase 2 |
| TL;DR | 5–7 bullets: NDTP/BIST Crown copyright; Streamlit wizard; OpenAI + spaCy; IES extension; Apache+OGL licenses; validation stack |
| What it is | Layout: `app/` (views, components, templates), `src/ingestion|generation|validation`, `scripts/` |
| How it is used | README four steps; `streamlit run app/main.py`; env `OPENAI_API_KEY` |
| Validation story | Owlready2, optional SHACL, LLM TTL repair cap — **target-repo-observed** from `validator.py` |
| Evaluation | Optional multi-agent ABM discussion — **target-repo-observed** from `abm.py` |
| CI / quality | OSS checker workflow (compliance helper) — not ontology gate matrix |
| Observation boundary | stdd did **not** run `pytest`, Streamlit, or live OpenAI |
| Notes for stdd readers | Link Wave 2; **authoring assistant** vs Open Ontologies **governance engine** |

**Grounding files (read-only, no test run):** `README.md`, `app/main.py`, `src/generation/generator.py`, `src/validation/validator.py`, `src/validation/abm.py`, `app/templates/instructions.txt`, `requirements.txt`, `.github/workflows/oss-checker.yml`.

### Phase 2 — Wave 2 analysis

Create [docs/comparisons/ndtp-ai-ontology-extension-vs-tied-agent-management.md](../../../docs/comparisons/ndtp-ai-ontology-extension-vs-tied-agent-management.md) with **required sections in order**:

1. Metadata table (Purpose, Audience, Source, **Repository capture (sibling)**, Status, Executable follow-up, **Distinct from**, TIED anchors)
2. Executive summary — NDTP COG (HITL ontology extension wizard) vs TIED COG; compose-don’t-replace + optional COG table
3. Source summary (NDTP/target claims only)
4. Relationship to sibling comparisons — ownership table (this doc vs Open Ontologies, Heimsbakk, harness docs, Anthropic FV)
5. Harness lessons → TIED agent management — thematic subsections + mapping tables
6. Touchpoint 1 — RESOLVE — vocabulary + claim labeling
7. Primary capability matrix (~12–15 rows — see draft below)
8. Authority boundary — Mermaid: NDTP data→LLM→validate→export → harness-adjacent → TIED core
9. Anti-patterns — reasoner green = domain truth; LLM TTL repair without sponsor; ABM as inquiry substitute
10. Compose-don’t-replace table
11. Bounded operator recommendations (**Recommendation-only**)
12. Phased recommendations — Phase 0 = doc commit; Phase 1+ **Defer**
13. Explicit non-adoptions
14. Proof boundary + Related documents

**Back-links:** Update Wave 1 **Analysis (sibling)** → analysis path.

### Phase 3 — Verification

Run test strategy §1–7; update [evidence/build-plan-handoff.md](./evidence/build-plan-handoff.md).

**Skip:** `tied_validate_consistency`. **Skip:** target `pytest`, Streamlit, OpenAI.

---

## Wave 2 — Primary capability matrix (draft rows)

| Concern | TIED COG | Disposition | One-line rationale |
| --- | --- | --- | --- |
| HITL iteration with ontologist feedback | Sponsor person branch, LEAP | **Partial align** | Feedback loop exists; artifact is TTL not REQ graph |
| Meaning before machine-readable output | Vocab RESOLVE/RECORD | **Align** | Cross-link Heimsbakk |
| Domain ontology extension (IES/BORO) | SKOS-adjacent vocab only | **Defer** | Not TIED core |
| LLM-generated ontology snippets | IMPL essence_pseudocode + TDD | **Tension** | Different source-of-truth |
| LLM auto-repair of syntax | Gated LEAP, checklist | **Tension** | Harness risk without sponsor |
| OWL/SHACL/reasoner validation | `pseudocode_validate`, consistency tools | **Tension** | Validates RDF, not intent YAML |
| Multi-agent persona evaluation (ABM) | Adversarial inquiry | **Composable** | Metaphor only |
| Streamlit operator wizard | Prompt-type skills | **Gap** | Different UX plane |
| Module unit tests (pytest mocks) | `[REQ-MODULE_VALIDATION]` | **Partial align** | Discipline without shared artifact |
| Agent MCP harness | Bounded TIED YAML MCP | **Gap** | Target has no agent MCP surface |
| Traceability graph (REQ/ARCH/IMPL) | TIED token stack | **Gap** | Target exports TTL, not tokens |
| Open Ontologies plan/apply/certs | CITDP + gates | **Composable** | Sibling engine — do not conflate |
| `tied_validate_consistency` = domain truth | — | **Align** (anti-pattern) | Match reasoner scope limits |
| Digital twin / NDTP programme context | Client domain | **Defer** | Outreach cites funding only |

---

## Proof boundary (unchanged)

NDTP demonstrates **assisted ontology extension and technical RDF validation** for digital-twin-style workflows; it does **not** prove TIED checklist effectiveness. TIED proves **traceability and gate-enforced implementation consistency** in this repo, not RDF domain correctness or NDTP output quality. Wave 3 behavior change requires scoped **add-feature** / **build-plan** — not comparison prose alone.

---

## Sponsor next step

| Action | When |
| --- | --- |
| **build-plan** on this working folder | Write deliverables + run Phase 3 verification |
| **git commit** | Sponsor-owned after review |
| **close-out** | Optional envelope sync only if sponsor explicitly requests |
| Promote recommendations to TIED YAML/MCP | Scoped TIED workflow (**costly**) |

**Refine-plan status:** Complete (pass 1, 2026-10-26). **Build-plan status:** Complete (2026-10-26); see [evidence/build-plan-handoff.md](./evidence/build-plan-handoff.md). **Close-out status:** Process pass, machine gate blocked (2026-10-26); see [evidence/close-out-handoff.md](./evidence/close-out-handoff.md).
