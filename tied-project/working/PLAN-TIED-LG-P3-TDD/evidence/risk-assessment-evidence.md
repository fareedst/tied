# risk-assessment — PLAN-TIED-LG-P3-TDD

**Date:** 2026-10-12

| Risk | Ladder | Mitigation |
| --- | --- | --- |
| Implement without valid RED | Costly | `ImplementAllowed => ValidRedEvidence`; unit matrix locks policy |
| Test weakening to force green | Costly | Heuristics + ledger waiver object; fail without waiver |
| CI depends on sponsor fixture path | Reversible | Hermetic `tdd-mini-repo` default; charter path integration optional |
| Subprocess escape / cwd bleed | Reversible | Runner timeout, fixed cwd, observations under run_directory |
| False GREEN on wrong commit | Costly | Record `baseline_commit` / `candidate_commit` on each observation |

**Triggers:** external_input (test runner I/O), persistence (ledger) → **integrated**.

**Sponsor default-proceed:** Hermetic CI fixture and mocked runner unit tests proceed without clarification. Costly choices stay fail-closed on RED validity and test-weakening without waiver.
