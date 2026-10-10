# PLAN-TIED-QMM-W4-EVIDENCE-CHAIN-REPORT

## Status

**Implement authorized** (2026-10-10) — sponsor records `w4_scope: implement`. Execute via
[`implement-checklist-tracker.yaml`](./implement-checklist-tracker.yaml) and
[`CITDP-PLAN-TIED-QMM-W4-IMPLEMENT.yaml`](../../citdp/CITDP-PLAN-TIED-QMM-W4-IMPLEMENT.yaml).

| Field | Value |
| --- | --- |
| Linked plan | [`docs/tied-qmm-w4-evidence-chain-report-plan.md`](../../../../docs/tied-qmm-w4-evidence-chain-report-plan.md) |
| Parent program | `PLAN-TIED-QMM-METHODOLOGY-LEARNING` |
| Existing stack | `[REQ-EVIDENCE_CHAIN_REPORT]` → `[ARCH-EVIDENCE_CHAIN_REPORT]` → `[IMPL-EVIDENCE_CHAIN_REPORT]` |
| Plan-only Tracker | [`checklist-tracker.yaml`](./checklist-tracker.yaml) (refine pass 1; non-activation) |
| Implement Tracker | [`implement-checklist-tracker.yaml`](./implement-checklist-tracker.yaml) |
| Sponsor authority | [`../PLAN-TIED-QMM-METHODOLOGY-LEARNING/evidence/sponsor-authority-w4-implement-20261010.md`](../PLAN-TIED-QMM-METHODOLOGY-LEARNING/evidence/sponsor-authority-w4-implement-20261010.md) |
| Implement CITDP | [`../../citdp/CITDP-PLAN-TIED-QMM-W4-IMPLEMENT.yaml`](../../citdp/CITDP-PLAN-TIED-QMM-W4-IMPLEMENT.yaml) |

## Delegated work envelope

Allowed:

- reconcile existing report module, CLI, sidecar, fixtures, and tests against the child plan;
- RED→GREEN and composition work **only for confirmed gaps**;
- deterministic W4 demonstrations under `working/PLAN-TIED-QMM-W4-EVIDENCE-CHAIN-REPORT/evidence/`;
- LEAP-aligned updates to existing REQ/ARCH/IMPL when a genuine contract gap is confirmed;
- verification, close_out gates, vocabulary VALIDATE, and orchestrator W4 completion when evidence satisfies the contract.

Forbidden:

- minting a second report requirement;
- client-root traversal, project YAML mutation, finding-ledger append, case promotion;
- `tied-bundle/` methodology edits;
- reusing W1–W3 receipts as W4 activation evidence;
- `shareable_hashed` export without named owner and expiry;
- changing or deleting `tmp/w2-*.json`.

## Independent dimensions (implement)

| Dimension | Value | Notes |
| --- | --- | --- |
| `profile_depth` | `integrated` | Report/profile measurement depth |
| `depth_tier` | `integrated` | Upgraded from plan-only `minimal`; `prior_depth_tier: minimal` on implement CITDP |
| `gate_policy` | `per_citdp` | Checklist evidence may block progression |

Integrated `pre_implementation` requires fresh identity-bound activation evidence when eligibility triggers match; run `sub-adversarial-inquiry-pass` before RED if the gate blocks.

**Latest gate attempt (2026-10-10):** `allowed: false` — tracker sparse, pending `risk-assessment` / `gate-pseudocode-validation`, missing `sub-adversarial-inquiry-pass`, `activation_pairing_incomplete`. Receipt: [`evidence/pre_implementation-gate-result.json`](./evidence/pre_implementation-gate-result.json).

## Implement batches

1. **Reconcile** — existing stack vs child plan; pseudo-code validation for any touched IMPL blocks.
2. **TDD gaps** — unit then CLI composition; preserve existing matrix from `[IMPL-EVIDENCE_CHAIN_REPORT]`.
3. **Demonstrate** — mixed cohorts, v2 denominator subcohorts, path privacy, strict/partial modes, deterministic rerun hashes.
4. **Close out** — `tied_verify`, `tied_validate_consistency` if TIED touched, envelope, manifest, verification and close_out gate receipts.

## Plan-only history

Refine pass 1 recorded a non-activating `pre_implementation` gate (`malformed_citdp:adversarial_inquiry` with `citdp: null`). That receipt does **not** authorize implement and must not be reused.
