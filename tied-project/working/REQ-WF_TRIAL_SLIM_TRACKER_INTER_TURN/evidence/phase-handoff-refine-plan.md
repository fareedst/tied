# Phase handoff — refine-plan

**request_token:** REQ-WF_TRIAL_SLIM_TRACKER_INTER_TURN  
**prompt_type:** refine-plan  
**plan_phase:** pre-implementation

## Locked decisions

Shell interleave (four agentstream invocations) with slim tracker reconcile after turn 1; `--feature-spec-batch-order` + `--resume`; default-on with `WF_TRIAL_SKIP_INTERLEAVED_TRACKER_SEED=1` opt-out. Resume id parsed from subprocess **stdout** `session_id=` operator line. See [PLAN.md](../PLAN.md) §1.

## Artifacts updated

- [PLAN.md](../PLAN.md) — R4 stdout resume contract
- [test-strategy.md](../test-strategy.md)
- [checklist-tracker.yaml](../checklist-tracker.yaml) — registry slugs (`unit-test-red`, not `red-tests-src`)
- [session-handoff.md](./session-handoff.md)

## Gate receipts

Advisory `tied_checklist_gate_validate` `pre_implementation` (2026-11-17, post slug fix):

```json
{
  "allowed": false,
  "blocking": true,
  "depth": "minimal",
  "diagnostics": [
    "missing_adversarial_evidence_references",
    "missing_counterexamples",
    "missing_disconfirming_observations",
    "missing_falsification_questions"
  ],
  "ok": false,
  "phase": "pre_implementation"
}
```

Prior attempt also reported `invalid_slug` for `red-tests-src` / `implement-code` (corrected on store tracker). Adversarial-field diagnostics are **expected** at `profile_depth: minimal` with `sub-adversarial-inquiry-pass: not_applicable` — does not block refine-plan handoff per [wf-trial-checklist-gates-adjunct](../../../../tools/bundled-prompt-type-skills/prompt-shared/wf-trial-checklist-gates-adjunct.md).

## Next

`@build-plan` — RED per [test-strategy.md](../test-strategy.md).