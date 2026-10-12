"""Request evidence envelope MCP adapter for the LangGraph pilot."""

from __future__ import annotations

from typing import Any

from tied_langgraph.mcp_client import McpClient

ENVELOPE_TOOL_NAMES = frozenset(
    {
        "request_evidence_envelope_build",
        "request_evidence_envelope_validate",
    }
)


class EnvelopeRequestTokenError(ValueError):
    """Envelope MCP call used a request_token that does not match the run."""


def assert_request_token(*, expected: str, arguments: dict[str, Any]) -> None:
    token = arguments.get("request_token")
    if token != expected:
        raise EnvelopeRequestTokenError(
            f"expected request_token {expected!r}, got {token!r}",
        )


def error_gap_count(envelope_or_validate: dict[str, Any]) -> int:
    """Count gaps with severity error in a validate payload or envelope document."""
    gaps = envelope_or_validate.get("gaps")
    if gaps is None and isinstance(envelope_or_validate.get("envelope"), dict):
        gaps = envelope_or_validate["envelope"].get("gaps")
    if not gaps:
        return 0
    return sum(1 for gap in gaps if isinstance(gap, dict) and gap.get("severity") == "error")


class EnvelopeClient:
    """Thin wrapper over McpClient for envelope build/validate tools."""

    def __init__(self, client: McpClient, *, request_token: str) -> None:
        self._client = client
        self._request_token = request_token

    def build(self, arguments: dict[str, Any] | None = None) -> dict[str, Any]:
        payload = {"request_token": self._request_token, **(arguments or {})}
        assert_request_token(expected=self._request_token, arguments=payload)
        return self._client.call_tool("request_evidence_envelope_build", payload)

    def validate(self, arguments: dict[str, Any] | None = None) -> dict[str, Any]:
        payload = {"request_token": self._request_token, **(arguments or {})}
        assert_request_token(expected=self._request_token, arguments=payload)
        return self._client.call_tool("request_evidence_envelope_validate", payload)


def envelope_mcp_allowlist(base: frozenset[str] | None) -> frozenset[str]:
    """Extend read-only scaffold allowlist with envelope tools when needed."""
    merged = set(base or ())
    merged.update(ENVELOPE_TOOL_NAMES)
    return frozenset(merged)
