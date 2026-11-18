# WF trial turn-1 checklist tracker adjunct

**Tokens:** [REQ-WF_TRIAL_MINIMAL_CHECKLIST_PLAYBOOK](../../../tied-project/requirements/REQ-WF_TRIAL_MINIMAL_CHECKLIST_PLAYBOOK.yaml) · [REQ-WF_TRIAL_SLIM_TRACKER_INTER_TURN](../../../tied-project/requirements/REQ-WF_TRIAL_SLIM_TRACKER_INTER_TURN.yaml)

## Turn 1 (add-feature)

- Do **not** invent a custom `checklist-tracker.yaml` with a `tracker:` wrapper or ad-hoc slug names.
- If you need a tracker before refine, copy **`tied-bundle/templates/wf-trial-minimal-checklist-tracker.yaml`** into `tied-project/working/{product_REQ}/checklist-tracker.yaml` and substitute `{{PRODUCT_REQ}}` only.
- List **checklist step slugs** in `execution_evidence.completed` — never prompt-type names (`build-plan`, `add-feature`, …).
- The orchestrator may **replace malformed disposable trackers** after turn 1 (inter-turn reconcile); valid slim shapes are left unchanged.

See [wf-trial-checklist-gates-adjunct.md](./wf-trial-checklist-gates-adjunct.md).