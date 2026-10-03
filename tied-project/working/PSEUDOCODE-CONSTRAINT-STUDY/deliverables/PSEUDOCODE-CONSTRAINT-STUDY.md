# Pseudocode Constraint Decision Study

**Request label:** PSEUDOCODE-CONSTRAINT-STUDY  
**Type:** Read-only decision study (no code, TIED, or grammar changes)  
**Anchor commit:** `7f3d5b0` (2026-09-09) — identical to current `main`  
**Governance:** `depth_tier: minimal` · `gate_policy: advisory` · CITDP deferred · checklist gate N/A

---

## 1. Executive summary

This study compares **bounded typed-flow** (optional type/shape annotations + CFG-based transfer/join) with a **full constraint-language** (refinements, interprocedural solver) for pseudo-code static analysis.

### Primary question 1 — Feasibility with current format and Layer C

**Is reliable data-flow validation feasible today?**  
**No.** Layer C at `7f3d5b0` delivers parse, symbols, CFG, call graph, linear abstract heuristics, and obligation **characterization**. Assignment values, conditions, and contract field bodies are **opaque strings** in IR. The abstract pass walks statements linearly and **does not join facts on CFG merge points**. PRE/POST presence is checked; PRE/POST **content is not solved**.

Reliable typed data-flow validation requires new syntax (structured expressions, optional type tags) and analyzer semantics (CFG transfer/join, type environment) — i.e. bounded typed-flow at minimum.

### Primary question 2 — Cost/outcome bands

| Design class | Overall cost band | Precision ceiling | Authoring burden | v1 compatibility |
|--------------|-------------------|-------------------|------------------|------------------|
| **Bounded typed-flow** | **M** | Moderate (proven errors on structured code; unknown on legacy prose) | Low–moderate (optional hints) | Yes (optional extensions) |
| **Full constraint-language** | **L–XL** | High (when fully annotated) | High (mandatory refinements) | Requires v2 migration path |

**Recommendation:** **Adopt bounded typed-flow first** via a **measured pilot** before any TIED REQ/ARCH/IMPL authoring. **Defer** full constraint-language until pilot metrics (unknown rate, authoring overhead, precision/recall on 12-case corpus) are reviewed.

---

## 2. Baseline findings

See [01-baseline-capability-and-proof-boundary.md](./01-baseline-capability-and-proof-boundary.md).

| Layer | Tool | Data-flow relevance |
|-------|------|---------------------|
| A | `tied_validate_consistency` | Token/traceability only |
| B | `pseudocode_validate` | Contract shape, not data-flow |
| C | `pseudocode_analyze` | CFG built; abstract heuristics only |

**Proof boundary:** *Deterministic static analysis within grammar and budgets; not runtime, tests, or complete behavioral verification.*

**Key code facts:**

- IR: `IrAssignment.value`, `IrIf.condition` are strings (`pseudocode-ir.ts`)
- Abstract: linear `env` map; `_cfg` unused (`pseudocode-abstract-analysis.ts`)
- Symbols: CALL has no argument IR (`pseudocode-parser.ts` `CALL_RE`)

---

## 3. Design comparison

See [02-design-class-comparison.md](./02-design-class-comparison.md).

Bounded typed-flow extends existing CFG infrastructure with optional annotations. Full constraint-language replaces prose contracts with a solver-backed predicate language — disproportionate cost for current author practices and proof boundary.

**Sponsor defaults applied:** grammar v1 backward compatibility is a **hard constraint**; authoring burden and diagnostic precision reported **without weighting**.

---

## 4. Data-flow claim taxonomy

See [03-dataflow-claim-taxonomy.md](./03-dataflow-claim-taxonomy.md).

**Outcomes:** definite error · conservative warning · **unknown** · non-claim.

**Permanent exclusions:** runtime truth, unmodeled aliasing, opaque NL conditions, complete path coverage, behavioral proof.

---

## 5. Capability matrix

See [05-capability-matrix.md](./05-capability-matrix.md).

Today: structural/heuristic characterization only.  
Typed syntax required: all strict data-flow validation checks.  
Outside boundary: RUN/external, runtime, full path coverage.

---

## 6. Corpus and measurement (design only)

See [04-corpus-and-measurement-spec.md](./04-corpus-and-measurement-spec.md).

12 labeled categories specified (scalar mismatch, nullable flow, shapes, branch join, loop, CALL, mutation, external, opaque condition, alias, refinement). No fixtures added in this study.

---

## 7. Rubric and cost bands

See [06-evidence-rubric-and-cost-bands.md](./06-evidence-rubric-and-cost-bands.md).

| Design | Weighted rubric (qualitative) |
|--------|-------------------------------|
| Bounded typed-flow | ~3.7 / 5 |
| Full constraint-language | ~2.5 / 5 |

---

## 8. Recommendation and go/no-go

See [07-go-no-go-decision-record.md](./07-go-no-go-decision-record.md).

**Decision:** Bounded typed-flow first + **measured pilot** before TIED feature plan. Full constraint-language deferred.

**Next step:** Complete — sponsor signed off 2026-09-10; `[REQ-PSEUDOCODE_TYPED_FLOW]` pilot + Phase 3 shipped. Full constraint-language remains deferred.

---

## 9. Future-impact inventory

If pilot succeeds, likely touch surfaces (from approved plan):

| Surface | Likely changes |
|---------|----------------|
| Analysis engine | Expression parser, type env, CFG join/transfer |
| MCP tools | Report schema v2, optional analyze flags |
| Tests | 12+ corpus fixtures, gate_mode regression |
| Docs | Grammar extension, checklist rows, template examples |
| TIED stack | New REQ/ARCH/IMPL via separate feature plan only |

---

## 10. Study artifacts

| # | Deliverable |
|---|-------------|
| 01 | [Baseline capability and proof boundary](./01-baseline-capability-and-proof-boundary.md) |
| 02 | [Design class comparison](./02-design-class-comparison.md) |
| 03 | [Data-flow claim taxonomy](./03-dataflow-claim-taxonomy.md) |
| 04 | [Corpus and measurement spec](./04-corpus-and-measurement-spec.md) |
| 05 | [Capability matrix](./05-capability-matrix.md) |
| 06 | [Evidence rubric and cost bands](./06-evidence-rubric-and-cost-bands.md) |
| 07 | [Go/no-go decision record](./07-go-no-go-decision-record.md) |
| — | This assembled study |

**Tracker:** `working/PSEUDOCODE-CONSTRAINT-STUDY/agent-req-implementation-checklist_STUDY_20260909.yaml`  
**CITDP:** deferred (read-only study)

---

## Canonical guideline gaps identified

1. No author guidance for when Layer C heuristics vs unknown apply to assignment/condition strings.
2. PRE/POST documented as contract precision (Layer B) but not distinguished from checkable predicates (Layer C gap).
3. Grammar v1 doc does not state that CFG facts are not joined in abstract pass — authors may over-estimate analyzer proof.
4. No optional type annotation pattern exists for INPUT/DATA rows.
5. Checklist PSA rows do not distinguish characterization obligations from data-flow proof.

These are documentation/spec gaps only — no edits made in this study.
