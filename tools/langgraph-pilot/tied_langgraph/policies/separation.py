"""MCP role separation — implement vs verification — [PLAN-TIED-LG-P4-ACCEPTANCE]."""

from __future__ import annotations

from typing import Any

from tied_langgraph.envelope import ENVELOPE_TOOL_NAMES, envelope_mcp_allowlist
from tied_langgraph.mcp_client import McpClient, READ_ONLY_SCAFFOLD_TOOLS

_IMPLEMENT_EXTRA = frozenset({"yaml_index_read"})
_VERIFICATION_EXTRA = frozenset(
    {
        "tied_checklist_gate_validate",
        "pseudocode_validate",
        "tied_verify",
        "request_evidence_envelope_validate",
    }
)

IMPLEMENT_MCP_ALLOWLIST = frozenset(READ_ONLY_SCAFFOLD_TOOLS | _IMPLEMENT_EXTRA)

VERIFICATION_MCP_ALLOWLIST = envelope_mcp_allowlist(
    READ_ONLY_SCAFFOLD_TOOLS | _IMPLEMENT_EXTRA | _VERIFICATION_EXTRA | ENVELOPE_TOOL_NAMES,
)

_FORBIDDEN_FOR_IMPLEMENT = frozenset(
    {
        "request_evidence_envelope_build",
        "request_evidence_envelope_validate",
        "tied_checklist_gate_validate",
        "yaml_index_insert",
        "yaml_index_update",
    }
)


def assert_implement_may_call(tool_name: str) -> None:
    if tool_name in _FORBIDDEN_FOR_IMPLEMENT:
        raise ValueError(f"implement role cannot call {tool_name!r}")


class RoleBoundClient:
    """Wrap McpClient with role checks before delegation."""

    def __init__(self, client: McpClient, *, role: str) -> None:
        self._client = client
        self._role = role

    def call_tool(self, name: str, arguments: dict[str, Any]) -> dict[str, Any]:
        if self._role == "implement":
            assert_implement_may_call(name)
        return self._client.call_tool(name, arguments)


def implement_client(client: McpClient) -> RoleBoundClient:
    return RoleBoundClient(client, role="implement")


def verification_client(client: McpClient) -> RoleBoundClient:
    return RoleBoundClient(client, role="verification")
