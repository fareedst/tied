# Go/No-Go — Pseudocode typed constraint adoption

**Study:** PSEUDOCODE-CONSTRAINT-STUDY  
**Date:** 2026-09-09  
**Anchor:** commit `7f3d5b0`

---

## Decision (choose one)

- [x] **Adopt bounded typed-flow first (pilot recommended: yes)**
- [ ] Invest in full constraint-language (defer bounded: yes/no)
- [ ] Defer all typed constraints
- [ ] Run measured pilot before TIED feature authoring

*Note: Selected option combines "bounded first" with explicit measured pilot before REQ/ARCH/IMPL — pilot is the immediate next step, not production adoption.*

---

## Evidence summary

- **Baseline proof boundary:** Layer C proves grammar-v1 structure, symbols, CFG, call graph, and heuristic abstract facts within budgets — not typed data-flow. Contract values are prose; abstract pass ignores CFG joins (`01-baseline`).
- **Capability matrix highlights:** Zero reliable typed data-flow checks today; all strict validation rows require typed syntax (`05-capability-matrix`).
- **Rubric scores:** Bounded **~3.7/5** weighted qualitative · Full **~2.5/5** (`06-evidence-rubric`).
- **Cost bands:** Bounded **M** overall · Full **L–XL** (`06-evidence-rubric`).

---

## Primary questions answered

1. **Is reliable data-flow validation feasible with current format + Layer C?**  
   **No** for reliable typed validation. Current pipeline supports characterization only. Feasibility requires bounded typed-flow (minimum) with expression IR and CFG join.

2. **Relative cost/outcome bands bounded vs full?**  
   Bounded: **M** cost, moderate precision, low regression risk, v1-compatible. Full: **L–XL** cost, high precision ceiling, high authoring burden, migration risk.

---

## Adoption criteria met?

| Criterion | Met? | Evidence pointer |
|-----------|------|------------------|
| Baseline accurately documented | Yes | `01-baseline-capability-and-proof-boundary.md` |
| Design comparison symmetric | Yes | `02-design-class-comparison.md` |
| Claim taxonomy complete | Yes | `03-dataflow-claim-taxonomy.md` |
| Corpus spec ≥12 categories (design only) | Yes | `04-corpus-and-measurement-spec.md` |
| Capability matrix tri-class | Yes | `05-capability-matrix.md` |
| Rubric + cost bands | Yes | `06-evidence-rubric-and-cost-bands.md` |
| Grammar v1 backward compatibility respected | Yes | Bounded design optional extensions; full deferred |
| Sponsor review | **Approved** | Sign-off below (2026-09-10) |

---

## Required follow-on artifacts (if proceeding)

- [x] Separate approved **feature plan** (`plan-new-feature`) with REQ/ARCH/IMPL for bounded typed-flow pilot — `[REQ-PSEUDOCODE_TYPED_FLOW]` shipped (`c28211f`, Phase 3 `9438d1f`)
- [x] Grammar extension spec (v1-compatible optional annotations) or explicit v2 boundary document — `tied/docs/pseudocode-grammar.v1-typed-flow-extension.md`
- [x] Corpus fixtures + analyzer tests (12+ labeled cases from `04-corpus`) — 28 fixtures under `mcp-server/src/analysis/fixtures/typed-flow/`
- [x] Doc updates: `pseudocode-grammar.v1.md`, writing guide, static-analysis checklist rows — PSA-TYPED-001..004 rows; grammar extension doc
- [x] Measured pilot report: precision/recall/unknown-rate on prototype — `working/REQ-PSEUDOCODE_TYPED_FLOW/pilot-measurement-report.md`, `phase3-measurement-report.md`

**Do not proceed:** Full constraint-language investment until bounded pilot completes and unknown rate / authoring cost measured.

---

## Residual risks and open questions

| Risk | Mitigation |
|------|------------|
| Authors skip optional types → persistent unknown rate | Pilot metrics; checklist nudges for changed Active blocks |
| CFG join complexity underestimated | Start intraprocedural only; defer interproc summaries |
| Layer C gate churn | Feature-flag typed rules; don't enable in `gate_mode` until corpus green |
| Scope creep to full constraint-language | Separate REQ token; go/no-go gate after pilot |
| Baseline drift post-study | Re-anchor baseline audit if analysis modules change before pilot |

**Open questions for sponsor:**

- Accept optional `: type` syntax on contract rows vs separate `Types:` block?
- Pilot scope: analyzer-only prototype or MCP-exposed from day one?
- Gate policy for typed diagnostics: warnings first vs errors under `gate_mode`?

---

## Sponsor sign-off

- **Decision:** Adopt bounded typed-flow first; measured pilot complete; proceed to scoped Phase 3 typed gate errors on annotated procedures only; defer full constraint-language, grammar v2, interprocedural solver, and global production auto-enablement.
- **Date:** 2026-09-10
- **Evidence:** qualification harness (124 entries, 0 new gate failures), F11 annotation study (median 2.5 lines), pilot + Phase 3 measurement reports, `[REQ-PSEUDOCODE_TYPED_FLOW]` status **Implemented**.
