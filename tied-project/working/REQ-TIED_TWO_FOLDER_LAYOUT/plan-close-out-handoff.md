# plan-close-out handoff — REQ-TIED_TWO_FOLDER_LAYOUT

**Date:** 2026-10-03 (follow-up commit batch after `621d99f`)  
**Inquiry / activation run id:** `phase8-verify-2026-10-02` (required for activation provenance; do not mint alternate close-out run ids)

## Completion signals

- **Machine close-out:** **pass** — [closeout-run-close-out-gates-final.json](evidence/closeout-run-close-out-gates-final.json): `gate.allowed=true`, `envelope.blocking_gap_count=0`, `merged_decision.blocking=false`; envelope [request-evidence-envelope.v1.json](evidence/request-evidence-envelope.v1.json) with `--envelope-blocking` and `--run-id phase8-verify-2026-10-02`
- **Process contract:** **pass** — Tracker `close_out_evidence` dual-write populated; CITDP canonical copy synced at `tied-project/citdp/CITDP-REQ-TIED_TWO_FOLDER_LAYOUT.yaml`; staged TFL REQ/ARCH/IMPL + bootstrap tests; co-staged paths documented in CHANGELOG (regression pins only for secondary REQ tokens)
- **Adherence ledger:** **pass (band A)** — `reconcile.ok: true`, 23 ledger rows; process_grade **100 / A** in refreshed closeout JSON

## Scope of this commit (not `03c10a4` mega-close-out)

Post-layout follow-up: client gitignore slim (**SC-TFL-CLIENT-GITIGNORE-SLIM**), satisfaction criteria on REQ-TFL, bootstrap gitignore/install-layer tests, regenerated install matrix and envelope hashes for HEAD+staged revision. Co-staged: Node toolchain quality-manifest captures, Jev pruning benchmark, checklist regression manifest, adversarial fixture envelopes, evaluation gap report.

## Field validation (historical)

External factory client **`/Users/fareed/Documents/dev/test/1791037288`** — linked two-folder install, full **`REQ-MACOS_DISPLAY_CLI`** delivery (12/12 tests, live CLI). Evidence remains in [factory-field-client-1791037288-evidence.md](evidence/factory-field-client-1791037288-evidence.md) from prior close-out; not re-run for this follow-up batch.

## Remaining risks

- **Optional hardening not re-run this session:** `test-new-tied-client`, Windows CI smoke, disposable-client `tied-install --doctor` (defer to CI / release checklist).
- Envelope auto-patch may report `envelope_revision_conflict` for manifest/profile (non-blocking when close-out envelope validate passes).

## Validation

- `tied_validate_consistency` → `ok: true` ([tied-validate-consistency-closeout.json](evidence/tied-validate-consistency-closeout.json))
- Bootstrap: `working-gitignore.test.mjs`, `gitignore-block.test.mjs`, `install-layers.integration.test.mjs` (10/10)

## Commit message

See [co-sponsor-commit-payload.v1.json](evidence/co-sponsor-commit-payload.v1.json) for follow-up subject/body (distinct from `03c10a4` payload). **Sponsor commit:** requested for staged batch; **no push** unless sponsor asks.
