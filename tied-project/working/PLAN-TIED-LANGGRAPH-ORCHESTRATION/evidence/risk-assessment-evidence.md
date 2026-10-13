# risk-assessment — PLAN-TIED-LANGGRAPH-ORCHESTRATION

**Date:** 2026-10-12 · **depth_tier:** minimal · **gate_policy:** advisory

## Consequence ladder

| Decision | Rung | Disposition |
| --- | --- | --- |
| Keep stdd BOUNDED_WORKER_POOL for future port | Costly (scope) | Sponsor confirmed 2026-10-12 build-plan |
| P1 scaffold (pilot + MCP) | Costly | Gated — separate sponsor-authority artifact |
| Fixture vs stdd REQ confusion | Costly if ignored | Charter dual-track contract |
| Autonomous runs + post-hoc audit | Reversible until P7 | Recorded in charter |
| Wrong TIED_BASE_PATH on MCP writes | Costly | One window per repo; charter policy |

## Adversarial notes

Plan-only `p0_enrollment_complete` must not authorize RED or P1 code. P1 must not inherit minimal depth without `prior_depth_tier`.
