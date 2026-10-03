# E0 → E4 structural comparison

**Request:** `REQ-TIED-3.0-ALIGNMENT-SYNC`  
**Post-alignment commit:** `bc61056fe260bc3831efb5ce7772244339fd1cd6`  
**Structural profile:** `profiles/panorama-post-alignment.v1.json`  
**Executable profile:** `profiles/panorama-post-alignment-exec.v1.json`

## Structural validator deltas

| Validator | E0 pilot | E4 structural profile | Direct pinned snapshot |
|---|---:|---:|---:|
| `binding_inventory_validate` | true | true | true |
| `pseudocode_validate` | true | true | false in batch strict snapshot; 99 sidecars |
| `test_adequacy_validate` | true | true | true |
| `tied_cycles` | true | false | requirements `ok: true`; implementation `ok: false` |
| `tied_validate_consistency` | true | true | true |
| `traceability_gap_report` | false | true | true |

The profile `tied_cycles` row is false because the live validator checks both
the requirements and implementation graphs. The direct requirements-graph
signal is `{"ok":true,"has_cycles":false}`; the implementation graph still
contains one cycle. The profile graph reports `cycles: 0` for the requirements
graph. The batch strict pseudo-code snapshot also returned false despite the
profile pass, so that validator result remains a reproducibility residual.

## Supplemental counts

| Measure | E0 pilot | E4 observed |
|---|---:|---:|
| Pseudo-code sidecars | 99 | **99** |
| Binding inventory rows under `tied/` | not recorded | **0 / not present** |
| Executable manifest commands | 0 | **6**, all recorded passed |

The attached manifest reports commit `29224e949c3f1612c4ddad8b8024004f5d91a777`,
which differs from the post-alignment analysis pin. Its command results are
therefore executable evidence with a stale-commit residual risk, not proof that
those commands ran against the E4 pin.

## Proof boundaries and conclusion

The structural arm improves traceability while preserving consistency and the
sidecar count. These validators prove TIED structural properties only; they do
not prove product correctness, defect rates, security, performance, or
user-facing behavior. The executable arm is reported separately because its
`executable_behavior` denominator and provenance are not comparable to the
Phase 1 manifest-free arm.
