# Live gate replay fixture — 1794984015 (SC-CGH-06)

**Client:** `/Users/fareed/Documents/dev/test/1794984015-wf-agentstream-wf-01-claude-claudehaiku55low`  
**Product REQ:** `REQ-SEMVER_COMPARATOR`  
**Use:** SC-CGH-06 after store MCP build (post-CGH)

| Artifact | Path (client) | Frozen copy in store |
| --- | --- | --- |
| Product CITDP | `tied-project/citdp/CITDP-REQ-SEMVER_COMPARATOR.yaml` | [../fixtures/product-citdp-1794984015.yaml](../fixtures/product-citdp-1794984015.yaml) |
| Tracker | `tied-project/working/REQ-SEMVER_COMPARATOR/checklist-tracker.yaml` | [../fixtures/disposable-tracker-1794984015.yaml](../fixtures/disposable-tracker-1794984015.yaml) |

**Pre-fix symptom:** `tied_gate_check` with path-based product citdp → `malformed_citdp:adversarial_inquiry` at close-out despite inline gate citdp passing in turn 3.

**Post-fix expectation:** Hydrated path-based gate → verification and close_out `allowed: true` with MPGW list waiver when tracker stub present.