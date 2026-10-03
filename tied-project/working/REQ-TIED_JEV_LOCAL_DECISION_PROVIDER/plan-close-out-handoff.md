# REQ-TIED_JEV_LOCAL_DECISION_PROVIDER — plan-close-out handoff (2026-09-30)

### Completion signals

- **Machine close-out:** pass — `close_out` `allowed=true`; envelope `fail_on_error_gaps` blocking_gaps=0; runner `merged_decision.allowed=true`
- **Process contract:** pass — tracker synced; verification manifest + PSA report present; inquiry ×3 PASS
- **Adherence ledger:** pass — reconcile run via `run-close-out-gates.mjs --reconcile` (integrated mixed policy)

### Remaining risks

- Bridge returns placeholder `0.5` scores until real `laya_mlx` smoke (`JEV_LOCAL_MLX_SMOKE=1`)
- `auto` + `remote` fallback egress documented in preflight/trace only
