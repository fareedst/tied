# WF trial build-plan handoff

**Tokens:** [REQ-WF_TRIAL_FOUR_PHASE_HARDENING](../../../tied-project/requirements/REQ-WF_TRIAL_FOUR_PHASE_HARDENING.yaml) · Close-out: [wf-trial-four-phase-close-out-playbook.md](./wf-trial-four-phase-close-out-playbook.md)

## End of turn 3 (build-plan)

Write **`tied-project/working/{REQ-TOKEN}/evidence/phase-handoff-build-plan.md`** including:

| Field | Content |
| --- | --- |
| REQ token | Product request token |
| Verification gate | Path to `gates/verification-*.json` |
| Manifest | `verification-evidence-manifest.v1.json` |
| RED evidence | Paths to `quality-manifest/*-red.*` if captured; else explicit “RED not archived” |
| Tracker | Checklist slugs **completed** vs **pending** |
| Next | `@close-out` + link to wf-trial close-out playbook |

## RED capture (when product tests exist)

1. Run documented test command expecting **failure** once; save stdout/stderr under `evidence/quality-manifest/{slug}-red.stdout.txt`.
2. Implement GREEN; save GREEN stdout as today.
3. Optional: reference `red_stdout_ref` in verification manifest metadata.

## Tracker sync minimum

Before deferring close-out, update **`execution_evidence.completed`** for finished build-plan slugs, or document waiver in handoff.
