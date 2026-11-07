"""Advisory LEAP proposal hook — [PLAN-TIED-LG-P6-MULTI-TASK]."""

from __future__ import annotations

from typing import Any, Protocol


class LeapClient(Protocol):
    def call_tool(self, name: str, arguments: dict[str, Any]) -> dict[str, Any]:
        ...


def record_architectural_replan(
    *,
    client: LeapClient | None,
    request_token: str,
    summary: str,
    run_id: str,
) -> dict[str, Any] | None:
    """Call tied_leap_proposal_add when client is provided; otherwise no-op."""
    if client is None:
        return None
    payload = {
        "request_token": request_token,
        "title": f"LangGraph replan {run_id}",
        "summary": summary,
        "status": "pending",
    }
    return client.call_tool("tied_leap_proposal_add", payload)
