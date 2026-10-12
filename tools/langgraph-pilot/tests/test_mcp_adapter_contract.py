"""[PLAN-TIED-LG-P1-SCAFFOLD] MCP adapter contract tests with mocked transport."""

from __future__ import annotations

import json

import pytest

from tied_langgraph.mcp_client import McpClient, McpTransport


class MockTransport(McpTransport):
    def __init__(self, responses: dict[str, object]) -> None:
        self._responses = responses
        self.calls: list[tuple[str, dict]] = []

    def request(self, method: str, params: dict | None = None) -> dict:
        self.calls.append((method, params or {}))
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
            if name not in self._responses:
                raise KeyError(name)
            result = self._responses[name]
            return {"content": [{"type": "text", "text": json.dumps(result)}]}
        raise AssertionError(f"unexpected method {method}")


def test_tied_config_get_base_path_smoke() -> None:
    expected = {"base_path": "/tmp/tied-project", "mode": "store"}
    transport = MockTransport({"tied_config_get_base_path": expected})
    client = McpClient(transport=transport)
    out = client.call_tool("tied_config_get_base_path", {})
    assert out == expected
    assert any(c[0] == "tools/call" for c in transport.calls)


def test_read_only_allowlist_rejects_unknown_tool() -> None:
    transport = MockTransport({})
    client = McpClient(transport=transport, read_only=True)
    with pytest.raises(ValueError, match="not in read-only allowlist"):
        client.call_tool("yaml_index_insert", {})


def test_yaml_index_read_allowed_in_read_only_mode() -> None:
    payload = {"tokens": ["REQ-EXAMPLE"]}
    transport = MockTransport({"yaml_index_read": payload})
    client = McpClient(transport=transport, read_only=True)
    assert client.call_tool("yaml_index_read", {"index": "requirements"}) == payload
