"""Ping graph and envelope-driven routing helpers (P2 evidence wiring)."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from langgraph.graph import END, START, StateGraph

from tied_langgraph.mcp_client import McpClient
from tied_langgraph.policies.staleness import staleness_route
from tied_langgraph.routing import GraphRoute, route_from_validate_payload
from tied_langgraph.state import RunState


def decide_evidence_transition(
    *,
    validate_payload: dict[str, Any],
    candidate_commit: str | None,
    evidence_commit: str | None,
) -> GraphRoute | str:
    """Apply staleness check before gap severity routing."""
    stale_route = staleness_route(
        candidate_commit=candidate_commit,
        evidence_commit=evidence_commit,
    )
    if stale_route == "repair":
        return "repair"
    return route_from_validate_payload(validate_payload)


def build_ping_graph(*, client: McpClient, run_directory: Path) -> Any:
    run_directory.mkdir(parents=True, exist_ok=True)

    def ping_node(state: RunState) -> RunState:
        result = client.call_tool("tied_config_get_base_path", {})
        checkpoint = run_directory / f"{state['run_id']}-checkpoint.json"
        checkpoint.write_text(json.dumps({"run_id": state["run_id"], "mcp": result}), encoding="utf-8")
        updated = dict(state)
        updated["mcp_last_result"] = result
        updated["checkpoint_path"] = str(checkpoint)
        return updated  # type: ignore[return-value]

    graph = StateGraph(RunState)
    graph.add_node("ping", ping_node)
    graph.add_edge(START, "ping")
    graph.add_edge("ping", END)
    return graph.compile()
