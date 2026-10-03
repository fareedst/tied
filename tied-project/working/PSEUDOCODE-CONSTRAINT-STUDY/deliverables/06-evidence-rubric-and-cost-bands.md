# Evidence rubric and cost bands

**Study:** PSEUDOCODE-CONSTRAINT-STUDY  
**Scoring:** Qualitative 1–5 per criterion (not numeric precision). Weights from approved plan.

---

## Rubric criteria

| Criterion | Weight | Score 1 (poor) | Score 5 (strong) |
|-----------|--------|----------------|------------------|
| Feasibility with grammar v1 + optional extensions | 20% | Requires breaking v1 | Optional extensions only |
| Authoring burden | 15% | Heavy per-block annotation | Minimal optional hints |
| Diagnostic precision (expected) | 20% | High FP or FN | Fail-closed on proven violations only |
| Unknown disclosure quality | 15% | Silent gaps | Explicit unknowns with cause |
| Implementation complexity | 15% | XL band | S band |
| Layer B/C regression risk | 15% | Breaks existing gates | Additive, gated rollout |

---

## Scores — bounded typed-flow (design class A)

| Criterion | Weight | Score | Evidence |
|-----------|--------|-------|----------|
| Feasibility with v1 + optional extensions | 20% | **4** | Optional type clauses on contract rows; v1 sidecars parse unchanged; aligns with sponsor hard constraint |
| Authoring burden | 15% | **4** | Annotations optional; prose-only blocks remain valid with higher unknown rate |
| Diagnostic precision (expected) | 20% | **3** | Proven errors on structured code; legacy prose stays unknown — moderate precision ceiling |
| Unknown disclosure quality | 15% | **5** | Extends existing `unknowns[]` policy; no silent success |
| Implementation complexity | 15% | **3** | M band — expression parser + CFG join + type env (not trivial S) |
| Layer B/C regression risk | 15% | **4** | Additive analyzer pass/section; phased `gate_mode` optional for typed rules |

**Weighted qualitative summary:** ~3.7 / 5 — favorable incremental path.

---

## Scores — full constraint-language (design class B)

| Criterion | Weight | Score | Evidence |
|-----------|--------|-------|----------|
| Feasibility with v1 + optional extensions | 20% | **2** | Effectively requires grammar v2+ and migration; conflicts with default v1 hard constraint unless explicit version boundary accepted |
| Authoring burden | 15% | **1** | Heavy signatures/refinements per block; retraining cost high |
| Diagnostic precision (expected) | 20% | **5** | Highest ceiling when fully authored |
| Unknown disclosure quality | 15% | **4** | Good if solver budgets disclose truncation; risk of complexity hiding gaps |
| Implementation complexity | 15% | **1** | XL band — solver, summaries, refinements |
| Layer B/C regression risk | 15% | **2** | New SHAPE rules, gate failures on legacy until corpus matures |

**Weighted qualitative summary:** ~2.5 / 5 — high cost, high precision ceiling, poor fit for optional adoption.

---

## Cost bands (complexity drivers, not person-days)

| Subsystem | Bounded typed-flow (A) | Full constraint-language (B) |
|-----------|------------------------|------------------------------|
| Grammar / migration | **S** — optional annotation syntax doc + v1 compat | **L** — v2 spec, migration tooling, template updates |
| Parser / IR | **M** — expression AST, type tags, fact lattice | **L–XL** — refinements, summaries, solver IR |
| Analyzer | **M** — CFG transfer/join, local CALL typing | **XL** — fixed-point interproc solver |
| Report schema | **S** — v2 section or extended diagnostics | **M** — new sections, solver metadata |
| Docs / authoring guides | **M** — grammar v1 extension guide, examples | **L** — full constraint authoring course |
| Test corpus (future) | **M** — ~12–24 fixtures | **L–XL** — 40+ fixtures + solver regressions |
| **Overall** | **M** | **L–XL** |

Band key: **S** < 2 engineer-months equivalent complexity · **M** · **L** · **XL**

---

## CPU / memory relation to DEFAULT_BUDGETS

Current budgets (`max_fixed_point_iterations: 32`, `max_path_conditions: 64`, etc.) suffice for today's linear abstract pass.

| Design | Budget impact |
|--------|---------------|
| Bounded typed-flow | Moderate: CFG join per block within `max_cfg_blocks_per_procedure`; may need raised `max_fixed_point_iterations` for loop widen |
| Full constraints | High: new limits for solver steps, summary cache, predicate depth |

---

## False positive / false negative tradeoffs

| Design | FP risk | FN risk | Unknown rate |
|--------|---------|---------|--------------|
| Bounded typed-flow | Low on proven structured violations | Moderate on under-annotated legacy | Higher by design (explicit) |
| Full constraints | Higher until corpus mature | Lower when fully annotated | Lower when authored; higher migration pain |

---

## Adoption rubric threshold (study)

Proceed to pilot when:

- Feasibility score ≥ 3 on bounded design **and**
- Overall bounded score exceeds full by ≥ 1 point weighted **and**
- Sponsor accepts M-band cost and optional annotation authoring model

**Study result:** Threshold met for bounded typed-flow pilot; not met for full constraint-language as first investment.
