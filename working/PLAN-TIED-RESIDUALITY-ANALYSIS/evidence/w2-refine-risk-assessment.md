# W2 refine-plan — risk assessment (integrated depth)

**Change ID:** `PLAN-TIED-RESIDUALITY-ANALYSIS`  
**Batch:** W2 classification and risk gating — refine/plan only (no ledger population)  
**Date:** 2026-09-26

## depth_tier selection

- **Selected:** `integrated` (same pilot batch as W1 workshop)
- **gate_policy:** `advisory`
- **prior_depth_tier:** `integrated` (W1 workshop complete — depth unchanged; W2 uses new gate tracker + inquiry run_id)
- **Assurance profiles:** `stateful-reliability`, `data-integrity-migration`, plus W2 mapping to `performance-scale-cost` (S-T11) and cross-cutting external-input where worksheets cite input validation gaps
- **Eligibility triggers matched:** unchanged from W1 pilot targets (persistence + idempotent store)

## Integrated waiver

Not used.

## Primary falsification surfaces (W2 planning)

1. Classification ledger row treated as approved REQ/ARCH without W3 behavior-changing CITDP and sponsor review.
2. Harmful residue auto-promoted to positive REQ via `candidate_requirement` disposition.
3. `accepted_residual_risk` used as a blanket bucket for attractor A5 or S-T09 skew (sponsor: case-by-case; S-T09 → W3 follow-up candidate).
4. Design stressors cited as validation/holdout proof (W4 boundary).

## Residual risks (W2 refine batch)

- **RISK-RES-W2-001** — Incomplete ledger conflated with W2 exit — mitigated: scaffold marks rows `unresolved` until build-plan W2.
- **RISK-RES-W2-002** — Cross-cutting stressors (S-T01, S-T03, S-T04, S-T09, S-T11) split across clusters — mitigated: REQ-aligned ordering with explicit cross-cutting section third.
- **RISK-RES-001** — vocabulary conflation — mitigated via disposition enum docs in ledger scaffold + §5 schema alignment.

## Adversarial inquiry

Structural `pre_implementation` pass at integrated depth with `gate_policy: advisory`; scope `PLAN-TIED-RESIDUALITY-ANALYSIS#W2-CLASSIFICATION-BOUNDARY#refine20260926`; artifacts under `working/REQ-FEAT_TASK_EXECUTION_RECOVERY/adversarial-inquiry/phase-pre_implementation/` with run_id `refine-plan-w2-pre-impl-2026-09-26`.
