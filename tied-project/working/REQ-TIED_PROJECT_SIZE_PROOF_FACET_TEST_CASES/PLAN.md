# PLAN — REQ-TIED_PROJECT_SIZE_PROOF_FACET_TEST_CASES

**Token:** `REQ-TIED_PROJECT_SIZE_PROOF_FACET_TEST_CASES`  
**Track:** `@add-feature` → **`@refine-plan`** (this revision) → `@build-plan` → `@close-out`  
**Parent:** [REQ-TIED_PROJECT_SIZE_LAYERS](../REQ-TIED_PROJECT_SIZE_LAYERS/PLAN.md) (v1 closed; additive LEAP)  
**Siblings:** [REQ-TIED_PROJECT_SIZE_OPERATIONAL_UTF8_MASS](../REQ-TIED_PROJECT_SIZE_OPERATIONAL_UTF8_MASS/PLAN.md) (post-build, uncommitted)  
**Linked Cursor plan:** `.cursor/plans/proof_facet_test_cases_ac507abe.plan.md`  
**plan_phase:** `closed`

---

## Sponsor intent (locked)

Proof-facet receipt fields (`unit_tests`, `composition_tests`, `e2e_tests`, `binding_inventory_tests`) must count **`node:test` test cases** (`it` / `test` invocations) inside classified files, not **one per file**. File counts under-count dense suites.

**Sponsor metric choice:** Reuse existing receipt keys; bump `validator_version` so cohort science can separate file-era vs case-era rows.

**Proof boundary:** Unchanged — descriptive evidence only; no grades, no REQ status, no leaderboard.

---

## RESOLVE

| Term | Definition |
| --- | --- |
| **Test case** | One `it(...)` or `test(...)` call in a classified test file, including `it.only` / `it.skip` / `it.todo` and the same for `test.*`. |
| **Classifier** | Unchanged path rules in `classifyTestFile` (unit vs composition vs e2e vs binding-inventory). |
| **Glob** | Unchanged: `src/**/*.test.ts`, `src/**/*.test.mjs` under subject `repo_root`. |
| **Stack** | Primary: **wf-trial-ts-node-test-v1** (`node:test`). Heuristic lexer (comments/strings stripped); not full TS AST. |
| **verify_evidence_files** | Still **file** count (`*consistency*.json` under `tied-project/working/**/evidence/`). |
| **validator_version** | `1.0.0` → **`1.1.0`** when proof-facet tiers count cases. Catalog states `validator_version < 1.1.0` tier integers were **files**. |
| **Receipt schema_version** | Stays `project-size-snapshot-receipt.v1` (semantic change in tier integers only). |

---

## Refinements (refine-plan)

1. **Pure counter:** `countTestCasesInSource(source)` in [`mcp-server/src/project-size/test-case-count.ts`](../../../mcp-server/src/project-size/test-case-count.ts) — unit-tested without filesystem.
2. **Strip pass:** Remove block comments, line comments, then naive single/double/template string spans before regex count.
3. **Regex:** `\b(?:it|test)(?:\.(?:only|skip|todo))?\s*\(` — document known false positives (string literals missed by strip) in IMPL detail.
4. **Snapshot loop:** Per file: classify → read → `proofCounts[tier] += countTestCasesInSource(text)` (zero allowed).
5. **Cross-layer:** `proofTotal`, `proof_facets_per_atom`, `tests_per_procedure` automatically use case sums; no new cross-layer keys.
6. **IMPL naming (locked):** **`IMPL-TIED_PROJECT_SIZE_PROOF_FACET_TEST_CASES`**; LEAP **`IMPL-TIED_PROJECT_SIZE_SNAPSHOT`** pseudo-code with explicit `COLLECT_PROOF_FACETS_LAYER` block.
7. **Parent REQ:** LEAP satisfaction wording + `cross_references` to this token; do not regress parent **Implemented** status.
8. **Facilitator:** Update glossary rows in [`project-size-comparison-render.mjs`](../../../tools/bootstrap/lib/project-size-comparison-render.mjs); re-run batch compare after build (optional UTF-8 columns in same pass).
9. **Fixture proof:** Mini-client gains a unit file with **≥2 `it` blocks** so tier case count **>** unit file count.

---

## Acceptance criteria (REQ detail — for build-plan)

| ID | Criterion |
| --- | --- |
| SC-PFC-01 | Tier fields sum test **cases** per classified file, not file count. |
| SC-PFC-02 | Unit fixture: `unit_tests` > number of unit-classified **files**. |
| SC-PFC-03 | Successful receipts set `validator_version` to `1.1.0`; catalog documents pre-1.1.0 file semantics. |
| SC-PFC-04 | Registry labels and facilitator glossary say **test cases**. |
| SC-PFC-05 | `verify_evidence_files` unchanged (files); `proof_facets_per_atom` uses case total. |
| SC-PFC-06 | `npm test` project-size scoped tests green; `tied_validate_consistency` ok. |

---

## Build sequence (`@build-plan`)

| Step | Deliverable |
| --- | --- |
| 1 | MCP enroll REQ / ARCH / IMPL + `semantic-tokens.yaml`; parent `related_to` / LEAP note |
| 2 | IMPL pseudo-code (slice + LEAP snapshot `COLLECT_PROOF_FACETS_LAYER`) |
| 3 | RED tests → `test-case-count.ts`, `snapshot-builder.ts`, `types.ts` (`VALIDATOR_VERSION`) |
| 4 | Fixture `mini-client` + update `project-size.test.ts` |
| 5 | [`project-size-metrics.registry.yaml`](../../config/project-size-metrics.registry.yaml), catalog, vocab |
| 6 | Facilitator comparison glossary |
| 7 | `tied_validate_consistency`; build-plan evidence manifest |

---

## Program order (with UTF-8 sibling)

1. **`@build-plan`** this REQ (can land in same commit as UTF-8 mass per sponsor).
2. Re-run batch compare (UTF-8 + case counts):

   ```bash
   node tools/bootstrap/lib/project-size-batch-compare.mjs \
     --store-root "$PWD" --pattern wf-agentstream --limit 25 \
     --out-dir tied-project/non-tied-plans/project-size-batch-discover-compare/evidence
   ```

3. **`@close-out`** one or two commits (combined vs split).

---

## Out of scope

- Vitest/Jest matchers unless a new `implementation_stack_id` requires them
- Counting `describe` as tests
- Cohort JSONL backfill (filter by `validator_version`)
- `schema_version` bump on receipt

---

## Handoff

**Do next:** `@close-out` or refresh batch compare; optional joint close-out with UTF-8 mass REQ.
