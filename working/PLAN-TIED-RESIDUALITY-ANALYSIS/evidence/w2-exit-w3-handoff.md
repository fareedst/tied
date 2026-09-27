# W2 exit → W3 entry handoff

**Change ID:** `PLAN-TIED-RESIDUALITY-ANALYSIS`  
**Date:** 2026-09-27  
**Batch:** build-plan W2 (`w2-build-plan-classification`)

## W2 exit criteria (feature plan §4 W2)

| Criterion | Status |
|-----------|--------|
| All 25 stressors classified in REQ-aligned order | Yes — `pilot/classification-ledger.md` |
| disposition.status + proof_boundary per row | Yes |
| tied_refs cite pilot REQ/ARCH/IMPL read-only | Yes |
| No project REQ/ARCH/IMPL YAML mutation | Yes |
| Holdout validation stressors not added in W2 | Yes — W4 only |
| W3 eligibility summary at ledger end | Yes |

## Disposition summary

- `candidate_requirement`: 8
- `architecture_constraint`: 6
- `finding`: 10
- `accepted_residual_risk`: 1
- `not_applicable`: 0
- `unresolved`: 0

**W3 LEAP candidate rows (after sponsor review):** 14 (`candidate_requirement` + `architecture_constraint`)

## W3 entry (not started)

1. Sponsor review of all `candidate_requirement` and `architecture_constraint` rows.
2. Open **separate** behavior-changing CITDP (not `CITDP-PLAN-TIED-RESIDUALITY-ANALYSIS` plan-doc record).
3. Apply `[PROC-LEAP]` only on confirmed promotions — harmful residues never become positive REQs.

## Evidence paths

- Ledger: `working/PLAN-TIED-RESIDUALITY-ANALYSIS/pilot/classification-ledger.md`
- JSONL mirror: `working/PLAN-TIED-RESIDUALITY-ANALYSIS/pilot/classification-ledger.jsonl`
- W2 verification gate tracker: `gate-tracker-verification-w2.yaml`
