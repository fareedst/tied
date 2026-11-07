# Phase handoff — build-plan

**REQ:** `REQ-TRIAL_METHODOLOGY_VERSION_READOUT`

## Delivered

- Session evidence contract + capture doc + WF turn-1 batch goal
- `@record-wf-trial` / `@record-gf-trial` mandatory metadata + resolution order
- `tools/bootstrap/lib/trial-methodology-version-readout-contract.test.mjs` (6 tests)
- Optional orchestrator `DIAGNOSTIC: tied_methodology_version=` in process log inc
- REQ/ARCH/IMPL + CITDP `tied-project/citdp/CITDP-REQ-TRIAL_METHODOLOGY_VERSION_READOUT.yaml`

## Verification

`node --test tools/bootstrap/lib/trial-methodology-version-readout-contract.test.mjs` — pass

## Next

`@close-out` (sponsor commit deferred)
