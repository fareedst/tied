# W3 exit → W4 entry handoff

**Change ID:** `PLAN-TIED-RESIDUALITY-ANALYSIS`  
**Date:** 2026-09-27  
**Batch:** build-plan W3 (`w3-build-plan-leap`)

## W3 exit criteria (feature plan §4 W3)

| Criterion | Status |
|-----------|--------|
| Sponsor-approved P0 LEAP persisted to pilot REQ/ARCH/IMPL | Yes — 7 rows |
| S-T12 harmful residue not promoted as positive REQ | Yes — ARCH/IMPL only |
| `residuality_facet` on new satisfaction criteria where applicable | Yes |
| IMPL pseudo-code validated | Yes — both pilot IMPL tokens |
| `tied_validate_consistency` | Yes — ok |
| Verification gate (integrated) | Yes — advisory diagnostics only |

## Stack state

- **REQ-FEAT_TASK_EXECUTION_RECOVERY:** +5 satisfaction criteria (S-T01, S-T04, S-T05, S-T14, S-T15)
- **REQ-FEAT_IDEMPOTENT_CREATION:** +3 satisfaction criteria (S-T01, S-T04, S-T18)
- **ARCH / IMPL:** constraint bullets and contract blocks per `evidence/w3-build-plan-summary.md`

## W4 entry (not started)

1. Unit RED tests from updated IMPL blocks under failure (map tests to stressor facet IDs).
2. Composition tests with CONTROLLED_COMPOSITION_FAULT — include deferred **S-T03** store-unavailable path.
3. Holdout validation stressor set or documented N/A.
4. Re-run adversarial inquiry at verification with W3-specific `run_id` when Mode B paths are available (W3 build reused W2 verification activation pairing).

## Still deferred

- **P1 batch (7 rows):** S-T09, S-T10, S-T11, S-T16, S-O02, S-O06, S-O07
- **Machine close-out:** envelope validate + `sub-close-out-evidence-sync` — deferred until W4+ or sponsor close-out

## Evidence paths

- Summary: `working/PLAN-TIED-RESIDUALITY-ANALYSIS/evidence/w3-build-plan-summary.md`
- Verification receipt: `working/PLAN-TIED-RESIDUALITY-ANALYSIS/gates/verification-2026-09-27T05-52-35-881Z.json`
- CITDP: `working/PLAN-TIED-RESIDUALITY-ANALYSIS/CITDP-RESIDUALITY-PILOT-W3-LEAP.yaml`
