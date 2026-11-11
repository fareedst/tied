# PLAN — REQ-TIED_PROJECT_SIZE_PROOF_FACET_INFERENCE

**Token:** `REQ-TIED_PROJECT_SIZE_PROOF_FACET_INFERENCE`  
**plan_phase:** `post-build`  
**Stack:** [REQ-TIED_TRIAL_PROOF_INTENT_STACK](../REQ-TIED_TRIAL_PROOF_INTENT_STACK/PLAN.md)  
**Taxonomy:** [proof-test-label-taxonomy.md](../REQ-TIED_TRIAL_PROOF_INTENT_STACK/evidence/proof-test-label-taxonomy.md)  
**Blocked until:** L1 **G1** + **G1b**

---

## Sponsor intent (locked)

Emit **machine-readable dissection** of client tests at `validator_version` **1.2.0**: `label_case_counts`, binding inference, optional `PROOF_LABEL` header application — without mutating L1 coarse `composition_tests` semantics.

---

## RESOLVE

| Term | Definition |
| --- | --- |
| **label_case_counts** | Map `proof_subtype` → summed test cases (node:test `it`/`test`) |
| **composition_inferred_cases** | Cases in files where structural heuristic = binding (may tag `composition.wiring` when path was `unit.default`) |
| **Override order** | Manifest (L3) > `PROOF_LABEL` header > path fine classify > `unit.default` |

When inference promotes a file to wiring, add cases to `composition.wiring` **and** increment `composition_inferred_cases` diagnostic counter (not `composition_tests`).

---

## Design

1. **`proof-facet-inference.ts`** — import graph heuristics (stack v1); subprocess flag → manifest tag hint in diagnostics only.
2. **Snapshot loop** — after case count: resolve final subtype; accumulate `label_case_counts`; invariant: sum(labels) = sum(four facets).
3. **`wf-trial-proof-inference.rules.yaml`** — `PROMPT-WF-09` / `PROMPT-WF-10` rules (subprocess supplementary).
4. **Compare render** — columns: `comp_declared`, `comp_inferred`, optional `lbl:integration`, `lbl:wiring`, `lbl:contract` (compact names behind `--fine-labels`).
5. **Receipt** — `validator_version` **1.2.0**; catalog documents pre-1.2.0 lacking `label_case_counts`.

---

## Acceptance criteria

| ID | Criterion |
| --- | --- |
| SC-INF-01 | Receipt includes `label_case_counts` matching taxonomy keys used in fixtures |
| SC-INF-02 | Sum invariant holds on WF-09 monolith + WF-10 medium fixtures |
| SC-INF-03 | `composition_tests` unchanged from path-only L1 rules (regression) |
| SC-INF-04 | `PROOF_LABEL` header overrides path when present (unit tests) |
| SC-INF-05 | Batch compare regen with fine-label flag documents new columns |
| SC-INF-06 | Facilitator `proof_inference_diagnostics[]` per file optional |

---

## Test strategy (summary)

- Golden receipts: WF-09 low (`unit.default` heavy), WF-10 medium (wiring/integration split).
- Unit: inference + label rollup invariant.
- Composition: MCP snapshot returns 1.2.0.

Full file: [test-strategy.md](test-strategy.md) at `@build-plan`.

---

## Sponsor G2

Review label histograms vs manual facilitator judgment before L3 schema freeze.

---

## Do next

`@build-plan` after L1 — stop at **G2**.
