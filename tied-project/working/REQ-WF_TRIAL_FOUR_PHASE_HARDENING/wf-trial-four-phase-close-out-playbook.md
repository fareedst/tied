# WF trial four-phase close-out playbook (draft → prompt-shared at build-plan)

**Tokens:** [REQ-WF_TRIAL_FOUR_PHASE_HARDENING](../../requirements/REQ-WF_TRIAL_FOUR_PHASE_HARDENING.yaml) · Cross-ref [REQ-CLAUDE_WF03_LIVE_MATRIX_GAPS](../REQ-CLAUDE_WF03_LIVE_MATRIX_GAPS/PLAN.md) pillar G (gate/envelope sequence)

## When this applies

Traditional **agentstream** batch (`run-traditional-four-phase-agentstream.sh`) on **disposable** clients; `depth_tier: minimal`, `gate_policy: advisory`.

## Before turn 4

1. **`request_evidence_envelope_build`** with CITDP `depth_tier` / `gate_policy` (or CITDP-aware inference).
2. **Reconcile preflight:** store must have `mcp-server/dist/index.js` (run `./build-workspace.sh` from store root). Orchestrator prints DIAGNOSTIC if missing; close-out may waive reconcile — document **not_run** in handoff, not silent pass.
3. **`not-applicable-receipt.v1.json`** for adversarial inquiry at minimal depth (backfill if absent).

## Close-out gates

- Use **`tied_gate_check`** with **file paths** `citdp_path` + `tracker_path` (inner CITDP body).
- **`run-close-out-gates.mjs`:** `--envelope-blocking --reconcile` when dist exists.
- **`--sync-dispositions`:** **optional** at minimal WF trial depth when `sub-adversarial-inquiry-pass` is N/A; pending steps such as `three-way-alignment-unit` may remain without blocking advisory `close_out`.

## Traceable commit

- **Single commit** preferred: feature + TIED YAML + working artifacts + gate receipts under **`tied-project/working/{REQ}/gates/`**.
- Put final commit SHA in **`traceable-commit-evidence.md` in the same commit body** — avoid a second “evidence SHA” commit unless sponsor requires amend flow.
- **Gate mirrors:** commit **project** `tied-project/working/.../gates/`; exclude regenerable **`tied-bundle/working/.../gates/`** per [gitignore-close-out-hygiene.md](../../../tools/bundled-prompt-type-skills/prompt-shared/gitignore-close-out-hygiene.md).

## Inventory

Update **`trial-workflow-interaction-inventory.v1.json`** turn 4 with `close_out_gate_receipt` path.
