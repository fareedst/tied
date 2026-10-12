"""Pure gap-to-route policy for envelope validate results."""

from __future__ import annotations

from typing import Any, Literal

GraphRoute = Literal["continue", "collect_more", "escalate"]


def route_from_gaps(gaps: list[dict[str, Any]] | None) -> GraphRoute:
    """
    Map envelope gaps to graph transitions.

    Error severity or malformed gaps fail closed to escalate.
    Warnings route to collect_more. An empty gap list continues.
    """
    if not gaps:
        return "continue"
    for gap in gaps:
        if not isinstance(gap, dict):
            return "escalate"
        severity = gap.get("severity")
        if severity is None or severity == "":
            return "escalate"
        if severity == "error":
            return "escalate"
    for gap in gaps:
        if gap.get("severity") == "warn":
            return "collect_more"
    return "continue"


def route_from_validate_payload(payload: dict[str, Any]) -> GraphRoute:
    gaps = payload.get("gaps")
    if gaps is None and isinstance(payload.get("envelope"), dict):
        gaps = payload["envelope"].get("gaps")
    if gaps is None:
        return "escalate"
    if not isinstance(gaps, list):
        return "escalate"
    return route_from_gaps(gaps)
