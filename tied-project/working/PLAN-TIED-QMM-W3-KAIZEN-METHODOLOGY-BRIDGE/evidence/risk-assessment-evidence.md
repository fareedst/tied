# risk-assessment-evidence — PLAN-TIED-QMM-W3-KAIZEN-METHODOLOGY-BRIDGE

**Date:** 2026-10-10

## Consequence ladder

| Decision | Class | Notes |
| --- | --- | --- |
| Plan-only doc pass | Reversible | No product tokens |
| Explicit MCP only (no auto-bridge) | **Costly — affirmed** | Sponsor-confirmed; implement must preserve |
| Optional v1 `source_feedback_refs` vs v2 bump | Costly at implement | Backward compatibility for W1 validators |
| Bridge store write on invocation | Costly / forbidden | Counterexample in CITDP |
| depth_tier below integrated on MCP | Costly | Owner, expiry, waiver in implement CITDP |

## Risks (plan-only)

- Plan-only **w3_scope: plan_only** misread as implement authorization → mitigated by sponsor authority file + child plan §2.
- Minimal depth inherited into implement → mitigated by child plan §4–§5 and CITDP success criteria.

## depth_tier

`minimal` for plan-only only. Implement sketch: `integrated`, `gate_policy: per_citdp`.
