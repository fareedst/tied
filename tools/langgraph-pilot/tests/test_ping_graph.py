"""[PLAN-TIED-LG-P1-SCAFFOLD] Ping graph updates RunState and records MCP result."""

from __future__ import annotations

import json
from pathlib import Path

from tied_langgraph.graphs.project import build_ping_graph
from tied_langgraph.mcp_client import McpClient, McpTransport
from tied_langgraph.state import RunState


class PingTransport(McpTransport):
    def request(self, method: str, params: dict | None = None) -> dict:
        if method == "initialize":
            return {
                "protocolVersion": "2024-11-05",
                "capabilities": {},
                "serverInfo": {"name": "mock", "version": "0"},
            }
        if method == "notifications/initialized":
            return {}
        if method == "tools/call":
            name = (params or {}).get("name")
            if name == "tied_config_get_base_path":
                body = {"base_path": "/mock/tied-project", "ok": True}
                return {"content": [{"type": "text", "text": json.dumps(body)}]}
        raise AssertionError(method)


def test_ping_graph_updates_state_and_checkpoint(tmp_path: Path) -> None:
    run_dir = tmp_path / "run-1"
    run_dir.mkdir()
    client = McpClient(transport=PingTransport(), read_only=True)
    graph = build_ping_graph(client=client, run_directory=run_dir)
    initial: RunState = {
        "run_id": "run-1",
        "request_token": "PLAN-TIED-LG-P1-SCAFFOLD",
        "policy_version": "v0",
        "baseline_commit": None,
        "candidate_commit": None,
        "checklist_vars": {},
        "evidence_refs": {},
        "mcp_last_result": None,
        "checkpoint_path": None,
    }
    final = graph.invoke(initial)
    assert final["mcp_last_result"]["base_path"] == "/mock/tied-project"
    assert final["checkpoint_path"] is not None
    assert Path(final["checkpoint_path"]).exists()
