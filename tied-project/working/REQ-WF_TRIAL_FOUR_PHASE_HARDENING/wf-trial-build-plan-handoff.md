# WF trial build-plan handoff (draft → prompt-shared at build-plan)

**Tokens:** [REQ-WF_TRIAL_FOUR_PHASE_HARDENING](../../requirements/REQ-WF_TRIAL_FOUR_PHASE_HARDENING.yaml)

## End of turn 3 (build-plan)

Write **`evidence/phase-handoff-build-plan.md`** including:

| Field | Content |
| --- | --- |
| REQ token | Product request token |
| Verification gate | Path to `gates/verification-*.json` |
| Manifest | `verification-evidence-manifest.v1.json` |
| RED evidence | Paths to `quality-manifest/*-red.*` if captured; else explicit “RED not archived” |
| Tracker | Note which checklist slugs are **completed** vs **pending** |
| Next | `@close-out` + link to [wf-trial-four-phase-close-out-playbook.md](./wf-trial-four-phase-close-out-playbook.md) |

## RED capture (when product tests exist)

1. Run documented test command expecting **failure** (RED) once; save stdout/stderr under `evidence/quality-manifest/{slug}-red.stdout.txt`.
2. Implement GREEN; save GREEN stdout as today.
3. Optional: reference `red_stdout_ref` in verification manifest metadata.

## Tracker sync minimum

Before deferring close-out, set **`execution_evidence.completed`** for build-plan slugs actually finished, or document waiver in handoff — do not claim “machine partial” without listing pending slugs.
