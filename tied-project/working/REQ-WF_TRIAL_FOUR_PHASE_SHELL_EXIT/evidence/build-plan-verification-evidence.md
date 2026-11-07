# Build-plan verification — REQ-WF_TRIAL_FOUR_PHASE_SHELL_EXIT

## Composition tests

```
node --test tools/bootstrap/run-traditional-four-phase-agentstream-sh.test.mjs
```

Result: **11/11 pass** (includes T-AGENTSTREAM-EXIT-01, T-EXIT-TRAP-01).

## Files

- `scripts/lib/wf-trial-run-four-phase-agentstream.inc.sh` (new)
- `scripts/run-traditional-four-phase-agentstream.sh` (sources inc; set +e around invoke)
- `tools/bootstrap/run-traditional-four-phase-agentstream-sh.test.mjs`

## TIED tokens

- `REQ-WF_TRIAL_FOUR_PHASE_SHELL_EXIT` — Implemented
- `ARCH-WF_TRIAL_FOUR_PHASE_SHELL_EXIT`
- `IMPL-WF_TRIAL_FOUR_PHASE_SHELL_EXIT`
