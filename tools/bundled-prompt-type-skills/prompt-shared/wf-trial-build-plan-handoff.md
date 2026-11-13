# WF trial build-plan handoff

**Tokens:** [REQ-WF_TRIAL_FOUR_PHASE_HARDENING](../../../tied-project/requirements/REQ-WF_TRIAL_FOUR_PHASE_HARDENING.yaml) · [REQ-WF_TRIAL_MINIMAL_CHECKLIST_PLAYBOOK](../../../tied-project/requirements/REQ-WF_TRIAL_MINIMAL_CHECKLIST_PLAYBOOK.yaml) · Gates: [wf-trial-checklist-gates-adjunct.md](./wf-trial-checklist-gates-adjunct.md) · Close-out: [wf-trial-four-phase-close-out-playbook.md](./wf-trial-four-phase-close-out-playbook.md)

## Turn 3 start (stub before RED)

Write a minimal **`tied-project/working/{REQ-TOKEN}/evidence/phase-handoff-build-plan.md`** stub first (YAML front matter: `in_progress: true`, `request_token`, `prompt_type: build-plan`) so provider aborts mid-turn still leave a build-plan handoff artifact on disk.

## End of turn 3 (build-plan)

Finalize **`tied-project/working/{REQ-TOKEN}/evidence/phase-handoff-build-plan.md`** (remove or clear `in_progress`) including:

| Field | Content |
| --- | --- |
| REQ token | Product request token |
| Verification gate | Path to `gates/verification-*.json` (required when verification ran; orchestrator may fail under `WF_TRIAL_STRICT_CLOSEOUT_PREFLIGHT=1`) |
| sub-adversarial-inquiry-pass | Tracker disposition **`not_applicable`** before RED (not the slug name in `completed` alone) |
| Tracker slugs updated | List registry slugs only: `persist-implementation-records`, `red-tests`, `implement-code`, `verification-gate`, … — **not** `build-plan` |
| Manifest | `verification-evidence-manifest.v1.json` |
| RED evidence | Paths to `quality-manifest/*-red.*` if captured; else explicit “RED not archived” |
| Tracker | Checklist slugs **completed** vs **pending** |
| **composition_path_declared** | List of path-suffixed composition test files (`src/**/*.binding.test.ts`, etc.) and case counts when **composition-integration** applied |
| **Proof facet manifest** | `tied-project/working/proof-facet-manifest/evidence/proof-facet-manifest.v1.json` — one row per test file with **fine** `proof_subtype` only (`unit.default`, `composition.wiring`, …); run `tied_wf_proof_manifest_validate` before turn 4 — post-four-phase gate fails on coarse facet-as-subtype |
| Next | `@close-out` + link to wf-trial close-out playbook |

## RED capture (when product tests exist)

1. Run documented test command expecting **failure** once; save stdout/stderr under `evidence/quality-manifest/{slug}-red.stdout.txt`.
2. Implement GREEN; save GREEN stdout as today.
3. Optional: reference `red_stdout_ref` in verification manifest metadata.

## Tracker sync minimum

Before deferring close-out, update **`execution_evidence.completed`** for finished build-plan slugs, or document waiver in handoff.
