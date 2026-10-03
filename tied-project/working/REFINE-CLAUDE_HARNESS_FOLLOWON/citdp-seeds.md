# CITDP draft seeds (superseded)

**Superseded 2026-09-23** by persisted records:

- `tied/citdp/CITDP-REQ-TIED_CLAUDE_LIVE_DRIVER.yaml`
- `tied/citdp/CITDP-REQ-TIED_CLAUDE_BOOTSTRAP_OPS.yaml`

Kept for history only. Do not treat this file as authoritative.

## CITDP-REQ-TIED_CLAUDE_LIVE_DRIVER (seed)

```yaml
record_identity:
  change_request_id: REQ-TIED_CLAUDE_LIVE_DRIVER
  title: Live Claude AgentDriver and stream oracles
  profile_depth: integrated   # evidence-chain; may be not_measured initially
  gate_policy: advisory
risk_analysis:
  adversarial_inquiry:
    depth_tier: integrated
    prior_depth_tier: null
    gate_policy: advisory
    eligibility_triggers_matched:
      - external_cli_subprocess
      - network_adjacent_operator_tooling
    # If Mode B TS unsupported: populate depth_change_waiver / integrated_waiver — do not silent-minimal
change_definition:
  depends_on:
    - REQ-TIED_CLAUDE_HARNESS
    - REQ-GOAGENT-AGENT-EXECUTOR
  leap_parent_note: >
    Parent SC-CLAUDE-P2-AGENTSTREAM live checklist ownership moves to this REQ via related_to;
    do not silently rewrite closed parent Tracker/SC text.
proof_boundaries:
  - No live Claude subprocess in CI for v1
  - Oracle directory mcp-server/packages/agentstream/fixtures/claude/
```

## CITDP-REQ-TIED_CLAUDE_BOOTSTRAP_OPS (seed)

```yaml
record_identity:
  change_request_id: REQ-TIED_CLAUDE_BOOTSTRAP_OPS
  title: Claude bootstrap Windows CI, symlink, ergonomics, comparison doc
  profile_depth: integrated
  gate_policy: advisory
risk_analysis:
  adversarial_inquiry:
    depth_tier: integrated
    prior_depth_tier: null
    gate_policy: advisory
    eligibility_triggers_matched:
      - persistence
      - ci_artifact_claims
migration_phases:
  - phase: B1
    name: Windows CI Claude copy proof
    acceptance: windows-bootstrap-smoke asserts .claude/skills/ and .mcp.json
  - phase: B2
    name: Symlink opt-in unlock
    acceptance: windows_copy_proven_in_ci required; else SYMLINK_WITHOUT_CI_WINDOWS_PROOF
  - phase: B3
    name: Optional skills/ re-root
    acceptance: ARCH + both harnesses + Windows; deferrable
  - phase: B4
    name: Adherence hook spike
    acceptance: bridge or not_applicable receipt
  - phase: B5
    name: Comparison doc Current refresh
    acceptance: stale Current claims removed; A/B table present
```
