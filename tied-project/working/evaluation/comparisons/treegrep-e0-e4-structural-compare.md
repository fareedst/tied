# E0 → E4 structural comparison

**Request:** `REQ-TIED-3.0-ALIGNMENT-SYNC`  
**Post-alignment commit:** `0995ddd8a5208ce5b2a8e838ff66da02a78b66e4`  
**Structural profile:** `profiles/treegrep-post-alignment.v1.json`  
**Executable profile:** `profiles/treegrep-post-alignment-exec.v1.json`

## Structural validator deltas

| Validator | E0 pilot | E4 structural profile | Direct pinned snapshot |
|---|---:|---:|---:|
| `binding_inventory_validate` | true | true | true |
| `pseudocode_validate` | true | true | true (56 sidecars) |
| `test_adequacy_validate` | true | true | true |
| `tied_cycles` | false | false | requirements `ok: true`; implementation `ok: false` |
| `tied_validate_consistency` | true | true | true |
| `traceability_gap_report` | false | true | true |

The profile `tied_cycles` row remains false because the live validator checks
both the requirements and implementation graphs. The direct requirements-graph
signal is `{"ok":true,"has_cycles":false}`; the implementation graph still
contains one cycle. The profile graph reports `cycles: 0` for the requirements
graph, so the row/graph difference is recorded as validator-scope behavior.

## Supplemental counts

| Measure | E0 pilot | E4 observed |
|---|---:|---:|
| Pseudo-code sidecars | 0 | **56** |
| Binding inventory rows under `tied/` | not recorded | **0 / not present** |
| Executable manifest commands | 0 | **3**, all recorded passed |

The executable manifest was regenerated at the E4 pin. Its Ruby regression
suite, binding inventory validation, and TIED consistency command all passed.
The sidecar denominator changed from 0 to 56, so v2 reporting must keep this
profile in its denominator subcohort and must not compare ratios across the
changed denominator.

## Proof boundaries and conclusion

Traceability improved from false to true, and the sidecar migration is visible
in the supplemental counts. These validators prove TIED structural properties
only; they do not prove product correctness, defect rates, security,
performance, or user-facing behavior. The executable arm is reported separately
because its `executable_behavior` denominator and provenance are not comparable
to the Phase 1 manifest-free arm.
