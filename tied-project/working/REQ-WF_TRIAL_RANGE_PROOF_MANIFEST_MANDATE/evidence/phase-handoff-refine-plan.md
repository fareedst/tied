# Phase handoff — refine-plan (wave 2)

- **request_token:** `REQ-WF_TRIAL_RANGE_PROOF_MANIFEST_MANDATE`
- **prompt_type:** refine-plan
- **plan_phase:** `pre-implementation` (wave 2 delta)

## Sponsor redirect (G6)

Orchestrator L3 proof manifest is **default-on** for every `workflow-trial-agentstream` run. Remove **`WF_TRIAL_REQUIRE_PROOF_MANIFEST`** entirely. Keep **`WF_TRIAL_SKIP_PROOF_MANIFEST=1`** only.

## Artifacts updated

| Artifact | Change |
| --- | --- |
| [PLAN.md](../PLAN.md) | Wave 2 scope, SC-RPM-01/04/06, supersede single-cell ergonomics |
| [CITDP](../CITDP-REQ-WF_TRIAL_RANGE_PROOF_MANIFEST_MANDATE.yaml) | current = wave 1 shipped; desired = default-on |
| [test-strategy.md](../test-strategy.md) | RED cases for gate enabled without env; no REQUIRE grep |
| [g6-sponsor-orchestrator-default.md](./g6-sponsor-orchestrator-default.md) | Sponsor ack |

## Gates

- **pre_implementation:** not run (no checklist-tracker in working folder; advisory policy)

## Next

**`@build-plan`** per PLAN §6
