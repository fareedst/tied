# Test strategy — REQ-WF_TRIAL_PROOF_MANIFEST_SUBTYPE_GATE

**profile_depth:** minimal · **gate_policy:** advisory  
**Last updated:** refine-plan 2026-11-12

## Units (`wf-trial-proof-manifest-gate.test.mjs`)

| Case | Maps to | Behavior |
| --- | --- | --- |
| Coarse facet on multiple rows | SC-PMG-11, SC-PMG-12 | Manifest modeled on `1794511862`: `unit` on rows 0–1, `composition` on row 1; expect ≥2 `FACET_AS_SUBTYPE` |
| `proofSubtypeValidationError` export | SC-PMG-12 | Direct call: `unit` → code `FACET_AS_SUBTYPE` |
| Valid fine labels | SC-PMG-11 neg | `composition.wiring` + `unit.default` passes shape |
| Regression | SC-RPM-05..10 | Existing gate tests unchanged (parent mandate) |

## RED → GREEN (build-plan)

1. If debug patch absent: add failing test first for multi-row FACET_AS_SUBTYPE.
2. Implement or confirm `proofSubtypeValidationError` + files loop matches pseudo-code.
3. Optional: snapshot stderr DIAGNOSTIC lines (SC-PMG-13) via subprocess test — defer if flaky.

## Composition

- No new bash binding unless refine-plan sponsor asks; orchestrator already invokes `.mjs` CLI.

## Commands

```bash
node --test tools/bootstrap/lib/wf-trial-proof-manifest-gate.test.mjs
```
