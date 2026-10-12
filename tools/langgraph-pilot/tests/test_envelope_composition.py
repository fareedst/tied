"""[PLAN-TIED-LG-P2-EVIDENCE] Mocked MCP validate to graph route composition."""

from __future__ import annotations

from tied_langgraph.envelope import EnvelopeClient
from tied_langgraph.graphs.project import decide_evidence_transition
from tests.test_mcp_adapter_contract import MockTransport
from tied_langgraph.mcp_client import McpClient


def test_mocked_validate_to_continue_route() -> None:
    validate_payload = {"ok": True, "gaps": []}
    transport = MockTransport({"request_evidence_envelope_validate": validate_payload})
    client = McpClient(transport=transport, read_only=False, allowlist=None)
    envelope = EnvelopeClient(client, request_token="PLAN-FIXTURE")
    result = envelope.validate({})
    route = decide_evidence_transition(
        validate_payload=result,
        candidate_commit="deadbeef",
        evidence_commit="deadbeef",
    )
    assert route == "continue"
    tool_calls = [c for c in transport.calls if c[0] == "tools/call"]
    assert tool_calls
    assert tool_calls[0][1]["arguments"]["request_token"] == "PLAN-FIXTURE"


def test_staleness_routes_repair_before_gap_policy() -> None:
    validate_payload = {"ok": True, "gaps": []}
    route = decide_evidence_transition(
        validate_payload=validate_payload,
        candidate_commit="new",
        evidence_commit="old",
    )
    assert route == "repair"
