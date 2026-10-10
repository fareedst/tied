# risk-assessment-evidence — PLAN-TIED-QMM-W2-CONFORMANCE-EFFECTIVENESS

**Date:** 2026-10-10

## Consequence ladder

| Decision | Class | Notes |
| --- | --- | --- |
| Plan-only doc pass | Reversible | No product tokens |
| Gate-blocking on verification/close_out | **Costly** | Sponsor-selected implement direction; CITDP-scoped only |
| Schema v1 extend vs v2 bump | Costly at implement | Backward compatibility for W1 validators |
| Global gate hook without experiment linkage | Costly / forbidden | Counterexample in CITDP |
| depth_tier below integrated on MCP+gate | Costly | Owner, expiry, waiver in implement CITDP |

## Risks (plan-only)

- Plan-only **w2_scope: plan_only** misread as implement authorization → mitigated by sponsor authority file + child plan §2.
- Minimal depth inherited into implement → mitigated by child plan §4–§5 and CITDP success criteria.

## depth_tier

`minimal` for plan-only only. Implement sketch: `integrated`, `gate_policy: per_citdp`.
