# PLAN-TIED-LG-P3-TDD

| Field | Value |
| --- | --- |
| **Program wave** | P3 — TDD subgraph |
| **Parent** | [PLAN-TIED-LANGGRAPH-ORCHESTRATION](../PLAN-TIED-LANGGRAPH-ORCHESTRATION/PLAN.md) |
| **Linked plan** | [docs/langgraph/plan-tied-lg-p3-tdd-subgraph.md](../../../docs/langgraph/plan-tied-lg-p3-tdd-subgraph.md) |
| **Phased spec** | [tied-langgraph-orchestration-plan.md](../../../docs/langgraph/tied-langgraph-orchestration-plan.md) § Phase 3 |
| **Prerequisite** | [PLAN-TIED-LG-P2-EVIDENCE](../PLAN-TIED-LG-P2-EVIDENCE/PLAN.md) implement + close-out complete |
| **CITDP** | [CITDP-PLAN-TIED-LG-P3-TDD.yaml](../../citdp/CITDP-PLAN-TIED-LG-P3-TDD.yaml) |
| **Fixture client** | `/Users/fareed/Documents/dev/test/1791767366` (charter; optional integration) |
| **Status** | Implement complete (`@build-plan` 2026-10-12) — close-out deferred |
| **Exit** | Hermetic RED→GREEN composition + ledger observations; optional live fixture |

## Authority

Sequential program wave after P2 exit. No separate P3 sponsor artifact beyond [charter](../PLAN-TIED-LANGGRAPH-ORCHESTRATION/evidence/charter.md) and P2 completion. Pilot-local; no project TIED tokens at plan time.

## Next agent

1. **`@build-plan`** on this folder: RED tests → policy modules → subgraph → hermetic composition → pytest.
2. Before RED, run a fresh integrated **implement** `pre_implementation` gate on the authoritative Tracker and CITDP. Do not reuse the plan-only receipt from refine-plan.
3. Record `tied_config_get_base_path` for stdd vs fixture before any MCP write to fixture TIED data.

Handoff: [evidence/session-handoff.md](./evidence/session-handoff.md) (after build-plan / close-out).

## Module and acceptance contract

- `policies/tdd_red.py`: **ValidRedEvidence** vs invalid RED; fail-closed implement gate.
- `policies/test_weakening.py`: skip/deletion heuristics; waiver required to bypass.
- `graphs/task_tdd.py`: RED/GREEN/REFACTOR edges; mock-runner unit tests first.
- `runners/`: subprocess test execution with ledger observations confined to run directory.
- Hermetic `tests/fixtures/tdd-mini-repo/` for CI composition; charter path via `LANGGRAPH_FIXTURE_CLIENT_ROOT` optional.
