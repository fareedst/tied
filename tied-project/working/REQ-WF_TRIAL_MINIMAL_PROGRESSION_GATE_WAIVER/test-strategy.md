# Test strategy — REQ-WF_TRIAL_MINIMAL_PROGRESSION_GATE_WAIVER

**profile_depth:** minimal · **gate_policy:** advisory  
**Surface:** `mcp-server/src/checklist-validator.ts` + MCP gate tool tests.

## Modules

| Module | Validation |
| --- | --- |
| `validateAdversarialContract` | Tracker-aware list waiver |
| `validateChecklistGate` | Tracker pass-through |

## Fixture: minimal waive tracker

```yaml
steps:
  - slug: sub-adversarial-inquiry-pass
    disposition: not_applicable
    policy: minimal-depth-no-inquiry
```

## Fixture: minimal CITDP (no lists)

```yaml
risk_analysis:
  adversarial_inquiry:
    depth_tier: minimal
    gate_policy: advisory
```

## SC mapping (unit)

| Case | Phase | Tracker | Depth | Expected | SC |
| --- | --- | --- | --- | --- | --- |
| Waiver pre | pre_implementation | waive | minimal | `allowed: true`, no four `missing_*` | SC-MPGW-01 |
| Waiver verify | verification | waive + slim slugs | minimal | `allowed: true` (adversarial) | SC-MPGW-02 |
| Waiver close_out | close_out | waive | minimal | no adversarial `missing_*` | SC-MPGW-03 |
| No stub | verification | absent stub | minimal | four `missing_*` | SC-MPGW-04 |
| Integrated | verification | waive stub present | integrated | existing blockers (e.g. pairing) | SC-MPGW-05 |

**Note:** SC-MPGW-03 may still fail other close_out checks in partial fixtures — assert adversarial diagnostics only.

## SC-MPGW-06 (MCP)

Extend `checklist-gate-mcp.test.ts`: minimal CITDP without fabricated lists + waive tracker → `allowed: true`.

## SC-MPGW-07 (live appendix)

After built MCP deployed to subject client path or store CLI against 1794981051:

- Load `tied-project/working/REQ-SEMVER_COMPARATOR/checklist-tracker.yaml`
- Load `tied-project/citdp/CITDP-REQ-SEMVER_COMPARATOR.yaml`
- `tied_checklist_gate_validate` phases `verification` and `close_out`
- Expect `allowed: true` for adversarial list class (other gaps documented separately)

## Commands

```bash
cd mcp-server && npx tsx --test src/checklist-validator.test.ts src/tools/checklist-gate-mcp.test.ts
```

## RED → GREEN order

1. Negative SC-MPGW-04, SC-MPGW-05 (lock regressions).
2. Positive SC-MPGW-01..03.
3. MCP SC-MPGW-06.
4. Live SC-MPGW-07 (build-plan close-out wave, optional).