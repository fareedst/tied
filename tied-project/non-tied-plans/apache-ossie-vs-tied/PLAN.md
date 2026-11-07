# Plan: Apache Ossie × TIED — agent management (Waves 1–2, local-only)

**Slug:** `apache-ossie-vs-tied`  
**Track:** `@non-tied-refine` (this plan) → `@non-tied-build` → optional `@non-tied-close`  
**Source:** [apache/ossie](https://github.com/apache/ossie) (Apache **incubating**; formerly **Open Semantic Interchange / OSI**)  
**Template:** [`tied-bundle/docs/external-service-three-wave-comparison-template.md`](../../../tied-bundle/docs/external-service-three-wave-comparison-template.md) Waves 1–2  
**Evaluation charter:** [`docs/tied-methodology-evaluation-framework.md`](../../../docs/tied-methodology-evaluation-framework.md) — Q1–Q6 literacy + proof principles; **not** comparable-arms evidence

## Scope

Doc-only **Wave 1 capture + Wave 2 comparison**: map Ossie’s **vendor-neutral semantic model interchange** (JSON/YAML core spec, ontology layer, validation/compliance grader, converters hub, `ai_context` for AI/BI) to TIED **software delivery traceability** in this repo—not adopting Ossie as TIED core, not enrolling Ossie repos in the evaluation corpus.

| Boundary | Choice |
| --- | --- |
| Wave 1 deliverable | `docs/comparisons/apache-ossie.md` |
| Wave 2 deliverable | `docs/comparisons/apache-ossie-vs-tied-agent-management.md` |
| Publish | **Local only** — parent `docs/comparisons/*` (no `.gitignore` allowlist unless sponsor opts in) |
| Wave 3 | **Defer** — §11 compose candidates only |
| Execution policy | **`static_only`** — GitHub/spec read; optional local validator run only if build records command + outcome |

## Refine outcomes (Touchpoint 1 — RESOLVE)

| Term (Ossie) | Wave mapping intent (TIED lens) |
| --- | --- |
| **Semantic model** | Interchange document (`datasets`, `metrics`, `relationships`) — not `tied-project/requirements/` |
| **Ontology (Ossie)** | Enterprise concept layer above physical layout — not TIED `tied-project/vocab/` glossaries |
| **Structural interoperability** | Any tool reads/writes same file shape — parallel to YAML schema + `lint_yaml`, not domain truth |
| **Conceptual interoperability** | Canonical business concepts across models (roadmap) — compose with vocab **legend** siblings; **Defer** adoption |
| **`ai_context`** | Agent-facing semantic instructions on a model — compose with skill PRELOAD / routing; not REQ body |
| **`OSSIE_SQL_2026`** | Portable expression dialect in spec — analogy to IMPL pseudo-code contracts; not interchangeable |
| **Portability grader / `validate.py`** | Structural + reference checks — parallel **Principle 1** to `tied_validate_consistency`; no Q1 claim |
| **Certified metrics** (roadmap WG) | Stewardship hooks — compose with sponsor ladder + verification-gated status metaphor |
| **Converters (`ossie-converters`)** | Hub-and-spoke exchange — compose with `tied-install` / methodology refresh seam; not LEAP auto-sync |
| **SoT (vendor narrative)** | Evaluation-charter **external narrative control** only |

**Gate:** Waves 1–2 in one slug; local-only publish; single GitHub source (converters repo cited, not deep capture unless gap).

## Evidence inputs (read-only)

| Role | Path / URL |
| --- | --- |
| Primary source | `README.md`, `core-spec/spec.md`, `ontology/ontology.md`, `ROADMAP.md` on [apache/ossie](https://github.com/apache/ossie) |
| Secondary | `validation/validate.py`, `compliance/` (headings only), `examples/tpcds_semantic_model.yaml`, [apache/ossie-converters](https://github.com/apache/ossie-converters) README |
| Sibling analyses | `nvidia-auto-ontology-vs-tied-agent-management.md`, `netflix-ontology-driven-observability-vs-tied-agent-management.md`, `open-ontologies-repository-vs-tied-agent-management.md`, `ndtp-ai-ontology-extension-vs-tied-agent-management.md`, `arun-srinivasan-every-map-has-a-projection-vs-tied-agent-management.md` (if present) |
| TIED anchors | `AGENTS.md`, `docs/tied-methodology-evaluation-framework.md`, `tied-bundle/docs/vocabulary-layer-tied-leap-citdp.md`, `tied-bundle/docs/vocabulary-index-analysis-and-standards.md`, `tied-project/vocab/sponsor-agent-relationship.md`, `tied-bundle/docs/agent-req-implementation-checklist.md`, `tied-bundle/docs/external-service-three-wave-comparison-template.md` |

## Deliverables (`@non-tied-build`)

| Artifact | Path |
| --- | --- |
| Wave 1 capture | `docs/comparisons/apache-ossie.md` |
| Wave 2 analysis | `docs/comparisons/apache-ossie-vs-tied-agent-management.md` |
| Capture back-link | Wave 1 **Analysis (sibling)** → Wave 2 relative path |
| NVIDIA reciprocal | One **Distinct from** line in `nvidia-auto-ontology-vs-tied-agent-management.md` (Ossie owns interchange; NVIDIA owns agentic catalog) |
| Plan folder | `tied-project/non-tied-plans/apache-ossie-vs-tied/` |

**Optional (Defer):** `methodology-composition-matrix.md` §2 row; run `validation/validate.py` on TPC-DS example with logged outcome.

## Center-of-gravity (compose-don’t-replace)

**Ossie (spec-observed / roadmap-reported):** **Analytics semantic metadata interchange** — one JSON/YAML shape for datasets, metrics, relationships, extensions, and optional ontology documents; validation and portability testing; ecosystem converters; roadmap toward **conceptual** alignment, catalog integration, **AI-native** semantic layer, and **governance/certification** hooks.

**TIED (stdd):** **Software delivery intent** — vocab RESOLVE/RECORD, CITDP, REQ → ARCH → IMPL with pseudo-code token comments, checklist gates, MCP **project** YAML, evidence-chain **proof boundaries**, sponsor **consequence ladder**.

**Compose:** Borrow **declare-before-consume**, **structural validation honesty**, **interchange vs authority separation**, **extension registry discipline**, and **AI context blocks** as harness-adjacent patterns. Keep **token graph authority**, **LEAP/checklist promotion**, and **separate Q1 arms** on the TIED plane. Do not equate grader pass with `tied_verify` or cohort defect rates.

## Wave 1 capture contract

Metadata table per template (Source, incubating status, **Captured** date, purpose = no token mint).

**Body sections (summary stub — no full spec paste):**

1. Problem statement (KPI fragmentation; unreliable AI on inconsistent business logic) — **Ossie-reported**.
2. Repository map (`core-spec/`, `ontology/`, `validation/`, `compliance/`, `python/`, `examples/`, converters repo).
3. Semantic model root fields + `custom_extensions` + `ai_context`.
4. Ontology spec: entity vs value types; mapping documents vs deprecated inline mappings.
5. Dialect model: `OSSIE_SQL_2026` vs opaque vendor dialect strings.
6. Tooling: Pydantic SDK, JSON Schema, `validate.py` scope (high level).
7. Roadmap headline: **structural** vs **conceptual** interoperability; metric semantics WG; governance/certification direction.
8. Rename OSI → Ossie; version **0.2.0.dev0** draft.

**Notes for stdd readers:** `static_only`; effectiveness **not_measured**; Wave 2 sibling link after build.

## Wave 2 analysis contract

1. **14 template sections** in order (Executive summary → Related documents).
2. **Executive summary** must include center-of-gravity table **and** evaluation-framework **Q1–Q6 mapping table** (per-cell disposition: compose / defer / not_applicable — no superiority claims).
3. **§3 sibling table** — own **neutral interchange + validation/grader + converters**; defer Netflix ops graph, Open Ontologies plan/apply, NDTP wizard, Arun legal projections, NVIDIA Generate/Certify/Answer runtime.
4. **§4 Harness lessons** — minimum **nine** subsections with mapping tables:
   - Structural vs conceptual interoperability (roadmap) vs vocab/checklist legend
   - Interchange authority vs MCP project YAML writes
   - `ai_context` vs PRELOAD / skills / AGENTS routing
   - Metric grain/scoping vs REQ behavioral scope
   - Ontology concepts vs `tied-project/vocab/` (naming collision risk)
   - Schema validation + grader vs `tied_validate_consistency` / `lint_yaml`
   - Portable SQL dialect vs IMPL pseudo-code expression choices
   - Converters hub vs methodology refresh / `tied-install` (loss bounds)
   - Certification/governance roadmap vs sponsor ladder + verify gates
   - Confusing business SoT with delivery SoT → evaluation **Q3** compose
5. **§6 matrix** — 12–15 rows; Align / Composable / Tension / Gap / Defer only.
6. **§7 mermaid** — Ossie validate/export → harness-adjacent → TIED core (gates, MCP project YAML, sponsor ladder).
7. **§11 phased recommendations** — Wave 3 default **Defer** (evaluation Q3 rubric cross-link; matrix row).
8. All Ossie claims **Ossie-reported** / **spec-observed** / **roadmap-reported**; TIED outcomes **not_measured**.

## Distinct from (scope ownership)

| Sibling | Ossie doc owns |
| --- | --- |
| NVIDIA Auto-Ontology × TIED | **Interchange spec + grader** — not agentic catalog / text-to-SQL MCP |
| Netflix observability × TIED | **Portable semantic model files** — not telemetry RDF harvest |
| Open Ontologies × TIED | **Analytics YAML/JSON semantics** — not RDF plan/apply + Lean certs |
| NDTP × TIED | **Validated interchange** — not TTL extension wizard |
| Arun projection × TIED | **Vendor-neutral metric/dataset SoT** — not upper-ontology/legal projections |
| Heimsbakk × TIED | **Interchange + structural validation** — not conversation-before-OWL essay (cross-link only) |

## Forbidden

REQ/ARCH/IMPL mint in capture/analysis body; claiming interchange validation proves TIED cohort superiority; universal maturity score; conflating **historical defect proxy** with **confirmed finding**; corpus row creation from this work; `.gitignore` allowlist without sponsor opt-in; automatic git push.

## Verification

See [test-strategy.md](test-strategy.md). Handoff: [evidence/session-handoff.md](evidence/session-handoff.md).
