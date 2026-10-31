# PLAN-TIED-LG-P4-ACCEPTANCE — Deterministic acceptance and verification subgraph

| Field | Value |
| --- | --- |
| **Program** | [PLAN-TIED-LANGGRAPH-ORCHESTRATION](../../tied-project/working/PLAN-TIED-LANGGRAPH-ORCHESTRATION/PLAN.md) |
| **Wave** | P4 |
| **Working folder** | [tied-project/working/PLAN-TIED-LG-P4-ACCEPTANCE/](../../tied-project/working/PLAN-TIED-LG-P4-ACCEPTANCE/PLAN.md) |
| **Depends on** | P3 TDD subgraph complete (`ebda93d5`) |
| **Phased spec** | [tied-langgraph-orchestration-plan.md](./tied-langgraph-orchestration-plan.md) § Phase 4 |

## Goal

Separate **produce work** nodes from **authorize progress** nodes. A verification subgraph validates evidence shape, optional MCP checklist gates, and routes through a deterministic **acceptance** policy (`repair` | `replan` | `escalate` | `accept`).

## Refined scope and authority

**Pilot-local** slice under `tools/langgraph-pilot/` only. No new stdd `REQ-*`/`ARCH-*`/`IMPL-*` unless sponsor later mints LangGraph tokens. P3 TDD invariants remain; P4 adds **ReviewEvidence** to the acceptance policy per [langgraph-evidence-driven-software-engineering.md](../tools/langgraph-evidence-driven-software-engineering.md) §5.

Fresh **implement** `pre_implementation` gate required before RED; plan-only receipts from a prior refine pass are not reused.

## In scope

1. **`tied_langgraph/policies/acceptance.py`** — `AcceptAllowed => GreenEvidence && RegressionEvidence && ReviewEvidence` (commit-aligned evidence records).
2. **`tied_langgraph/verification_evidence.py`** — required-field and hash/provenance checks on evidence dicts.
3. **`tied_langgraph/graphs/verification.py`** — subgraph: schema validate → optional `tied_checklist_gate_validate` (MCP) → acceptance route; only this subgraph writes `acceptance_route` / verification decision fields.
4. **`tied_langgraph/policies/separation.py`** — implement-role vs verification-role MCP allowlists (implement cannot mutate envelope/ledger via MCP).
5. **Tests** — `test_acceptance_gate.py` mirroring conceptual doc §5 matrix; mocked MCP verification composition.
6. **README** — verification subgraph Mermaid; bounded retry / repair loop note.

## Out of scope

- P5 checklist slice end-to-end.
- Live MCP gate receipts in default CI (optional local smoke only).
- LangGraph human **interrupt** before accept (document hook only).
- Mutating fixture client TIED YAML.

## Implementation sequence

RED-first `@build-plan` order:

1. Acceptance policy unit tests (failing) → `acceptance.py`.
2. Evidence schema validation tests → `verification_evidence.py`.
3. Separation-of-duties allowlist tests → `separation.py`.
4. Verification subgraph tests with mock MCP → `graphs/verification.py`.
5. README + program checklist P4 status update on close-out.

## Acceptance and exit criteria

- Subgraph refuses `accept` when review (or other required) evidence missing or stale vs `candidate_commit`.
- `accept` when fixture evidence fully satisfied and no blockers.
- Default CI: mocked MCP only; one gate receipt path documented for optional local run under working folder evidence.
- Pilot `pytest` green including new policy and subgraph tests.

## References

- [plan-tied-lg-p3-tdd-subgraph.md](./plan-tied-lg-p3-tdd-subgraph.md)
- [langgraph-evidence-driven-software-engineering.md](../tools/langgraph-evidence-driven-software-engineering.md) §5
