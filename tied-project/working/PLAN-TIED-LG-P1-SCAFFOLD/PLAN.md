# PLAN-TIED-LG-P1-SCAFFOLD

| Field | Value |
| --- | --- |
| **Program wave** | P1 — scaffold and MCP adapter |
| **Parent** | [PLAN-TIED-LANGGRAPH-ORCHESTRATION](../PLAN-TIED-LANGGRAPH-ORCHESTRATION/PLAN.md) |
| **Phased spec** | [docs/langgraph/tied-langgraph-orchestration-plan.md](../../../docs/langgraph/tied-langgraph-orchestration-plan.md) § Phase 1 |
| **Sponsor authority** | [sponsor-authority-p1-scaffold-20261012.md](../PLAN-TIED-LANGGRAPH-ORCHESTRATION/evidence/sponsor-authority-p1-scaffold-20261012.md) |
| **CITDP** | [CITDP-PLAN-TIED-LG-P1-SCAFFOLD.yaml](../../citdp/CITDP-PLAN-TIED-LG-P1-SCAFFOLD.yaml) |
| **Exit** | `pytest` green under `tools/langgraph-pilot/tests/` |
| **Status** | Scaffold complete (2026-10-12) — verification/close_out deferred |

## Scope

Materialize `tools/langgraph-pilot/` (RunState v0, MCP adapter, ping graph + SQLite checkpoint) with unit tests using mocked MCP JSON-RPC. No fixture client work; no stdd `REQ-BOUNDED_WORKER_POOL` product code.
