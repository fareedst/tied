# E0 → E4 structural comparison

**Request:** `REQ-TIED-3.0-ALIGNMENT-SYNC`  
**Post-alignment commit:** `1a79d55f14f6ee842621b1f8f0bff0e703dd0450`  
**Structural profile:** `profiles/indescript-post-alignment.v1.json`  
**Executable profile:** `profiles/indescript-post-alignment-exec.v1.json`

## Structural validator deltas

| Validator | E0 pilot | E4 structural profile | Direct pinned snapshot |
|---|---:|---:|---:|
| `binding_inventory_validate` | true | true | true |
| `pseudocode_validate` | true | true | false in batch strict snapshot; 184 sidecars |
| `test_adequacy_validate` | true | true | true |
| `tied_cycles` | false | false | requirements `ok: true`; implementation `ok: false` |
| `tied_validate_consistency` | true | true | true |
| `traceability_gap_report` | false | true | true |

The profile `tied_cycles` row remains false because the live validator checks
both the requirements and implementation graphs. The direct requirements-graph
signal is `{"ok":true,"has_cycles":false}`; the implementation graph still
contains one cycle. The profile graph reports `cycles: 0` for the requirements
graph. The batch strict pseudo-code snapshot also returned false despite the
profile pass, so that validator result remains a reproducibility residual.

## Supplemental counts

| Measure | E0 pilot | E4 observed |
|---|---:|---:|
| Pseudo-code sidecars | 184 | **184** |
| Binding inventory rows under `tied/` | not recorded | **0 / not present** |
| Executable manifest commands | 0 | **4**, all recorded passed |

The attached manifest matches the post-alignment pin and records successful
Swift build/test and TIED consistency commands. The evidence is scoped: the
alignment denominator is 16, not a repo-wide behavioral population. The source
client worktree had pre-existing documentation changes; the analysis itself was
performed in the isolated pinned worktree.

## Proof boundaries and conclusion

Traceability improved from false to true while the sidecar population remained
stable. These validators prove TIED structural properties only; they do not
prove product correctness, defect rates, remote security, performance,
resilience, or user-facing behavior. The executable arm is reported separately
because its `executable_behavior` denominator and provenance are not comparable
to the Phase 1 manifest-free arm.
