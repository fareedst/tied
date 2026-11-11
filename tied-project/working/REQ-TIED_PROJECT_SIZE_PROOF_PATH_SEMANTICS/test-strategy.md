# Test strategy — REQ-TIED_PROJECT_SIZE_PROOF_PATH_SEMANTICS

**Depth:** minimal · **Gate policy:** advisory  
**Taxonomy:** [proof-test-label-taxonomy.md](../REQ-TIED_TRIAL_PROOF_INTENT_STACK/evidence/proof-test-label-taxonomy.md)

## Module boundaries

| Module | Responsibility |
| --- | --- |
| `proof-test-classify.ts` (or snapshot) | `classifyTestFileFine` pure function |
| `snapshot-builder.ts` | Facet loop still 1.1.0; may call fine classify for future hook without emitting labels until L2 |
| Prompt-shared adjunct | Naming table |

## Unit tests

### `classifyTestFileFine`

| Input path | facet | subtype |
| --- | --- | --- |
| `src/a.test.ts` | unit | unit.default |
| `src/a.integration.test.ts` | composition | composition.integration |
| `src/a.binding.test.ts` | composition | composition.wiring |
| `src/a.contract.test.ts` | composition | composition.contract |
| `src/binding-inventory/foo.test.ts` | binding_inventory | binding_inventory.table |
| `src/a.e2e.test.ts` | e2e | e2e.ui |

### `project-size.test.ts`

| Test | Asserts |
| --- | --- |
| SC-PPS-01 | Coarse tiers unchanged (integration/binding/contract → `composition_tests`) |
| SC-PPS-02 | Plain colocated → unit |
| SC-PPS-06 | Fine classify callable from snapshot build (internal); receipt has no `label_case_counts` yet |

### Header contracts

- `PROOF_LABEL` / `PROOF_KIND` parse tests only (no snapshot effect in L1)

## Fixtures

Extend mini-client with one file per new suffix (single `it` each) for coarse tier sums.

## E2E

None.
