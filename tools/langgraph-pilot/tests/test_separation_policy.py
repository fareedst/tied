"""[PLAN-TIED-LG-P4-ACCEPTANCE] Separation of duties for MCP tool roles."""

import json

import pytest

from tied_langgraph.mcp_client import McpClient, McpTransport
from tied_langgraph.policies.separation import (
    IMPLEMENT_MCP_ALLOWLIST,
    VERIFICATION_MCP_ALLOWLIST,
    implement_client,
    verification_client,
)


class MockTransport(McpTransport):
    def __init__(self, responses: dict[str, object]) -> None:
        self._responses = responses

    def request(self, method: str, params: dict | None = None) -> dict:
        if method == "initialize":
            return {"protocolVersion": "2024-11-05", "capabilities": {}, "serverInfo": {"name": "mock", "version": "0"}}
        if method == "notifications/initialized":
            return {}
        if method == "tools/call":
            name = (params or {}).get("name")
            result = self._responses[name]
            return {"content": [{"type": "text", "text": json.dumps(result)}]}
        raise AssertionError(method)


def test_implement_allowlist_excludes_envelope_mutators() -> None:
    assert "request_evidence_envelope_build" not in IMPLEMENT_MCP_ALLOWLIST
    assert "request_evidence_envelope_build" in VERIFICATION_MCP_ALLOWLIST


def test_implement_client_rejects_envelope_build() -> None:
    transport = MockTransport({})
    client = implement_client(McpClient(transport=transport, read_only=True, allowlist=IMPLEMENT_MCP_ALLOWLIST))
    with pytest.raises(ValueError, match="implement role"):
        client.call_tool("request_evidence_envelope_build", {"request_token": "x"})


def test_verification_client_allows_gate_validate() -> None:
    transport = MockTransport({"tied_checklist_gate_validate": {"allowed": True}})
    base = McpClient(transport=transport, read_only=True, allowlist=VERIFICATION_MCP_ALLOWLIST)
    client = verification_client(base)
    result = client.call_tool("tied_checklist_gate_validate", {"phase": "verification"})
    assert result["allowed"] is True
