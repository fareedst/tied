# Pilot measurement report — bounded typed-flow

**REQ:** `[REQ-PSEUDOCODE_TYPED_FLOW]`  
**Date:** 2026-09-10  
**Baseline anchor:** commit `7f3d5b0`  
**Study parent:** [PSEUDOCODE-CONSTRAINT-STUDY](../PSEUDOCODE-CONSTRAINT-STUDY/deliverables/PSEUDOCODE-CONSTRAINT-STUDY.md)

---

## Executive recommendation

**Proceed** to optional Phase 3 sponsor review for production typed gate errors — **not** auto-enabled.

Bounded typed-flow pilot met automated F1–F10 and F12 thresholds, zero new client gate failures, and passed the F11 authoring burden gate. Typed diagnostics remain warnings under `gate_mode: true` during pilot.

---

## Implementation summary

| Deliverable | Status |
|-------------|--------|
| Core modules (`expression-parser`, `typed-ir`, `typed-flow`) | Shipped |
| Parser extensions (CALL args, `contract.values`, F1b) | Shipped |
| MCP `typed_flow` flag + `sections.typed_flow` | Shipped (report v1 extension) |
| Corpus fixtures 1–17 | Shipped |
| Qualification harness | Shipped |
| `pseudocode-shared.ts` edits (D13) | None |

**Tests:** `cd mcp-server && npm test` → **626 pass / 0 fail**

---

## Synthetic corpus (F1–F12)

| Factor | Criterion | Result |
|--------|-----------|--------|
| F1 | All fixtures parse | PASS (17/17) |
| F1b | Mixed typed+prose contract rows retained | PASS (case 13) |
| F2 | Branch join incompatible | PASS (case 05) |
| F3 | Nullable — negative + positive (16) | PASS |
| F4 | Scalar type mismatch | PASS (case 01) |
| F5 | Shape mismatch | PASS (cases 03–04) |
| F6 | CALL — negative + positive (15) | PASS |
| F7 | Unknown disclosure cases 09–11 | PASS (100%) |
| F8 | Legacy byte-identical with `typed_flow: false` | PASS |
| F9 | Deterministic report serialization | PASS |
| F10 | Zero `budget_exceeded` on 1–17 at default budgets | PASS |
| F11 | Authoring burden gate | PASS (see below) |
| F12 | 100% recall definite-error cases 01–05, 07 | PASS |

Corpus root: `mcp-server/src/analysis/fixtures/typed-flow/`

---

## Client qualification (Tier A/B/C/D)

Source: `working/PSEUDOCODE-CONSTRAINT-STUDY/qualification/metrics/summary.json`

| Metric | Value |
|--------|-------|
| Manifest entries | 124 |
| Parse success | 124/124 |
| Baseline gate pass (`typed_flow: false`) | 96/124 |
| Pilot gate pass (`typed_flow: true`) | 96/124 |
| Regression unchanged vs baseline | 124/124 |
| **New gate failures** | **0** |
| Snapshot drift (A/B) | 0 |

| Tier | Result |
|------|--------|
| A — Production panel | PASS |
| B — stdd project sidecars | PASS |
| C — Smoke sample | PASS (report-only) |
| D — Stress (`tied-win-diff`) | Optional (pre-existing failures only) |

---

## F11 authoring burden study

Source: `working/PSEUDOCODE-CONSTRAINT-STUDY/qualification/metrics/annotation-overhead.yaml`

| Metric | Value | Stop threshold |
|--------|-------|----------------|
| Procedures studied | 4 (Tier A copies) | 3–5 |
| Annotation lines median | **2.5** | ≤ 8 |
| Authoring decisions median | **2.5** | ≤ 15 |
| Semantic preservation (SP-1..SP-7) | 4/4 PASS | any fail → revise |

**F11 gate:** PASS — recommendation **proceed**

---

## Precision / recall / unknowns (pilot scope)

- **Recall (F12):** 100% on labeled definite-error synthetic cases (01–05, 07).
- **Precision:** Bounded by positive controls (cases 15–16); no systematic FP on compatible CALL/nullable paths in corpus.
- **Unknown rate:** High on prose-only production sidecars (expected); typed pass emits `unknowns[]` with causes rather than false errors.
- **Tier A unknown rate:** Documented in per-entry pilot reports; no numeric hard fail in pilot.

---

## Phase 3 gate disposition (sponsor)

| Option | Recommendation |
|--------|----------------|
| Enable typed errors under `gate_mode: true` | **Defer** — requires sponsor review of this report |
| Keep warnings-only typed diagnostics | **Current default** |
| Expand corpus beyond 17 | Optional follow-on |
| Full constraint-language / grammar v2 | **Out of scope** — separate REQ |

---

## Residual risks

| Risk | Status |
|------|--------|
| Prose-only sidecars yield high unknown rate | Accepted by design (Tier-2 optional) |
| Interprocedural CALL typing | Deferred (local slot matching only) |
| Immutability / alias / refinement | Unknown by policy; cases 8, 11, 12 |
| Production panel retrofit burden | F11 median 2.5 lines — low for selective annotation |

---

## Evidence index

- Qualification: `working/PSEUDOCODE-CONSTRAINT-STUDY/qualification/`
- CITDP: `tied/citdp/CITDP-REQ-PSEUDOCODE_TYPED_FLOW.yaml`
- Grammar extension: `tied/docs/pseudocode-grammar.v1-typed-flow-extension.md`
- IMPL sidecar: `tied/implementation-decisions/IMPL-PSEUDOCODE_TYPED_FLOW-pseudocode.md`
- Adversarial inquiry: `working/REQ-PSEUDOCODE_TYPED_FLOW/adversarial-inquiry/`
