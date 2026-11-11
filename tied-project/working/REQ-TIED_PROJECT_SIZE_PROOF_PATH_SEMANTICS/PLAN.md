# PLAN — REQ-TIED_PROJECT_SIZE_PROOF_PATH_SEMANTICS

**Token:** `REQ-TIED_PROJECT_SIZE_PROOF_PATH_SEMANTICS`  
**Track:** stack refine → **`@build-plan`** → sponsor **G1** / **G1b** → L2  
**Parent stack:** [REQ-TIED_TRIAL_PROOF_INTENT_STACK](../REQ-TIED_TRIAL_PROOF_INTENT_STACK/PLAN.md)  
**Taxonomy:** [proof-test-label-taxonomy.md](../REQ-TIED_TRIAL_PROOF_INTENT_STACK/evidence/proof-test-label-taxonomy.md)  
**Depends on:** [REQ-TIED_PROJECT_SIZE_PROOF_FACET_TEST_CASES](../REQ-TIED_PROJECT_SIZE_PROOF_FACET_TEST_CASES/PLAN.md) (`validator_version` **1.1.0**)  
**plan_phase:** `post-build`

---

## Sponsor intent (locked)

Path-declared **coarse facets** stay at receipt keys **1.1.0**; introduce **`classifyTestFileFine`** so the TIED store can derive **`proof_subtype`** from paths before L2 emits `label_case_counts`.

**L1 does not** emit `label_case_counts` on receipts (L2 / **1.2.0**). L1 **does** centralize path→subtype rules and agent naming so L2/L3 share one enum.

---

## RESOLVE

| Term | Definition |
| --- | --- |
| **proof_facet** | Coarse tier: `unit` \| `composition` \| `e2e` \| `binding_inventory` → existing receipt sums |
| **proof_subtype** | Fine label from taxonomy (e.g. `composition.integration`) |
| **classifyTestFileFine** | Pure function `(relPath) → { facet, subtype }`; used in snapshot loop internally; exposed in diagnostics JSON in L2 |
| **PROOF_LABEL** | `// PROOF_LABEL: composition.integration` — parsed L2+; L1 documents + regex contract test only |
| **PROOF_KIND** (legacy) | `unit\|composition\|binding-inventory\|e2e` → facet only |

---

## Design

### 1. Classifier split

- **`classifyTestFile`** — unchanged behavior contract for four facet buckets (LEAP from 1.1.0).
- **`classifyTestFileFine`** — new module or same file; precedence: binding-inventory path → e2e → composition variants → unit.default.

| Path pattern | facet | subtype |
| --- | --- | --- |
| `binding-inventory` / `binding_inventory` | binding_inventory | binding_inventory.table |
| `.e2e.test.ts` / `e2e` substring | e2e | e2e.ui |
| `.contract.test.ts` | composition | composition.contract |
| `.binding.test.ts` | composition | composition.wiring |
| `.integration.test.ts` | composition | composition.integration |
| `.composition.test.ts` / `composition` substring | composition | composition.general |
| default `src/**/*.test.ts` | unit | unit.default |

### 2. Registry + catalog

Document coarse vs fine; link taxonomy doc; list all suffixes.

### 3. Skills

[`wf-trial-proof-naming-adjunct.md`](../../../tools/bundled-prompt-type-skills/prompt-shared/wf-trial-proof-naming-adjunct.md) — copy naming table from taxonomy; require subtype-appropriate suffix when agent adds composition-class tests.

### 4. Vocab RECORD

[`tied-project/vocab/tied-methodology.md`](../../vocab/tied-methodology.md): `proof_facet`, `proof_subtype`, pointer to taxonomy.

---

## Acceptance criteria

| ID | Criterion |
| --- | --- |
| SC-PPS-01 | `.integration`, `.binding`, `.contract` → composition facet; correct subtype from fine classifier |
| SC-PPS-02 | Colocated `src/cli.test.ts` → `unit.default` |
| SC-PPS-03 | Catalog + registry distinguish coarse receipt keys vs fine subtypes (L2 field named) |
| SC-PPS-04 | `PROOF_LABEL` + legacy `PROOF_KIND` documented; contract tests (no receipt subtype until L2) |
| SC-PPS-05 | WF naming adjunct references taxonomy |
| SC-PPS-06 | `classifyTestFileFine` unit-tested in isolation; snapshot still 1.1.0 facets only |
| SC-PPS-07 | `tied_validate_consistency` ok after R+A+I enroll |

---

## Build sequence (`@build-plan`)

| Step | Deliverable |
| --- | --- |
| 1 | R+A+I enroll; cross-ref stack + taxonomy path |
| 2 | IMPL pseudo-code: `CLASSIFY_TEST_FILE_FINE` block |
| 3 | RED: `proof-test-classify.ts` (or snapshot module) + fixtures per subtype |
| 4 | LEAP snapshot pseudo-code; **facet** loop unchanged at 1.1.0 |
| 5 | Registry, catalog, vocab, adjunct |
| 6 | `evidence/g1-sponsor-checkpoint.md` + `g1b-subtype-enum-ack.md` stub |

---

## Sponsor checkpoints

- **G1:** Coarse suffix map + `comp` = path-declared only.
- **G1b:** Approve taxonomy enum (no renames after L2 without LEAP).

---

## Out of scope (L1)

- `label_case_counts` on receipt  
- Manifest overrides  
- Header affecting live snapshot  

---

## Do next

**`@build-plan`** — then **G1** / **G1b** before [L2](../REQ-TIED_PROJECT_SIZE_PROOF_FACET_INFERENCE/PLAN.md).
