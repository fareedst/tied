# risk-assessment — PLAN-TIED-LG-P5-CHECKLIST

**depth_tier:** integrated · **gate_policy:** per_citdp

**Costly choice (default):** forbid dual-write — agentstream and LangGraph must not update the same tracker file in one REQ (reversible for A/B if separate copies).

**Triggers:** external_input (MCP gates), persistence (tracker YAML).

**Residual:** P6 owns parallel scheduling; optional live envelope patch deferred to implement smoke.
