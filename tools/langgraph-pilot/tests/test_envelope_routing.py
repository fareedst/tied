"""[PLAN-TIED-LG-P2-EVIDENCE] Envelope MCP adapter and gap routing."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from tied_langgraph.envelope import (
    EnvelopeClient,
    EnvelopeRequestTokenError,
    assert_request_token,
    error_gap_count,
)
from tied_langgraph.routing import route_from_gaps, route_from_validate_payload
from tests.test_mcp_adapter_contract import MockTransport
from tied_langgraph.mcp_client import McpClient


def test_route_matrix() -> None:
    assert route_from_gaps([]) == "continue"
    assert route_from_gaps([{"severity": "warn", "code": "x"}]) == "collect_more"
    assert route_from_gaps([{"severity": "error", "code": "x"}]) == "escalate"
    assert route_from_gaps([{"code": "missing-severity"}]) == "escalate"


def test_route_from_validate_payload() -> None:
    payload = {"gaps": [{"severity": "error", "code": "blocked"}]}
    assert route_from_validate_payload(payload) == "escalate"


def test_envelope_client_forwards_request_token() -> None:
    calls: list[dict] = []

    class CaptureTransport(MockTransport):
        def request(self, method: str, params: dict | None = None) -> dict:
            if method == "tools/call":
                args = (params or {}).get("arguments") or {}
                calls.append(args)
            return super().request(method, params)

    transport = CaptureTransport(
        {
            "request_evidence_envelope_build": {"ok": True},
            "request_evidence_envelope_validate": {"ok": True, "gaps": []},
        },
    )
    client = McpClient(transport=transport, read_only=False, allowlist=None)
    envelope = EnvelopeClient(client, request_token="PLAN-TOKEN")
    envelope.build({"project_root": "/tmp"})
    envelope.validate({"fail_on_error_gaps": True})
    assert all(c["request_token"] == "PLAN-TOKEN" for c in calls)


def test_assert_request_token_mismatch() -> None:
    with pytest.raises(EnvelopeRequestTokenError):
        assert_request_token(expected="PLAN-A", arguments={"request_token": "PLAN-B"})


def test_fixture_complete_slice_zero_error_gaps() -> None:
    fixture = Path(__file__).parent / "fixtures" / "envelope-complete-slice.v1.json"
    envelope = json.loads(fixture.read_text(encoding="utf-8"))
    assert error_gap_count(envelope) == 0
    assert route_from_validate_payload(envelope) == "collect_more"
