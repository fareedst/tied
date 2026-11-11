# Phase handoff — refine-plan

- **request_token:** `REQ-WF_TRIAL_MINIMAL_CHECKLIST_PLAYBOOK`
- **sibling_req:** `REQ-WF_TRIAL_PHASE_HANDOFF_GATE`
- **manifest_leap:** `REQ-WF_TRIAL_RANGE_PROOF_MANIFEST_MANDATE` (SC-RPM-09/10)
- **depth_tier / gate_policy:** minimal / advisory

## Locked in refine-plan

1. Slim tracker seeds under **product** `tied-project/working/{product_REQ}/checklist-tracker.yaml` (resolver from turn-1 handoff).
2. Forbidden prompt-type slugs in `execution_evidence.completed`.
3. Single `@build-plan` wave for phases 1–3.
4. Phase-handoff gate fails turns 1–3; manifest FILE_EXISTS + FILE_COVERAGE.

## Gate receipts

- Pre-implementation checklist gate: advisory (plan mode).

## Next skill

**`@build-plan`** — linked [PLAN.md](../PLAN.md)
