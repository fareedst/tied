# test-strategy — PLAN-TIED-LG-P3-TDD

**Date:** 2026-10-12

| Layer | File (planned) | Behavior |
| --- | --- | --- |
| Unit | `tests/test_tdd_red_policy.py` | Valid vs invalid RED classification matrix |
| Unit | `tests/test_test_weakening_policy.py` | Skip/deletion vs waiver |
| Unit | `tests/test_task_tdd_graph.py` | Subgraph transitions with mock runner |
| Unit | `tests/test_test_runner_adapter.py` | Subprocess contract (fake `sh -c`) |
| Composition | `tests/test_tdd_hermetic_composition.py` | RED→GREEN on `fixtures/tdd-mini-repo/` |
| Integration (optional) | `tests/test_tdd_fixture_client_integration.py` | Skipped unless `LANGGRAPH_FIXTURE_CLIENT_ROOT` |

**RED order (implement):** `tdd_red` → test-weakening → subgraph (mocked) → runner adapter → hermetic composition → optional integration.

**CI:** hermetic mini-repo + mocks; no live charter path required.

**Acceptance boundary:** invalid RED never enables implement; weakening without waiver blocks green acceptance.
