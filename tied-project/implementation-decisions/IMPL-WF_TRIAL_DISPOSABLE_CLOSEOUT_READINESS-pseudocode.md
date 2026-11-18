# [IMPL-WF_TRIAL_DISPOSABLE_CLOSEOUT_READINESS] [ARCH-WF_TRIAL_DISPOSABLE_CLOSEOUT_READINESS] [REQ-WF_TRIAL_DISPOSABLE_CLOSEOUT_READINESS] — Template resolution, minimal CITDP, tiered closeout, manifest truth.

Grammar-Version: v2

## resolveDefaultDisposableChecklistTemplatePath

- [IMPL-WF_TRIAL_DISPOSABLE_CLOSEOUT_READINESS] [ARCH-WF_TRIAL_DISPOSABLE_CLOSEOUT_READINESS] [REQ-WF_TRIAL_DISPOSABLE_CLOSEOUT_READINESS] — Resolve slim WF trial checklist template before cwd walk.
- Contract:
  - INPUT: optional explicit templatePath; env TIED_CLIENT_BUNDLE_PATH; env TIED_STORE_ROOT
  - PRE: at least one bundle root or cwd hierarchy exists
  - OUTPUT: absolute path or undefined
  - POST: first hit in order explicit → client bundle → store bundle → cwd walk (12 levels)
  - EFFECTS: DIAGNOSTIC logs which resolution tier won

```
PROCEDURE resolveDefaultDisposableChecklistTemplatePath(explicitPath):
  IF explicitPath IS set AND file exists:
    LOG DIAGNOSTIC disposable_template_resolution=explicit
    RETURN explicitPath
  client := join(TIED_CLIENT_BUNDLE_PATH, tied-bundle/templates/wf-trial-minimal-checklist-tracker.yaml)
  IF client exists:
    LOG DIAGNOSTIC disposable_template_resolution=client_bundle
    RETURN client
  store := join(TIED_STORE_ROOT, tied-bundle/templates/wf-trial-minimal-checklist-tracker.yaml)
  IF store exists:
    LOG DIAGNOSTIC disposable_template_resolution=store_bundle
    RETURN store
  RETURN legacy_cwd_walk(12)
```

## validateCitdpOpenRecord minimal waiver

- [IMPL-WF_TRIAL_DISPOSABLE_CLOSEOUT_READINESS] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-WF_TRIAL_MINIMAL_CHECKLIST_PLAYBOOK] — Open-record persist skips adversarial list requirements at minimal depth when tracker declares minimal-depth-no-inquiry.
- Contract:
  - INPUT: citdp document, tracker document
  - PRE: depth_tier minimal in record_identity or risk_analysis; tracker sub-adversarial-inquiry-pass not_applicable policy minimal-depth-no-inquiry
  - POST: citdp_record_write allowed without fabricated counterexamples/evidence lists
  - FAILURE_MODES: integrated depth still requires full adversarial section

```
PROCEDURE validateCitdpOpenRecord(input):
  section := adversarialSection(input.citdp)
  IF depth_tier IS minimal AND tracker_waives_adversarial(input.tracker):
    RETURN validate_shape_only(section)  // no missing_* list diagnostics
  RETURN existing_strict_validate(input)
```

## wf_trial_machine_closeout_exit_check tiered

- [IMPL-WF_TRIAL_DISPOSABLE_CLOSEOUT_READINESS] [IMPL-WF_TRIAL_DISPOSABLE_GATE_ALIGNMENT] [REQ-WF_TRIAL_DISPOSABLE_CLOSEOUT_READINESS] — Tier A fail vs Tier B honest incomplete.
- Contract:
  - INPUT: workspace root
  - PRE: WF_TRIAL_SKIP_MACHINE_CLOSEOUT_EXIT unset or 0
  - OUTPUT: exit 0 or 1
  - FAILURE_MODES (Tier A): close_out receipt allowed false; inventory incomplete; verification handoff without receipt
  - TERMINATION (Tier B): no close_out receipt, no tier-A signals → DIAGNOSTIC no_close_out_gate_receipt, exit 0

```
PROCEDURE wf_trial_machine_closeout_exit_check(ws):
  IF skip_env: RETURN 0
  IF tier_A_signal(ws):
    EMIT ERROR with appropriate reason
    RETURN 1
  IF close_out_receipt_allowed_true(ws):
    RETURN 0
  // Tier B
  EMIT DIAGNOSTIC wf_trial_machine_closeout_reason=no_close_out_gate_receipt
  RETURN 0
```

## wf_trial_process_log_finalize composite exit

- [IMPL-WF_TRIAL_DISPOSABLE_CLOSEOUT_READINESS] [ARCH-WF_TRIAL_DISPOSABLE_CLOSEOUT_READINESS] [REQ-WF_TRIAL_DISPOSABLE_CLOSEOUT_READINESS] [REQ-WF_TRIAL_ORCHESTRATOR_PROCESS_LOG] [REQ-WF_TRIAL_FOUR_PHASE_SHELL_EXIT] — Manifest exit_code reflects final shell exit after machine closeout.
- Contract:
  - INPUT: workspace ws; four_phase_exit; machine_closeout_exit
  - PRE: process log enabled unless WF_TRIAL_SKIP_PROCESS_LOG
  - OUTPUT: final shell exit code
  - POST: manifest.exit_code equals composite exit
  - EFFECTS: finalize runs after machine closeout hook OR second finalize updates manifest
  - FAILURE_MODES: FOUR_PHASE_EXIT non-zero aborts before machine closeout

```
PROCEDURE orchestrator_tail(ws):
  FOUR_PHASE_EXIT := run_agentstream_batch()
  IF FOUR_PHASE_EXIT != 0: EXIT FOUR_PHASE_EXIT
  MC := wf_trial_machine_closeout_exit_check(ws)
  FINAL := FOUR_PHASE_EXIT OR MC
  wf_trial_process_log_finalize(FINAL)
  EXIT FINAL
```