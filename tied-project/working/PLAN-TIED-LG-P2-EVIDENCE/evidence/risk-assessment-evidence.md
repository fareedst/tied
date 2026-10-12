# risk-assessment — PLAN-TIED-LG-P2-EVIDENCE

**Date:** 2026-10-12

| Risk | Ladder | Mitigation |
| --- | --- | --- |
| Continue on error gaps | Costly | Route `escalate` on error severity; tests lock behavior |
| Wrong request_token in envelope build | Costly | RunState carries `request_token`; preflight in envelope module |
| Ledger path escape | Reversible | Append only under `run_directory` |
| Blocking validate in CI | Reversible | Default mock; blocking policy documented for Phase 4 |

**Triggers:** external_input, persistence → integrated.

**Sponsor default-proceed:** The reversible choices (fixture-only CI,
mocked-MCP default, and module order) proceed without clarification. Costly
choices remain bounded: error-severity routing stays fail-closed, and the
plan-only gate receipt is never promoted to implementation authority.
