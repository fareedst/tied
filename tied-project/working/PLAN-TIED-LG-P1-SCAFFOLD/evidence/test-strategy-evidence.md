# test-strategy — PLAN-TIED-LG-P1-SCAFFOLD

**Date:** 2026-10-12

| Layer | Location | Notes |
| --- | --- | --- |
| Unit (RED first) | `tools/langgraph-pilot/tests/test_mcp_adapter_contract.py` | Mock JSON-RPC transport; `tied_config_get_base_path` happy path |
| Unit | `tools/langgraph-pilot/tests/test_ping_graph.py` | Ping node updates state; checkpoint writer invoked |
| Live MCP | Manual / optional | README documents `tied-cli.sh` smoke; not required in CI |

**Command:** `cd tools/langgraph-pilot && uv run pytest` (or `python -m pytest` after editable install).
