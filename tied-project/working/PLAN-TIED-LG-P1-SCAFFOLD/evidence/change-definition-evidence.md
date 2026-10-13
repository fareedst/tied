# change-definition — PLAN-TIED-LG-P1-SCAFFOLD

**Date:** 2026-10-12

| | |
| --- | --- |
| **Current** | No `tools/langgraph-pilot/`; LangGraph orchestration is documentation-only. |
| **Desired** | Importable pilot package with MCP adapter, RunState v0, ping graph, SQLite checkpoint, mocked unit tests. |
| **Non-goals** | Fixture `1791767366` implement; stdd BOUNDED_WORKER_POOL product code; methodology YAML edits. |
| **Success** | `pytest` green in `tools/langgraph-pilot/tests/`; no behavior change outside pilot tree. |
