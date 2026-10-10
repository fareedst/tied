# Sponsor authority — W4 implement

| Field | Value |
| --- | --- |
| **Recorded** | 2026-10-10 |
| **Program** | QMM Loop 3 methodology learning (W0–W6) |
| **Scope** | **W4 implement** — QMM cohort readouts exercising `[REQ-EVIDENCE_CHAIN_REPORT]` → `[ARCH-EVIDENCE_CHAIN_REPORT]` → `[IMPL-EVIDENCE_CHAIN_REPORT]`; code changes only for confirmed gaps |
| **Linked plan** | [`docs/tied-qmm-w4-evidence-chain-report-plan.md`](../../../../docs/tied-qmm-w4-evidence-chain-report-plan.md) |
| **Orchestrator** | [`../qmm-program-execution-checklist.yaml`](../qmm-program-execution-checklist.yaml) |

## Sponsor statement

The sponsor records **`w4_scope: implement`** for W4 client-cohort evidence-chain readouts:

1. Reuse the existing evidence-chain report stack; do **not** mint a second report requirement.
2. Author implement CITDP, fresh per-wave Authoritative Tracker, and integrated depth (not inherited from plan-only minimal).
3. Allow runtime reconciliation, RED→GREEN only for confirmed contract gaps, deterministic demonstrations, and close-out evidence.
4. Preserve read-only boundaries: manifest-driven inputs, no client-root traversal, no project YAML mutation, no finding-ledger append, no `tied-bundle/` edits.

## Agency boundary

Implement authority does **not** bypass implement `pre_implementation`, integrated adversarial inquiry when triggers match, verification/close_out gates, or costly-choice hinges (`shareable_hashed` export, canonical promotion).

## Related authority

- Plan-only gate and planning Tracker: [`../../PLAN-TIED-QMM-W4-EVIDENCE-CHAIN-REPORT/checklist-tracker.yaml`](../../PLAN-TIED-QMM-W4-EVIDENCE-CHAIN-REPORT/checklist-tracker.yaml) (refine pass 1; non-activation).
