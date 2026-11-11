# Proof test label taxonomy (stack normative)

**Authority:** [REQ-TIED_TRIAL_PROOF_INTENT_STACK](../PLAN.md) — consumed by L1 path rules, L2 receipt fields, L3 manifest schema, L4 subcheck.  
**Proof boundary:** Descriptive cohort science only; labels do not prove REQ satisfaction.

---

## Two layers (do not conflate)

| Layer | Field | Purpose | Cohort JSONL |
| --- | --- | --- | --- |
| **Coarse facet** | `proof_facet` | Rollup into existing receipt keys: `unit_tests`, `composition_tests`, `e2e_tests`, `binding_inventory_tests` | Unchanged keys (era `validator_version`) |
| **Fine subtype** | `proof_subtype` | Dissect *why* a test file sits in a facet (wiring vs integration vs contract, etc.) | New object from **1.2.0** (`label_case_counts`) |

Every test file under `src/**/*.test.{ts,mjs}` MUST map to exactly one `proof_facet` and one `proof_subtype` after stack build (path, header, or manifest override).

---

## Coarse facets (four)

| `proof_facet` | Receipt key | TIED dev-cycle role |
| --- | --- | --- |
| `unit` | `unit_tests` | Module-isolated tests |
| `composition` | `composition_tests` | UI-free wiring / integration in-process |
| `e2e` | `e2e_tests` | Named platform constraints only |
| `binding_inventory` | `binding_inventory_tests` | Binding-inventory validator / table tests |

---

## Fine subtypes (normative enum)

Dot notation: `{facet}.{variant}`. Case counts roll up to parent facet unless noted.

| `proof_subtype` | Default `proof_facet` | Path / signal (L1) | Notes |
| --- | --- | --- | --- |
| `unit.default` | unit | `src/**/*.test.ts` (no other signal) | Colocated default |
| `unit.colocated` | unit | Same path + manifest `colocated_unit: true` | Agent admits “unit in src/” intentionally |
| `composition.general` | composition | `composition` substring or `*.composition.test.ts` | |
| `composition.wiring` | composition | `*.binding.test.ts` or L2 **binding_inferred** | WF Lens A binding test |
| `composition.integration` | composition | `*.integration.test.ts` | Not a fifth receipt bucket |
| `composition.contract` | composition | `*.contract.test.ts` | Shape/API contract without full binding row |
| `binding_inventory.table` | binding_inventory | `binding-inventory` / `binding_inventory` in path | Distinct from `composition.wiring` |
| `e2e.ui` | e2e | `e2e` in path or `*.e2e.test.ts` | |
| `e2e.platform_constrained` | e2e | Manifest `e2e_only_reason` required | Pairs with composition-coverage gate |

### Optional manifest tags (no receipt rollup)

Advisory strings on manifest `files[].tags[]` or binding rows: `subprocess`, `smoke`, `regression`, `fault_injection`. Used in L4 readout / facilitator tables only.

---

## Override precedence (L2/L3)

Highest wins for both facet and subtype:

1. **Manifest** `files[].proof_facet` + `files[].proof_subtype` (L3, agent-declared)
2. **`PROOF_LABEL` header** (first non-comment line): `// PROOF_LABEL: composition.integration`
3. **Path-derived** (L1 `classifyTestFileFine`)
4. **Fallback** `unit.default`

Legacy header `// PROOF_KIND: unit|composition|binding-inventory|e2e` maps to facet only; subtype defaults from path when present.

---

## Rollup reference (implementers)

```
unit.default | unit.colocated           → unit_tests
composition.*                            → composition_tests
binding_inventory.table                  → binding_inventory_tests
e2e.*                                    → e2e_tests
```

Receipt extension at `validator_version` **1.2.0**:

```json
"layers": {
  "proof_facets": {
    "unit_tests": 12,
    "composition_tests": 4,
    "label_case_counts": {
      "unit.default": 10,
      "unit.colocated": 2,
      "composition.wiring": 3,
      "composition.integration": 1
    }
  }
}
```

Sum of `label_case_counts` values MUST equal sum of four facet case totals (manifest-adjusted files reconciled in L3 diagnostics).

---

## WF agent naming (skill adjunct)

Prefer **filename suffix** over header when adding new files:

| Intent | Filename pattern |
| --- | --- |
| Wiring / binding | `*.binding.test.ts` |
| Multi-module in-process | `*.integration.test.ts` |
| General composition | `*.composition.test.ts` |
| Contract / shape | `*.contract.test.ts` |
| E2E | `*.e2e.test.ts` |
| Binding inventory row tests | path contains `binding-inventory` |

---

## Out of scope (v1 stack)

- Per-`it()` labels inside one file (file-granularity only)
- Tests outside `src/**/*.test.{ts,mjs}` in size snapshot (separate REQ if store must scan `test/` or packages)
- Vitest/Jest unless `implementation_stack_id` extended

---

## Sponsor gates

| Gate | Question |
| --- | --- |
| **G1** | Coarse suffix map + `comp` = path-declared |
| **G1b** | Approve this enum (add/rename subtypes before L2 freeze) |
| **G2** | Label counts vs facilitator judgment on WF-09 / WF-10 fixtures |
| **G3** | Manifest override + advisory validation |
