# PLAN-TIED-LG-P4-ACCEPTANCE

| Field | Value |
| --- | --- |
| **Program wave** | P4 — acceptance gate |
| **Parent** | [PLAN-TIED-LANGGRAPH-ORCHESTRATION](../PLAN-TIED-LANGGRAPH-ORCHESTRATION/PLAN.md) |
| **Linked plan** | [docs/langgraph/plan-tied-lg-p4-acceptance-gate.md](../../../docs/langgraph/plan-tied-lg-p4-acceptance-gate.md) |
| **Phased spec** | [tied-langgraph-orchestration-plan.md](../../../docs/langgraph/tied-langgraph-orchestration-plan.md) § Phase 4 |
| **Prerequisite** | [PLAN-TIED-LG-P3-TDD](../PLAN-TIED-LG-P3-TDD/PLAN.md) implement + close-out complete |
| **CITDP** | [CITDP-PLAN-TIED-LG-P4-ACCEPTANCE.yaml](../../citdp/CITDP-PLAN-TIED-LG-P4-ACCEPTANCE.yaml) |
| **Status** | Implement + machine close-out complete (`@close-out` 2026-10-31) — commit `b72a1e1f` |
| **Exit** | Verification subgraph + acceptance policy; pytest green; optional gate receipt |

## Authority

Sequential program wave after P3 exit. Pilot-local; no project TIED tokens at plan time.

## Module and acceptance contract

- `policies/acceptance.py`: **AcceptAllowed** requires green, regression, static analysis, and independent review evidence at `candidate_commit`.
- `verification_evidence.py`: schema validation before acceptance routing.
- `graphs/verification.py`: only verification subgraph writes `acceptance_route`.
- `policies/separation.py`: implement-role MCP cannot call envelope/gate mutators.

Handoff: [evidence/session-handoff.md](./evidence/session-handoff.md)
