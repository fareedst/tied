# Test strategy — REQ-TIED_PATH_DECLARED_COMPOSITION_MANDATE

**plan_phase:** pre-implementation — **no RED files** in refine-plan.

**Enforcement reference:** [PLAN.md](PLAN.md) § PDC-D5–PDC-D8.

---

## Scenario matrix

| ID | Layer | Scenario | Expected |
| --- | --- | --- | --- |
| SC-PDC-01 | unit | Exempt: no bindings, composition-integration N/A | `mandate_applies: false`, `exempt: true` |
| SC-PDC-02 | unit | Binding inventory row + only `src/cli.test.ts` | `mandate_applies: true`, `satisfied: false`, `composition_tests: 0` |
| SC-PDC-03 | unit | `src/cli.binding.test.ts` with ≥1 case | `satisfied: true`, `composition_tests >= 1`, `composition_files[]` populated |
| SC-PDC-04 | bootstrap | `build-plan/SKILL.md` references generalized naming adjunct | grep/contract in `prompt-type-skills.test.ts` |
| SC-PDC-05 | regression | Subcheck fixture inference-only | unchanged pass (no SC change in subcheck suite) |

---

## Enforcement mode fixtures (build-plan)

| ID | `enforcement` | `mandate_applies` + unsatisfied | verification-gate |
| --- | --- | --- | --- |
| SC-PDC-E1 | advisory | diagnostic receipt; gate may still pass | advisory only |
| SC-PDC-E2 | blocking | `satisfied: false` fails verification-gate hook | blocking |

---

## TDD sequence ([PROC-TIED_DEV_CYCLE])

1. RED `path-declared-composition-validate.test.ts` (SC-PDC-01–03)  
2. GREEN validator module  
3. RED binding MCP test + register `tied_path_declared_composition_validate`  
4. GREEN registration + `tied-cli` mirror if project-size tools exposed  
5. Composition tests for verification hook (store repo only)  
6. Bootstrap SC-PDC-04 after skill edits  

---

## Security / ops

- Validator is **read-only** (`repo_root` scan only).  
- No network, secrets, or client YAML mutation.
