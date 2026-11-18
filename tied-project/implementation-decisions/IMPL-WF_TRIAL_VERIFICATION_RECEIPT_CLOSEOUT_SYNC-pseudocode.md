# [IMPL-WF_TRIAL_VERIFICATION_RECEIPT_CLOSEOUT_SYNC] [ARCH-WF_TRIAL_VERIFICATION_RECEIPT_CLOSEOUT_SYNC] [REQ-WF_TRIAL_VERIFICATION_RECEIPT_CLOSEOUT_SYNC] — Verification receipt sync for disposable WF closeout.

Grammar-Version: v2

## Handoff verification claim parse

- [IMPL-WF_TRIAL_VERIFICATION_RECEIPT_CLOSEOUT_SYNC] [ARCH-WF_TRIAL_VERIFICATION_RECEIPT_CLOSEOUT_SYNC] [REQ-WF_TRIAL_VERIFICATION_RECEIPT_CLOSEOUT_SYNC] [REQ-WF_TRIAL_DISPOSABLE_CLOSEOUT_READINESS] — Shared bash helper decides whether build handoff claims verification pass without on-disk receipt.
- Contract:
  - INPUT: workspace root, product REQ token
  - OUTPUT: exit 0 = no blocking claim; exit 1 = pass claim without receipt (Tier A signal)
  - PRE: `phase-handoff-build-plan.md` may exist under product working evidence
  - POST: `deferred` / `not_run` front matter never produces pass claim
  - EFFECTS: machine closeout and strict preflight share same helper
  - FAILURE_MODES: unparseable handoff falls through to no pass claim (Tier B)

```
PROCEDURE wf_trial_handoff_verification_pass_claimed_without_receipt(ws, token):
  handoff := READ phase-handoff-build-plan.md
  IF handoff missing: RETURN false
  fm := PARSE yaml front matter
  IF fm.verification_receipt_status IN (deferred, not_run): RETURN false
  IF EXISTS gates/verification-*.json under product working: RETURN false
  IF fm.verification_receipt_status IS persisted AND fm.verification_receipt_path exists on disk: RETURN false
  cell := EXTRACT table row Verification gate
  IF cell matches pass claim pattern AND NOT deferral phrase: RETURN true
  RETURN false
```

## Verification receipt assist

- [IMPL-WF_TRIAL_VERIFICATION_RECEIPT_CLOSEOUT_SYNC] [ARCH-WF_TRIAL_VERIFICATION_RECEIPT_CLOSEOUT_SYNC] [REQ-WF_TRIAL_VERIFICATION_RECEIPT_CLOSEOUT_SYNC] — Opt-in post-batch facilitator persist when agent skipped receipt_persistence.
- Contract:
  - INPUT: workspace, store root
  - PRE: WF_TRIAL_VERIFICATION_RECEIPT_ASSIST=1; FOUR_PHASE_EXIT=0
  - POST: when npm test green and no verification receipt, invoke tied-cli tied_checklist_gate_validate with receipt_persistence
  - EFFECTS: set manifest verification_receipt_assist true when receipt written
  - FAILURE_MODES: missing tied-cli → DIAGNOSTIC skip; tests fail → skip

```
PROCEDURE wf_trial_verification_receipt_assist(ws, store_root):
  IF NOT assist_enabled: RETURN 0
  token := wf_trial_resolve_product_req_token(ws)
  IF no verification receipt AND npm test exit 0:
    INVOKE tied_checklist_gate_validate with citdp_path OR minimal inline citdp
    IF receipt written: RECORD manifest.verification_receipt_assist = true
  RETURN 0
```

## Machine closeout integration

- [IMPL-WF_TRIAL_VERIFICATION_RECEIPT_CLOSEOUT_SYNC] [REQ-WF_TRIAL_DISPOSABLE_GATE_ALIGNMENT] — Replace naive grep verification with claim helper for Tier A branch.
- PRE: close_out receipt not allowed true
- POST: Tier A only when claim helper true

```
PROCEDURE wf_trial_machine_closeout_exit_check(ws, store_root):
  ...
  IF wf_trial_handoff_verification_pass_claimed_without_receipt(ws, token):
    EMIT verification_handoff_without_receipt ERROR
    RETURN 1
  ...
```