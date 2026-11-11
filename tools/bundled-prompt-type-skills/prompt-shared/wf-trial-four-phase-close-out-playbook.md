# WF trial four-phase close-out playbook

**Tokens:** [REQ-WF_TRIAL_FOUR_PHASE_HARDENING](../../../tied-project/requirements/REQ-WF_TRIAL_FOUR_PHASE_HARDENING.yaml) · Gate/envelope turn-4 sequence: [REQ-CLAUDE_WF03_LIVE_MATRIX_GAPS](../../../tied-project/working/REQ-CLAUDE_WF03_LIVE_MATRIX_GAPS/PLAN.md) pillar G · Batch YAML: [traditional-four-phase-agentstream.yaml](../../../docs/demos/traditional-four-phase-agentstream.yaml)

## When this applies

Traditional **agentstream** batch on **disposable** clients; `depth_tier: minimal`, `gate_policy: advisory`.

## Before turn 4

1. **`request_evidence_envelope_build`** with CITDP `depth_tier` / `gate_policy` (or CITDP-aware inference).
2. **Reconcile preflight:** store operator should have `mcp-server/dist/index.js` (`./build-workspace.sh`). Orchestrator emits DIAGNOSTIC when missing; document **not_run** in handoff if close-out waives reconcile.
3. **`not-applicable-receipt.v1.json`** for adversarial inquiry at minimal depth (backfill if absent).

## Close-out gates

- Use **`tied_gate_check`** with **file paths** `citdp_path` + `tracker_path` (inner CITDP body).
- **`run-close-out-gates.mjs`:** `--envelope-blocking --reconcile` when dist exists.
- **`sub-close-out-evidence-sync`:** When a **`gates/verification-*.json`** receipt exists from turn 3, run sync (or `run-close-out-gates.mjs --sync-dispositions`) **before** `tied_gate_check` close_out — do not waive for grade-uplift cohorts.
- **`--sync-dispositions`:** At minimal depth with verification receipt, **recommended**; still optional for legacy waiver-only cells when no verification receipt was written.
- **`traceable-commit`:** Only when `tied_gate_check` returns **`allowed: true`**; otherwise handoff must say **INCOMPLETE** (symmetric with turn 3 build deliverables).

## Traceable commit

- **Single commit** preferred: feature + TIED YAML + working artifacts + gate receipts under **`tied-project/working/{REQ}/gates/`**.
- Record commit SHA in **`traceable-commit-evidence.md` in the same commit** — avoid a follow-up “evidence SHA” commit unless sponsor requires amend.
- **Gate mirrors:** commit **project** gates; exclude regenerable **`tied-bundle/working/.../gates/`** per [gitignore-close-out-hygiene.md](./gitignore-close-out-hygiene.md).

## Inventory

Update **`trial-workflow-interaction-inventory.v1.json`** turn 4 with `close_out_gate_receipt` path.
