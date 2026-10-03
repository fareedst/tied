# plan-close-out handoff — REQ-TIED_TWO_FOLDER_LAYOUT

**Date:** 2026-10-03 (evidence refreshed same day for sponsor commit)  
**Inquiry / activation run id:** `phase8-verify-2026-10-02` (required for activation provenance; `close-out-commit-2026-10-03` rejected with `run_id_provenance_mismatch`)

## Completion signals

- **Machine close-out:** **pass** — [closeout-run-close-out-gates-final.json](evidence/closeout-run-close-out-gates-final.json): `gate.allowed=true`, `envelope.blocking_gap_count=0`, `merged_decision.blocking=false`; envelope [request-evidence-envelope.v1.json](evidence/request-evidence-envelope.v1.json) with `--envelope-blocking` and matching `--run-id phase8-verify-2026-10-02`
- **Process contract:** **pass** — Phase 0–8 complete per [PLAN.md](PLAN.md); [verification-evidence-manifest.v1.json](evidence/verification-evidence-manifest.v1.json); CITDP at `tied-project/citdp/CITDP-REQ-TIED_TWO_FOLDER_LAYOUT.yaml`; gitignore hygiene documented ([gitignore-close-out-hygiene-evidence.md](evidence/gitignore-close-out-hygiene-evidence.md))
- **Adherence ledger:** **pass (band B)** — `reconcile.ok: true`, 23 ledger rows; process_grade **75 / B** (`expected_artifact_missing` on manifest dimension only; non-blocking at integrated close-out)

## Field validation (sponsor success)

External factory client **`/Users/fareed/Documents/dev/test/1791037288`** — linked two-folder install, full **`REQ-MACOS_DISPLAY_CLI`** delivery (12/12 tests, live CLI). Evidence: [factory-field-client-1791037288-evidence.md](evidence/factory-field-client-1791037288-evidence.md), [factory-field-client-audit.v1.json](evidence/factory-field-client-audit.v1.json).

## Remaining risks

- **Optional hardening not re-run this session:** `test-new-tied-client`, Windows CI smoke, disposable-client `tied-install --doctor` (defer to CI / release checklist).
- **`tied_verify` MCP** returned `CHECKLIST_GATE_BLOCKED: missing checklist gate evidence` when invoked without gate receipt path — store verification already recorded in Phase 8; re-run with gate evidence if sponsor wants a fresh MCP receipt.
- Envelope auto-patch reported `envelope_revision_conflict` for manifest/profile (non-blocking).

## Validation

- `tied_validate_consistency` → `ok: true` ([tied-validate-consistency-closeout.json](evidence/tied-validate-consistency-closeout.json))
- Store Phase 8: `test-all`, stale-layout lint, G4 two-folder audit (see CITDP + quality-manifest stdout captures)

## Proposed commit message

See [co-sponsor-commit-payload.v1.json](evidence/co-sponsor-commit-payload.v1.json). **Sponsor commit:** executed in session after gate refresh (`gate.allowed=true`, `blocking_gap_count=0`); **no push**.
