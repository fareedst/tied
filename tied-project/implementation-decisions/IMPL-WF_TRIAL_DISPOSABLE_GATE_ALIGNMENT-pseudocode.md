# [IMPL-WF_TRIAL_DISPOSABLE_GATE_ALIGNMENT] [ARCH-WF_TRIAL_DISPOSABLE_GATE_ALIGNMENT] [REQ-WF_TRIAL_DISPOSABLE_GATE_ALIGNMENT] — Disposable slug union and machine closeout exit.

Grammar-Version: v2

## resolveCanonicalSlugRegistryForTracker

- [IMPL-WF_TRIAL_DISPOSABLE_GATE_ALIGNMENT] [ARCH-WF_TRIAL_DISPOSABLE_GATE_ALIGNMENT] [REQ-WF_TRIAL_DISPOSABLE_GATE_ALIGNMENT] — Union methodology checklist slugs with slim template slugs when tracker.workflow_trial_disposable is true.
- Contract:
  - INPUT: tracker document
  - PRE: methodology checklist registry resolvable OR explicit canonicalSlugs override
  - OUTPUT: Set of allowed slugs
  - POST: registry contains all methodology slugs; when disposable flag true, also contains slim template step slugs
  - EFFECTS: cached disposable slug set loaded from tied-bundle/templates/wf-trial-minimal-checklist-tracker.yaml

```
PROCEDURE resolveCanonicalSlugRegistryForTracker(tracker):
  base := loadCanonicalChecklistSlugs()
  IF tracker.workflow_trial_disposable IS NOT true:
    RETURN base
  disposable := loadWfTrialDisposableChecklistSlugs()
  IF disposable IS empty:
    RETURN base
  RETURN base UNION disposable
```

## validateCanonicalSlugs branch

- [IMPL-WF_TRIAL_DISPOSABLE_GATE_ALIGNMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — Gate validation uses contextual registry from resolveCanonicalSlugRegistryForTracker unless canonicalSlugs provided.
- Contract:
  - INPUT: tracker, optional canonicalSlugs
  - POST: no invalid_slug for slim slugs on disposable trackers at minimal depth

```
PROCEDURE validateCanonicalSlugs(input):
  registry := input.canonicalSlugs OR resolveCanonicalSlugRegistryForTracker(input.tracker)
  FOR slug IN collectTrackerSlugs(input.tracker):
    IF slug NOT IN registry:
      EMIT invalid_slug:slug
```

## wf_trial_machine_closeout_exit_check

- [IMPL-WF_TRIAL_DISPOSABLE_GATE_ALIGNMENT] [REQ-WF_TRIAL_FOUR_PHASE_SHELL_EXIT] — Post-four-phase orchestrator hook; default on; FOUR_PHASE_EXIT non-zero still wins.
- Contract:
  - INPUT: workspace root, store root
  - PRE: WF_TRIAL_SKIP_MACHINE_CLOSEOUT_EXIT unset or 0
  - OUTPUT: shell exit 0 or 1
  - FAILURE_MODES: close_out_turn incomplete; no allowed close_out receipt; verification handoff without verification receipt
  - TERMINATION: return 0 when close_out gate receipt allowed true

```
PROCEDURE wf_trial_machine_closeout_exit_check(ws, store_root):
  IF WF_TRIAL_SKIP_MACHINE_CLOSEOUT_EXIT:
    RETURN 0
  token := resolve_product_req(ws)
  IF token missing:
    RETURN 0
  IF inventory.close_out_turn.status == "incomplete":
    RETURN 1
  IF EXISTS gates/close_out-*.json WITH allowed true:
    RETURN 0
  IF build_handoff mentions verification AND NO gates/verification-*.json:
    RETURN 1
  RETURN 1
```