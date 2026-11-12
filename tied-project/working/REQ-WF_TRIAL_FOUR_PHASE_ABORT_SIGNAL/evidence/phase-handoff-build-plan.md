# phase-handoff-build-plan — REQ-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL

request_token: REQ-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL  
prompt_type: build-plan

## Verification gate

Bootstrap: `node --test tools/bootstrap/workflow-trial-agentstream-sh.test.mjs` — **58/58 pass** (includes SC-WF-ABS-01..04).

## Implementation summary

| Deliverable | Path |
| --- | --- |
| Abort classifier | `scripts/lib/wf-trial-abort-signal.inc.sh` |
| Manifest merge | `wf_trial_process_log_set_incomplete_reason` in `scripts/lib/wf-trial-process-log.inc.sh` |
| Orchestrator hook | `scripts/workflow-trial-agentstream.sh` |
| Gate ordering | `scripts/lib/wf-trial-phase-handoff-gate.inc.sh` |
| Batch stub goal | `docs/demos/traditional-four-phase-agentstream.yaml` |
| Adjunct | `tools/bundled-prompt-type-skills/prompt-shared/wf-trial-build-plan-handoff.md` |

## TIED tokens

- `REQ-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL`
- `ARCH-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL`
- `IMPL-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL`

## Tracker

- `unit-test-green` — bootstrap tests green
- `verification-gate` — deferred formal receipt until close-out sync

## Next

`@close-out` — persist CITDP YAML, traceable commit when gates allow.
