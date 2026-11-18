# Fixture note — thin templates incident class (1794978904)

**Purpose:** RED/fixture narrative for SC-DCR-01 and live SC-DCR-06; no disposable client tree committed in store repo.

## Observed failure chain

1. Disposable client `tied-bundle/templates/` contains only a **thin** subset (no `wf-trial-minimal-checklist-tracker.yaml` locally).
2. MCP `loadWfTrialDisposableChecklistSlugs()` resolves via **cwd walk only** → empty union.
3. Verification gate → `invalid_slug` for `red-tests` / `implement-code`.
4. Agent `citdp_record_write` → blocked by `validateCitdpOpenRecord` adversarial list requirements at minimal depth.
5. Turn 4 `close_out` never produces `gates/close_out-*.json`.
6. `wf_trial_machine_closeout_exit_check` → ERROR `no_close_out_gate_receipt` (pre–tier B behavior).
7. `wf-trial-orchestrator-run.v1.json` may show `exit_code: 0` while final shell exit is **1** (finalize before machine closeout).

## Fixture inputs for tests

- Reuse tracker shape from [fixture-disposable-tracker-1794975372.yaml](../../REQ-WF_TRIAL_DISPOSABLE_GATE_ALIGNMENT/evidence/fixture-disposable-tracker-1794975372.yaml).
- Temp directory: client with empty or thin `tied-bundle/templates/`; env `TIED_STORE_ROOT` pointing at store with full template.
- Optional: copy verification receipt JSON from live cell when captured under `evidence/` during build-plan live wave.