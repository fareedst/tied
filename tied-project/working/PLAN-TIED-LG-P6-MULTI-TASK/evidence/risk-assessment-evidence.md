# risk-assessment — PLAN-TIED-LG-P6-MULTI-TASK

**depth_tier:** integrated · **gate_policy:** per_citdp

**Costly choices (defaults):**

| Decision | Default | Ladder |
| --- | --- | --- |
| `max_parallel` in CI | **2** | Reversible before build-plan; raising requires CITDP note |
| Worktree isolation | **Mandatory** per Send worker | Costly if shared worktree allowed |
| Merge without regression | **Forbidden** | Fail-closed merge node |

**Triggers:** concurrency (Send), persistence (ledger, trackers), external_input (MCP leap proposal).

**Residual:** P7 owns agentstream A/B and sponsor disposition; optional live merge smoke deferred to sponsor session.
