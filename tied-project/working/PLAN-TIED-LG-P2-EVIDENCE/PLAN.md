# PLAN-TIED-LG-P2-EVIDENCE

| Field | Value |
| --- | --- |
| **Program wave** | P2 — evidence wiring |
| **Parent** | [PLAN-TIED-LANGGRAPH-ORCHESTRATION](../PLAN-TIED-LANGGRAPH-ORCHESTRATION/PLAN.md) |
| **Linked plan** | [docs/langgraph/plan-tied-lg-p2-evidence-wiring.md](../../../docs/langgraph/plan-tied-lg-p2-evidence-wiring.md) |
| **Phased spec** | [tied-langgraph-orchestration-plan.md](../../../docs/langgraph/tied-langgraph-orchestration-plan.md) § Phase 2 |
| **Prerequisite** | [PLAN-TIED-LG-P1-SCAFFOLD](../PLAN-TIED-LG-P1-SCAFFOLD/PLAN.md) scaffold complete |
| **CITDP** | [CITDP-PLAN-TIED-LG-P2-EVIDENCE.yaml](../../citdp/CITDP-PLAN-TIED-LG-P2-EVIDENCE.yaml) |
| **Status** | Implement + machine close-out complete (2026-10-12) — commit deferred |
| **Exit** | Fixture envelope validate: 0 **error** gaps; all module tests green |

## Authority

Sequential program wave after P1 exit; no separate P2 sponsor artifact is
required beyond [charter](../PLAN-TIED-LANGGRAPH-ORCHESTRATION/evidence/charter.md)
and P1 completion. This is pilot-local and introduces no project TIED tokens.

## Next agent

1. **`@build-plan`** on this folder: RED tests → independent
   ledger/envelope/routing/staleness validation → mocked composition → pytest.
2. Before RED, run a fresh integrated **implement**
   `pre_implementation` gate on the authoritative Tracker and CITDP. Do not
   reuse the plan-only receipt.
3. If the gate is blocked, repair phase-specific evidence and rerun it; the
   current envelope's blocking diagnostic gaps are not an acceptance result.

Handoff: [evidence/session-handoff.md](./evidence/session-handoff.md)

## Module and acceptance contract

- `ledger.py`: append-only, schema-valid observations confined to the run
  directory; test path escape and required provenance fields.
- `envelope.py`: request-token/MCP adapter only; test forwarding, payload
  shape, and tool failure propagation.
- `graphs/project.py`: pure gap-to-route policy; error severity always routes
  to `escalate`.
- `policies/staleness.py`: equal revisions remain valid; mismatched revisions
  invalidate and route to repair.
- Synthetic fixture and mocked MCP composition are required; live MCP and the
  P3 fixture client remain out of scope.
