# test-strategy — PLAN-TIED-LG-P2-EVIDENCE

**Date:** 2026-10-12

| Layer | File (planned) | Behavior |
| --- | --- | --- |
| Unit | `tests/test_envelope_routing.py` | Mock validate responses → `continue` / `collect_more` / `escalate` |
| Unit | `tests/test_run_ledger.py` | Observation append, sha256 fields |
| Unit | `tests/test_staleness_policy.py` | `candidate_commit` mismatch → invalid + repair route |
| Fixture | `tests/fixtures/envelope-complete-slice.v1.json` | Synthetic complete slice; 0 error gaps when validated (mock or static checker) |

**RED order (implement):** ledger schema → envelope wrapper → routing →
staleness → mocked composition test. Validate each module independently
before the composition seam.

**CI:** mocked MCP only; no live envelope against production tree.

**Acceptance boundary:** error-severity or malformed gaps must fail closed;
warnings may route to `collect_more`, and only a complete fixture with zero
error-severity gaps may route to `continue`.
