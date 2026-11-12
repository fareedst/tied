# phase-handoff-refine-plan — REQ-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL

request_token: REQ-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL  
**date:** 2026-11-12  
**plan_phase:** pre-implementation (locked)

## Locked decisions

| ID | Decision |
| --- | --- |
| R3–R5 | New `wf-trial-abort-signal.inc.sh`; enum `claude_session_limit` / `turn_missing_session_id` / `handoff_missing` / `unknown` |
| R6 | **Wave 2 deferred:** real inter-turn fail-fast (playbook P2.2) — not in wave 1; wave 1 only orders DIAGNOSTICs before handoff ERROR |
| R7 | Turn 3 batch goal: early `phase-handoff-build-plan.md` stub with `in_progress: true` |
| R8 | Additive manifest fields `incomplete_reason`, `incomplete_turn` |

## Gate

Advisory `pre_implementation` checklist gate run at refine (expected plan-mode signals).

## Artifacts updated

- [PLAN.md](../PLAN.md) — RESOLVE, scope W1.1–W1.8, SC-WF-ABS-01..04, token plan
- [test-strategy.md](../test-strategy.md)
- [citdp-draft.md](../citdp-draft.md)
- [checklist-tracker.yaml](../checklist-tracker.yaml)

## Next

**`@build-plan`** — RED `workflow-trial-agentstream-sh.test.mjs` for SC-WF-ABS-*; implement W1.1–W1.7; create REQ/ARCH/IMPL via MCP.
