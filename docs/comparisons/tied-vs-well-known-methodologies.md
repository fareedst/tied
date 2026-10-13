# TIED × well-known methodologies — scope and abilities

| Field | Value |
| --- | --- |
| **Purpose** | Sponsor-facing `/xlate`: what TIED is for, what it can do, and how it relates to widely used delivery, engineering, and quality methodologies—without treating TIED as “Agile vs Waterfall.” |
| **Audience** | Sponsors, engineers, agent operators, methodology owners |
| **TIED anchors** | [Client development index](../../tied-bundle/docs/client-development-index.md), [Vocabulary layer × TIED × LEAP × CITDP](../../tied-bundle/docs/vocabulary-layer-tied-leap-citdp.md), [LEAP](../../tied-bundle/docs/LEAP.md), [processes](../../tied-bundle/docs/processes.md), [AGENTS.md](../../AGENTS.md) |
| **Sibling comparison** | [QMM (Kaizen & quality management) × TIED](qmm-kaizen-vs-tied.md) — deeper Loop 1–3 disposition matrix and QMM-specific gaps |
| **Status** | Outreach / analysis document; does not mint REQ/ARCH/IMPL tokens |
| **Last updated** | 2026-10-10 |

---

## Executive summary

**TIED** is a **documentation-first, token-linked engineering discipline** for building software (especially with AI agents): shared **vocabulary** → frozen **intent** (REQ → ARCH → IMPL pseudo-code) → strict **test order** → code, with **LEAP** to pull discoveries back into the spec stack and **CITDP** to analyze changes before implementation commits to them.

It is **not** a company-wide program framework (no sprint calendar, no PI planning, no certification). It is the **traceability and implementation spine** inside a repository, composable with whatever organizational process you already use.

The repository’s QMM comparison states the relationship plainly: **compose, don’t replace**—classic QMM does not replace TIED’s token graph, LEAP, or gates; TIED does not fully stand in for ISO certification, CMMI appraisal, DORA dashboards, or SPC control charts.

---

## What TIED methodology includes (four pieces)

| Piece | Job | Familiar analogy |
| --- | --- | --- |
| **Vocabulary** | One preferred term per concept; RESOLVE before specs | Strong glossary + naming bridges (UI ↔ YAML ↔ code)—not an OWL ontology |
| **TIED stack** | REQ (what/why) → ARCH (structural how) → IMPL + `essence_pseudocode` (operational how) → tests → code, linked by `[REQ-*]` / `[ARCH-*]` / `[IMPL-*]` | Requirements + ADRs + executable design spec, machine-checkable |
| **CITDP** | Change impact, risks, test strategy before/during implementation | Lightweight change record + test design procedure (not full DMAIC) |
| **LEAP** | When code/tests disagree with docs: update **IMPL first**, then ARCH/REQ if scope changed | Anti-drift: logic elevated out of source into pseudo-code |

**Center of gravity:** a **semantic database in YAML** plus checklists, MCP tools, and verification—not a cultural transformation program by itself.

See [vocabulary-layer-tied-leap-citdp.md](../../tied-bundle/docs/vocabulary-layer-tied-leap-citdp.md) for how the four layers compose (vocabulary does not replace REQ; LEAP does not establish new requirements).

---

## Three nested loops (QMM frame)

From [qmm-kaizen-vs-tied.md](qmm-kaizen-vs-tied.md):

| Loop | Question | TIED strength |
| --- | --- | --- |
| **1 — Product quality** | Does the product meet intent? | **Strong:** LEAP, mandatory TDD order (unit → composition → justified E2E), module validation, token traceability |
| **2 — Process improvement** | Does the *way we work* get better? | **Partial / growing:** Kaizen-style feedback (operational observation → countermeasure → outcome vs baseline); not Scrum |
| **3 — Methodology learning** | Do our *rules* improve with evidence? | **Improving:** methodology PDSA experiments, cohort evidence, gate enrollment ([QMM program plan](../tied-qmm-methodology-learning-plan.md)); still **no SPC control charts** in core |

---

## Delivery and team process (organizational layer)

| Methodology | What it optimizes | TIED relationship |
| --- | --- | --- |
| **Waterfall** | Fixed phases, big upfront design | TIED is **documentation-first** but **not** phase-gated handoffs; specs are living YAML + pseudo-code synced via LEAP—not frozen binders. Teams can still ship iteratively. |
| **Agile (manifesto)** | Individuals, working software, responding to change | TIED **aligns on working software + change** through **traceable specs and tests**, not user stories alone. No standups or “Agile coach” role in the method. |
| **Scrum** | Timeboxed sprints, roles, events, increment | **Defer:** empiricism appears as checklist + gates + LEAP, **without** Scrum Master, sprint metrics, or ceremony canon. |
| **Kanban** | Flow, WIP limits | **Not specified** in TIED; Kanban can run on top. TIED cares *what* is done per change item (REQ/CITDP), not board columns. |
| **SAFe / LeSS / Nexus** | Portfolio / multi-team scaling | **Out of scope** unless a client adds its own REQ; TIED is **single-repo / single-product traceability**, not train-level planning. |

---

## Engineering practices (team layer)

| Methodology | What it optimizes | TIED relationship |
| --- | --- | --- |
| **XP** | Technical excellence, TDD, integration, refactoring | **Align:** TDD ordering, composition tests, LEAP when implementation teaches the spec something new. |
| **TDD / ATDD** | Tests drive design | **Align and tighten:** tests trace to IMPL blocks and tokens; **strict RED before production code** after pseudo-code is authoritative. |
| **BDD (Gherkin)** | Behavior examples for stakeholders | **Composable:** acceptance criteria can reference vocab; authoritative behavior spec is **IMPL pseudo-code**, not `.feature` files alone—four-way closure tooling can join criteria ↔ blocks ↔ tests where enabled. |
| **DevOps / CI/CD** | Build, deploy, pipeline | **Defer to client:** pipelines are not TIED index fields; TIED validates methodology + project YAML + tests, not deployment frequency. |
| **DORA metrics** | Lead time, deploy frequency, MTTR, change fail rate | **Explicitly deferred** to client ops/CI unless a future REQ scopes ingestion. |

---

## Quality and improvement systems (enterprise layer)

| System | What it optimizes | TIED relationship |
| --- | --- | --- |
| **TQM** | Quality across the whole work system | **Align (scoped):** quality as property of the **agent + TIED production system**, not a final inspection gate—within methodology + project artifacts, not enterprise-wide TQM. |
| **PDCA / PDSA** | Hypothesis → experiment → learn | **Tension → improving:** strong in feature CITDP and Kaizen; methodology rule changes increasingly follow **uniform PDSA** (see QMM program). |
| **Lean / Kaizen** | Waste removal, small continuous improvements | **Align:** operational observations, countermeasures, outcome vs baseline, anti-churn principles ([feedback-to-tied](../../tied-project/vocab/feedback-to-tied.md)). |
| **Six Sigma / DMAIC** | Defect reduction, statistical projects | **Defer:** adversarial inquiry + CITDP for **selected** high-risk changes—not org-wide DMAIC. |
| **SPC** | Common vs special cause variation | **Concept align, tooling gap:** proof boundaries, denominators, `inconclusive`—**no control charts** in TIED core. |
| **ISO 9001-shaped QMS** | Auditable process + records | **Align (shape, not cert):** gates, manifests, committed vs ephemeral working folders—QMS-**like** traceability, not certification. |
| **CMMI L4–5** | Quantitative / optimizing process | **Partial gap:** cohort evidence-chain statistics are fragments, not maturity levels. |
| **SRE** | SLOs, error budgets, toil | **Tension:** residual risk, waivers, reliability rows in assurance matrix—**not** product SLO/error-budget semantics in core. |

For disposition definitions and the full QMM systems matrix, see [qmm-kaizen-vs-tied.md](qmm-kaizen-vs-tied.md) § Primary QMM systems matrix.

---

## What TIED is uniquely built to do

Most popular methodologies **do not standardize** these at the same depth:

1. **Machine-oriented traceability graph** — REQ/ARCH/IMPL indexes, detail YAML, `semantic-tokens.yaml`, validation (`tied_validate_consistency`), not only trace matrices in spreadsheets.

2. **IMPL `essence_pseudocode` as the logical source of truth** — LEAP elevates behavior **out of scattered source files** so humans and agents design from a bounded spec set ([LEAP.md](../../tied-bundle/docs/LEAP.md)).

3. **Three-way alignment** — Same token comments and vocabulary on pseudo-code blocks, tests, and code.

4. **AI-agent operating system** — `AGENTS.md`, vocabulary PRELOAD/RESOLVE/RECORD/VALIDATE, MCP-first YAML writes, checklist slugs, optional `tied agentstream`.

5. **Risk-tiered quality evidence** — Assurance profiles, proof boundaries, adversarial inquiry at depth tiers—beyond a story-card “definition of done.”

6. **Methodology vs project split** — Inherited `tied-bundle/` (read-only) + writable `tied-project/` so product teams do not fork the method accidentally.

---

## Practical “when to use what”

| Your need | Reach for… | TIED’s role |
| --- | --- | --- |
| Sprint planning, stakeholders, prioritization | Scrum / Kanban / product ops | TIED does not replace; use REQ tokens as **done-when** for slices |
| How we write and prove code | XP / TDD | TIED **codifies and enforces** order + traceability |
| Big change blast radius | Architecture review + test plan | **CITDP** + ARCH/IMPL updates |
| Docs drifted from reality | Often weak in pure Agile | **LEAP** (IMPL-first back-propagation) |
| Enterprise QMS / CMMI audit | ISO / CMMI programs | TIED gives **audit-shaped artifacts** in-repo; not org certification |
| Proving the *method itself* improves outcomes | Deming / PDSA / SPC | **Loop 3** (methodology experiments, cohort export)—see [QMM program](../tied-qmm-methodology-learning-plan.md) |

---

## Bottom line for sponsors

- **TIED ≈** rigorous **spec + test + traceability methodology** optimized for **human–agent co-development**, with **change analysis (CITDP)** and **anti-drift sync (LEAP)**.
- **TIED ≠** replacement for **Scrum**, **SAFe**, **DORA dashboards**, **Six Sigma**, or **ISO certification**.
- **Best mental model:** keep your org’s delivery framework; use TIED as the **engineering truth layer** where intent, design, pseudo-code, tests, and code stay linked—and where improvement of *those rules* is increasingly treated like experiments, not ad-hoc checklist edits.

---

## Related docs

- [methodology-composition-matrix.md](methodology-composition-matrix.md) — Detailed **loop × method** matrix with sponsor-owned TIED mechanism columns (§1 **27** / §2 **10** rows)
- [qmm-kaizen-vs-tied.md](qmm-kaizen-vs-tied.md) — QMM × TIED deep comparison (loops, dispositions, gaps)
- [tied-qmm-methodology-learning-plan.md](../tied-qmm-methodology-learning-plan.md) — Loop 3 program (closed 2026-10-10)
- [client-development-index.md](../../tied-bundle/docs/client-development-index.md) — Core seven and scenario entry points
- [methodology-diagrams.md](../../tied-bundle/docs/methodology-diagrams.md) — Stack, LEAP, TDD, CITDP visuals
- [jev-for-tied-improvement.md](jev-for-tied-improvement.md) — Sibling comparison (decision coprocessor × TIED)
