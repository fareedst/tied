# Phase handoff — refine-plan

| Field | Value |
| --- | --- |
| REQ token | `REQ-WF_TRIAL_FOUR_PHASE_SHELL_EXIT` |
| Skill | `refine-plan` |
| Sponsor lock | **inc.sh extract** (not production test env) |

## Locked this turn

| Topic | Resolution |
| --- | --- |
| D3 test hook | `scripts/lib/wf-trial-run-four-phase-agentstream.inc.sh` |
| API | `wf_trial_four_phase_prepare_expanded_batch` + `wf_trial_four_phase_run_agentstream` |
| Rejected | `WF_TRIAL_TEST_STUB_AGENTSTREAM_EXIT`, `WF_TRIAL_TEST_HARNESS` on wrapper |
| T-AGENTSTREAM-EXIT-01 | bash heredoc in mjs test sources inc, `cmd=(bash -c 'exit 42')` |

## Artifacts updated

- `PLAN.md` — locked decisions table, D1–D5
- `test-strategy.md` — inc-only composition path
- `CITDP-REQ-WF_TRIAL_FOUR_PHASE_SHELL_EXIT.draft.yaml`
- `requirements/REQ-WF_TRIAL_FOUR_PHASE_SHELL_EXIT.yaml` — `status_note`

## Not done (by design)

- No `inc.sh` implementation
- No RED tests
- No ARCH/IMPL tokens

## Next

`@build-plan` for `REQ-WF_TRIAL_FOUR_PHASE_SHELL_EXIT`
