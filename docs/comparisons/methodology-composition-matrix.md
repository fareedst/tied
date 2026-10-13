# Methodology composition matrix

| Field | Value |
| --- | --- |
| **Purpose** | Sponsor-facing **loop × method** surface: prefilled dispositions and TIED center-of-gravity from existing comparisons; **TIED mechanism columns** are sponsor-owned (`_TBD_` in v1). |
| **Audience** | Sponsors, methodology owners, plan authors, agent operators |
| **Status** | **Skeleton / sponsor fill-in** (2026-10-13); tracked by [REQ-TIED_METHODOLOGY_COMPOSITION_MATRIX](../../tied-project/requirements/REQ-TIED_METHODOLOGY_COMPOSITION_MATRIX.yaml) |
| **Proof boundary** | Structure, row inventory, links, and TIED traceability only — **not** ISO/CMMI certification or behavioral equivalence with any row method. |
| **TIED anchors** | [Client development index](../../tied-bundle/docs/client-development-index.md), [Vocabulary layer × TIED × LEAP × CITDP](../../tied-bundle/docs/vocabulary-layer-tied-leap-citdp.md), [LEAP](../../tied-bundle/docs/LEAP.md), [processes](../../tied-bundle/docs/processes.md), [AGENTS.md](../../AGENTS.md) |
| **Sibling docs** | [TIED × well-known methodologies](tied-vs-well-known-methodologies.md), [QMM × TIED](qmm-kaizen-vs-tied.md), [Jev × TIED](jev-for-tied-improvement.md), [Trail-Code × TIED](tied-vs-trail-code.md) |
| **Last updated** | 2026-10-13 |

---

## §0 — How to read the matrix

### Three nested loops (QMM frame)

| Loop | Question | One-line TIED emphasis |
| --- | --- | --- |
| **1 — Product quality** | Does the product meet intent? | REQ→ARCH→IMPL, strict TDD order, verification — see [QMM × TIED § Three nested loops](qmm-kaizen-vs-tied.md#three-nested-loops-study-frame) |
| **2 — Process improvement** | Does the *way we work* get better? | Kaizen loop, checklist adaptation, CITDP — same anchor |
| **3 — Methodology learning** | Do our *rules* improve with evidence? | Pilots, evidence-chain, gate evolution — Loop 3 is the honest weakest area in QMM comparison |

**Compose-don’t-replace:** Rows describe how external methods relate to TIED; they do not replace TIED’s token graph, LEAP, or MCP gates.

### Disposition vocabulary

| Disposition | Meaning in this matrix |
| --- | --- |
| **Align** | Method intent is materially represented in TIED (scoped as stated in source comparisons). |
| **Composable** | Can be combined with TIED without claiming equivalence. |
| **Tension** | Boundary or trade-off needs sponsor review. |
| **Gap** | Material concern from the study is not covered in TIED core. |
| **Defer** | Insufficient evidence in TIED or sponsor-owned decision; maps “Not specified” / “Defer to client” from source docs. |
| **OutOfScope** | Intentionally excluded from v1 outreach (not a product rejection). |

### TIED mechanism columns (sponsor-owned)

All mechanism cells in §1 and §2 are **`_TBD_`** until the sponsor records how TIED vocabulary, intent stack, change analysis, implementation proof, anti-drift, and improvement loop **compose** with that row — without implying certification or full method adoption.

| Column | Meaning |
| --- | --- |
| `vocabulary` | Glossaries, RESOLVE/RECORD touchpoints |
| `intent_stack` | REQ/ARCH/IMPL + tokens |
| `change_analysis` | CITDP / checklist slugs |
| `implementation_proof` | TDD order, composition, module validation |
| `anti_drift` | LEAP, verify, manifests |
| `improvement_loop` | Kaizen, methodology experiments, LEAP proposal queue |
| `sponsor_notes` | Freeform |

### §1 loop assignment for delivery/scaling methods

Delivery and engineering rows that are not expanded in the [Primary QMM systems matrix](qmm-kaizen-vs-tied.md#primary-qmm-systems-matrix) use explicit loop assignment: **organizational process shape → Loop 2**; **engineering practices that prove product intent → Loop 1**; **Agile (manifesto)** appears on **both** Loop 1 (working software / intent) and Loop 2 (responding to change via LEAP and living specs).

---

## §1 — QMM loop × well-known / QMM systems {#section-1-qmm-loop}

**Row contract:** exactly **27** data rows (enumerated inventory). Mechanism columns: **`_TBD_`**.

| # | Loop | Method | Loop question (summary) | Disposition | TIED center of gravity | Evidence refs | vocabulary | intent_stack | change_analysis | implementation_proof | anti_drift | improvement_loop | sponsor_notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 2 | PDCA / PDSA | Does the process learn from plan–do–study–act? | **Tension** | CITDP, checklist, Kaizen countermeasure / outcome observation | [QMM § Primary matrix — PDCA](qmm-kaizen-vs-tied.md#primary-qmm-systems-matrix) | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| 2 | 3 | PDCA / PDSA | Do methodology rules change with studied outcomes? | **Tension** | Same as row 1; rule changes not uniformly hypothesis-logged | [QMM § PDSA learning mechanisms](qmm-kaizen-vs-tied.md#a-pdsa--improvement-as-experimental-learning) | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| 3 | 1 | TQM | Is quality a property of the whole work system? | **Align** | REQ→ARCH→IMPL traceability; **production system** (scoped) | [QMM § Primary matrix — TQM](qmm-kaizen-vs-tied.md#primary-qmm-systems-matrix) | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| 4 | 2 | TQM | Does process quality span the agent/TIED work system? | **Align** | Same scoped TQM alignment as Loop 1 | [Well-known § Quality — TQM](tied-vs-well-known-methodologies.md#quality-and-improvement-systems-enterprise-layer) | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| 5 | 2 | Lean / Kaizen | Does the process improve continuously with evidence? | **Align** | Kaizen loop, operational observation, feedback analysis | [QMM § Primary matrix — Lean / Kaizen](qmm-kaizen-vs-tied.md#primary-qmm-systems-matrix) | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| 6 | 2 | Six Sigma / DMAIC | Is defect reduction statistically managed org-wide? | **Defer** | Scoped adversarial inquiry + CITDP; not universal DMAIC | [QMM § Primary matrix — Six Sigma](qmm-kaizen-vs-tied.md#primary-qmm-systems-matrix) | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| 7 | 3 | SPC | Is variation interpreted over time (control charts)? | **Gap** | Proof boundaries, denominators, pilots — no control charts in core | [QMM § Primary matrix — SPC](qmm-kaizen-vs-tied.md#primary-qmm-systems-matrix) | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| 8 | 1 | ISO 9001–shaped QMS | Are product records auditable? | **Align** | Gates, manifests, working-folder placement (shape, not cert) | [QMM § Primary matrix — ISO 9001](qmm-kaizen-vs-tied.md#primary-qmm-systems-matrix) | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| 9 | 2 | ISO 9001–shaped QMS | Are process records auditable? | **Align** | Checklist receipts, adherence ledger | [Well-known § Quality — ISO-shaped QMS](tied-vs-well-known-methodologies.md#quality-and-improvement-systems-enterprise-layer) | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| 10 | 3 | ISO 9001–shaped QMS | Do methodology records support improvement? | **Align** | Committed vs local working roots; evidence discipline | [QMM § Three loops — Loop 3](qmm-kaizen-vs-tied.md#three-nested-loops-study-frame) | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| 11 | 3 | CMMI L4–5 | Is optimizing maturity quantitatively managed? | **Gap** | Evidence-chain profile fragments; not org CMMI levels | [QMM § Primary matrix — CMMI](qmm-kaizen-vs-tied.md#primary-qmm-systems-matrix) | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| 12 | 1 | XP | Is technical excellence enforced via tests and integration? | **Align** | TDD ordering, composition tests, LEAP | [QMM § Primary matrix — XP / TDD](qmm-kaizen-vs-tied.md#primary-qmm-systems-matrix) | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| 13 | 1 | TDD | Do tests drive design before production code? | **Align** | Mandatory unit RED before code per PROC-TIED_DEV_CYCLE | [Well-known § Engineering — TDD / ATDD](tied-vs-well-known-methodologies.md#engineering-practices-team-layer) | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| 14 | 1 | ATDD | Are acceptance tests linked to intent? | **Align** | Tests trace to IMPL blocks and tokens; strict RED discipline | [Well-known § Engineering — TDD / ATDD](tied-vs-well-known-methodologies.md#engineering-practices-team-layer) | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| 15 | 1 | BDD (Gherkin) | Are behavior examples stakeholder-visible? | **Composable** | Authoritative spec is IMPL pseudo-code; criteria can reference vocab | [Well-known § Engineering — BDD](tied-vs-well-known-methodologies.md#engineering-practices-team-layer) | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| 16 | 2 | Scrum | Does the team inspect and adapt on a cadence? | **Defer** | Checklist + gates + LEAP without Scrum roles/events | [QMM § Primary matrix — Scrum](qmm-kaizen-vs-tied.md#primary-qmm-systems-matrix) | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| 17 | 2 | DORA | Are delivery throughput and stability measured? | **Defer** | Metrics live in client CI/ops unless future REQ scopes them | [QMM § Primary matrix — DORA](qmm-kaizen-vs-tied.md#primary-qmm-systems-matrix) | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| 18 | 1 | SRE | Are reliability risks bounded and waived explicitly? | **Tension** | Residual risk, waivers, assurance rows — not product SLO semantics | [QMM § Primary matrix — SRE](qmm-kaizen-vs-tied.md#primary-qmm-systems-matrix) | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| 19 | 3 | Deming (methodology learning) | Do we revise standards from sustained evidence? | **Align** | Loop 3 direction: treat rule changes as experiments (concept; see QMM strategic suggestion) | [QMM § Strategic suggestion](qmm-kaizen-vs-tied.md#strategic-suggestion-high-level-only) | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| 20 | 2 | Waterfall | Are phases fixed with big upfront design? | **Tension** | Documentation-first living YAML + LEAP — not frozen phase handoffs | [Well-known § Delivery — Waterfall](tied-vs-well-known-methodologies.md#delivery-and-team-process-organizational-layer) | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| 21 | 1 | Agile (manifesto) | Is working software the measure of progress? | **Align** | Traceable specs and tests as engineering truth layer | [Well-known § Delivery — Agile](tied-vs-well-known-methodologies.md#delivery-and-team-process-organizational-layer) | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| 22 | 2 | Agile (manifesto) | Does the process respond to change? | **Align** | LEAP and living REQ/ARCH/IMPL vs frozen binders | [Well-known § Delivery — Agile](tied-vs-well-known-methodologies.md#delivery-and-team-process-organizational-layer) | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| 23 | 2 | Kanban | Is flow and WIP explicitly managed? | **Defer** | TIED scopes change items (REQ/CITDP), not board columns | [Well-known § Delivery — Kanban](tied-vs-well-known-methodologies.md#delivery-and-team-process-organizational-layer) | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| 24 | 2 | SAFe | Is portfolio / train-level planning in scope? | **OutOfScope** | Single-repo traceability; client may add own REQ | [Well-known § Delivery — SAFe / LeSS / Nexus](tied-vs-well-known-methodologies.md#delivery-and-team-process-organizational-layer) | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| 25 | 2 | LeSS | Is multi-team Scrum scaling in scope? | **OutOfScope** | Same as SAFe row | [Well-known § Delivery — SAFe / LeSS / Nexus](tied-vs-well-known-methodologies.md#delivery-and-team-process-organizational-layer) | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| 26 | 2 | Nexus | Is Nexus integration scaling in scope? | **OutOfScope** | Same as SAFe row | [Well-known § Delivery — SAFe / LeSS / Nexus](tied-vs-well-known-methodologies.md#delivery-and-team-process-organizational-layer) | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| 27 | 2 | DevOps / CI/CD | Are build/deploy pipelines part of TIED core? | **Defer** | Client pipelines; TIED validates methodology YAML + tests | [Well-known § Engineering — DevOps](tied-vs-well-known-methodologies.md#engineering-practices-team-layer) | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ |

---

## §2 — Layer C adjacent frameworks

**Row contract:** exactly **10** data rows. One row per framework; **`Loop(s)`** may be `1`, `2`, or `1–2`. Mechanism columns: **`_TBD_`**.

| # | Framework | Loop(s) | Disposition | TIED center of gravity | Evidence refs | vocabulary | intent_stack | change_analysis | implementation_proof | anti_drift | improvement_loop | sponsor_notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | DAE (Disciplined Agentic Engineering) | 1 | **Composable** | Gates, CRAP, closure patterns | [REQ-TIED_DAE_INCORPORATION](../../tied-project/requirements/REQ-TIED_DAE_INCORPORATION.yaml), [dae-mechanisms doc](dae-mechanisms-for-tied-improvement.md) | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| 2 | BBCE (Behavior-bounded change engineering) | 1 | **Composable** | Locality / slice discipline | [behavior-bounded-change-engineering.md](../../tied-project/vocab/behavior-bounded-change-engineering.md) | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| 3 | Residuality Theory | 1 | **Composable** | CITDP risk attach | [residuality.md](../../tied-project/vocab/residuality.md) | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| 4 | Adversarial inquiry | 1–2 | **Defer** | Fidelity-scoped; depth-tier activation | [fidelity-research.md](../../tied-project/vocab/fidelity-research.md) | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| 5 | GitHub Spec Kit / SDD | 1–2 | **Composable** | Feature orchestration defers to TIED stack | [tied-improvement-roadmap.md](../tied-improvement-roadmap.md) | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| 6 | ATDD (upstream heritage) | 1 | **Align** | Historical acceptance-test lineage; agentstream path | [agent-stream-ruby.md](../../tied-project/vocab/agent-stream-ruby.md) | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| 7 | Jev / System One | 1–2 | **Composable** | Advisory typed judgments | [jev-for-tied-improvement.md](jev-for-tied-improvement.md) | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| 8 | Trail-Code / Graft | 1 | **Composable** | Pre-read / impact discovery | [tied-vs-trail-code.md](tied-vs-trail-code.md) | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| 9 | LangGraph (EDS pattern) | 2 | **Composable** | Orchestration shell around evidence-driven steps | [langgraph-evidence-driven-software-engineering.md](../tools/langgraph-evidence-driven-software-engineering.md) | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| 10 | Brownfield intent elevation / OEE | 1 | **Composable** | Observed code → intent; operating-environment externalities | [brownfield-intent-elevation.md](../../tied-bundle/docs/brownfield-intent-elevation.md), [OEE doc](../tied-operating-environment-externalities.md) | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ |

---

## §3 — Sponsor fill-in checklist

1. **Mechanism cells** — For each row you accept, replace `_TBD_` with concrete TIED touchpoints (vocab files, PROC tokens, MCP tools). Do not imply ISO/CMMI certification or full method equivalence.
2. **Disputed dispositions** — Change disposition only with an updated source anchor in `evidence_refs` and a note in `sponsor_notes`; prefer **LEAP proposal** when the disagreement reflects product/methodology truth, not outreach wording only.
3. **New rows** — Add §1 rows only by splitting loop assignment explicitly; add §2 rows only for new adjacent frameworks with a primary REQ or vocab/doc anchor.
4. **When comparisons change** — Update this matrix when [qmm-kaizen-vs-tied.md](qmm-kaizen-vs-tied.md) or [tied-vs-well-known-methodologies.md](tied-vs-well-known-methodologies.md) dispositions change; run `tied_validate_consistency` after REQ/ARCH/IMPL edits.
5. **Promotion to tooling** — Generators, MCP resources, or `tied-bundle/` merges require a separate scoped REQ; v1 remains markdown-only per [ARCH-TIED_METHODOLOGY_COMPOSITION_MATRIX](../../tied-project/architecture-decisions/ARCH-TIED_METHODOLOGY_COMPOSITION_MATRIX.yaml).

---

## Related docs

- [tied-vs-well-known-methodologies.md](tied-vs-well-known-methodologies.md) — Delivery, engineering, and quality dispositions
- [qmm-kaizen-vs-tied.md](qmm-kaizen-vs-tied.md) — Primary QMM systems matrix and Loop 1–3 narrative
- [tied-project/working/REQ-TIED_METHODOLOGY_COMPOSITION_MATRIX/PLAN.md](../../tied-project/working/REQ-TIED_METHODOLOGY_COMPOSITION_MATRIX/PLAN.md) — Row-count contract and proof boundary
