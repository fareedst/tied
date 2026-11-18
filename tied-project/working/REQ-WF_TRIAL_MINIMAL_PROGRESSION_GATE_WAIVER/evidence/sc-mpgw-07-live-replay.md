# SC-MPGW-07 live gate replay — 1794981051

**Date:** 2026-11-18  
**Validator:** `mcp-server/src/checklist-validator.ts` (post-fix, tsx import)  
**Fixture:** [fixture-live-gate-1794981051.md](./fixture-live-gate-1794981051.md)

## Inputs

| Field | Source |
| --- | --- |
| Tracker | `1794981051…/tied-project/working/REQ-SEMVER_COMPARATOR/checklist-tracker.yaml` |
| CITDP (gate-shaped) | `risk_analysis.adversarial_inquiry: { depth_tier: minimal, gate_policy: advisory }` — same shape that produced four `missing_*` in pre-fix verification receipt |

## Results

| Phase | Pre-fix (`verification-2026-11-18T05-53-23-694Z.json`) | Post-fix |
| --- | --- | --- |
| `verification` | `allowed: false`; four list `missing_*` | `allowed: true`; no list `missing_*` |
| `close_out` | (no receipt) | `allowed: true`; no list `missing_*` |

**Note:** Persisted product `citdp/CITDP-REQ-SEMVER_COMPARATOR.yaml` uses WF product schema without `adversarial_inquiry`; progression gates that hydrate checklist-shaped CITDP are what SC-MPGW-07 replays.