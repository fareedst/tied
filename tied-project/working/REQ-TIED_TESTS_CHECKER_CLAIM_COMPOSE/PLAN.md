# REQ-TIED_TESTS_CHECKER_CLAIM_COMPOSE — Wave 3 Phase 1 (Anthropic FV)

**Current implement plan:** [PLAN-refine-phase3.md](./PLAN-refine-phase3.md) (Phase 3 MCM row + envelope advisory — refined 2026-10-26).

**Prior:** [PLAN-refine-phase2.md](./PLAN-refine-phase2.md) (Phase 2 vocab RECORD).

| Field | Value |
| --- | --- |
| **Source** | [anthropic-llm-formal-verification-vs-tied-agent-management.md](../../../docs/comparisons/anthropic-llm-formal-verification-vs-tied-agent-management.md) § Phased recommendations Phase 1 |
| **Change class** | Doc-only compose — no MCP gate authority |
| **profile_depth** | minimal |

## Deliverables

1. [tests-vs-checker-backed-claims.md](../../../tied-bundle/docs/tests-vs-checker-backed-claims.md)
2. [client-development-index.md](../../../tied-bundle/docs/client-development-index.md) Quick reads rows
3. Cross-link in [pseudocode-writing-and-validation.md](../../../tied-bundle/docs/pseudocode-writing-and-validation.md)
4. [tests-checker-claim-compose-doc.test.mjs](../../../tools/bootstrap/lib/tests-checker-claim-compose-doc.test.mjs)
5. Update comparison Phase 1 status to **Done**

## Test

`node --test tools/bootstrap/lib/tests-checker-claim-compose-doc.test.mjs`
