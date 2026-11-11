# Path-declared composition test naming (build-plan adjunct)

**When:** Any TIED **`@build-plan`** turn where the tracker includes **`composition-integration`** (in scope or completed), or binding inventory documents composition-testable bindings.

**Authority:** [proof-test-label-taxonomy.md](../../../tied-project/working/REQ-TIED_TRIAL_PROOF_INTENT_STACK/evidence/proof-test-label-taxonomy.md) · [REQ-TIED_PATH_DECLARED_COMPOSITION_MANDATE](../../../tied-project/working/REQ-TIED_PATH_DECLARED_COMPOSITION_MANDATE/PLAN.md)

## Rules

1. Prefer **filename suffix** over comments when adding tests under `src/`.
2. Colocated `src/module.test.ts` without signals counts as **unit** on the size receipt (`unit.default`).
3. Composition-class work MUST use one of:

| Intent | Pattern |
| --- | --- |
| Wiring / binding | `*.binding.test.ts` |
| Multi-module in-process | `*.integration.test.ts` |
| General composition | `*.composition.test.ts` |
| Contract / shape | `*.contract.test.ts` |
| E2E (rare) | `*.e2e.test.ts` |
| Binding inventory | path contains `binding-inventory` |

4. Optional headers (L2+): `// PROOF_LABEL: composition.integration` or legacy `// PROOF_KIND: composition`.
5. **Manifest or inference** does not satisfy the path-declared bar for `composition_tests` on the snapshot.
6. Before **verification-gate**, call **`tied_path_declared_composition_validate`** with `enforcement` per tracker/CITDP (`advisory` on disposable WF trials by default, `blocking` when composition-integration is in scope on store build-plan).

## WF trials

`PROMPT-WF-09` through `PROMPT-WF-12` inherit these rules via `@build-plan`; WF subcheck may still pass on inference alone ([REQ-WF_TRIAL_COMPOSITION_EVIDENCE_SUBCHECK](../../../tied-project/requirements/REQ-WF_TRIAL_COMPOSITION_EVIDENCE_SUBCHECK.yaml)).

## Handoff field

Record **`composition_path_declared`**: list of `src/**/*.binding|*.integration|*.contract.test.ts` paths and expected case counts.
