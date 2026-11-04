# LEAP follow-on slice 2 — envelope close-out (pillars I–L)

**Request:** [REQ-CLAUDE_WF03_LIVE_MATRIX_GAPS](../../requirements/REQ-CLAUDE_WF03_LIVE_MATRIX_GAPS.yaml)  
**profile_depth:** `minimal` · **gate_policy:** `advisory`  
**Evidence (frozen, read-only):** client `1793815895-wf-agentstream-wf-03-claude-claudehaiku55`

## Delivered (build-plan)

| Pillar | Summary |
| --- | --- |
| **I** | `buildRequestEvidenceEnvelope` infers `depth_tier` / `gate_policy` via `resolveDepthTierForBackfill` when args omitted; explicit `depth_tier` overrides CITDP. |
| **J** | `traditional-four-phase-agentstream.yaml` turn 4 playbook + `{{HARNESS}}` inventory label; shell expands `{{HARNESS}}`. |
| **K** | `scripts/lib/wf-trial-envelope-depth-check.inc.sh` post-run diagnostic (warn only). |
| **L** | Vocab terms in [agentstream.md](../../vocab/agentstream.md); this PLAN. |

## Operator proof (deferred)

Fresh wf-03 Claude disposable (not `1793815895`): turn 4 `close_out allowed: true`, envelope `blocking_gap_count: 0`.

## References

- [close-out-handoff.md](evidence/close-out-handoff.md) (slice 1)
- Linked Cursor plan: wf03_claude_close-out_leap
