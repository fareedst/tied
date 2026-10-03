# E0 → E4 structural comparison

**Request:** `REQ-TIED-3.0-ALIGNMENT-SYNC`  
**Post-alignment commit:** `1798c4424d4ef6ea29ce4b95caee51cc9f1fdc75`  
**Structural profile:** `profiles/nsync-post-alignment.v1.json`  
**Executable profile:** `profiles/nsync-post-alignment-exec.v1.json`

## Structural validator deltas

| Validator | E0 pilot | E4 structural profile | Direct pinned snapshot |
|---|---:|---:|---:|
| `binding_inventory_validate` | true | true | true |
| `pseudocode_validate` | true | true | true (48 sidecars) |
| `test_adequacy_validate` | true | true | true |
| `tied_cycles` | true | false | requirements `ok: true`; implementation `ok: false` |
| `tied_validate_consistency` | false | true | true |
| `traceability_gap_report` | false | true | true |

The profile `tied_cycles` row is false because the live validator checks both
the requirements and implementation graphs. The direct requirements-graph
signal is `{"ok":true,"has_cycles":false}`; the implementation graph still
contains one cycle. The profile graph reports `cycles: 0` for the requirements
graph, so these are distinct signals rather than a contradiction.

## Supplemental counts

| Measure | E0 pilot | E4 observed |
|---|---:|---:|
| Pseudo-code sidecars | 0 | **48** |
| Binding inventory rows under `tied/` | not recorded | **5** |
| Executable manifest commands | 0 | **4**, all recorded passed |

The attached manifest reports commit `ddcfaf7fe26812f979a68225851638fa9f9bbabc`,
which differs from the post-alignment analysis pin. Its command results are
therefore executable evidence with a stale-commit residual risk, not proof that
those commands ran against the E4 pin.

## Proof boundaries and conclusion

The structural arm shows improved consistency and traceability, and the
sidecar population is now visible. These validators prove TIED structural
properties only; they do not prove product correctness, defect rates, security,
performance, or user-facing behavior. The executable arm is reported separately
because its `executable_behavior` denominator and provenance are not comparable
to the Phase 1 manifest-free arm.
