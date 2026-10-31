"""Verification subgraph — evidence validate, optional MCP gate, acceptance route."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from langgraph.graph import END, START, StateGraph

from tied_langgraph.policies.acceptance import AcceptanceRoute, acceptance_gate
from tied_langgraph.state import RunState
from tied_langgraph.verification_evidence import EvidenceSchemaError, validate_evidence_for_acceptance


def build_verification_graph(
    *,
    run_directory: Path,
    gate_allowed: bool = True,
    skip_mcp_gate: bool = False,
    mcp_gate_call: Any | None = None,
) -> Any:
    """Build verification subgraph; only this graph writes acceptance_route."""
    run_directory.mkdir(parents=True, exist_ok=True)

    def schema_validate_node(state: RunState) -> RunState:
        updated = dict(state)
        evidence = state.get("evidence_refs") or {}
        try:
            validate_evidence_for_acceptance(evidence)
            updated["checklist_vars"] = {
                **(state.get("checklist_vars") or {}),
                "schema_valid": True,
            }
        except EvidenceSchemaError as exc:
            updated["acceptance_route"] = AcceptanceRoute.REPAIR.value
            updated["verification_decision_written"] = True
            updated["checklist_vars"] = {
                **(state.get("checklist_vars") or {}),
                "schema_valid": False,
                "schema_error": str(exc),
            }
        return updated  # type: ignore[return-value]

    def mcp_gate_node(state: RunState) -> RunState:
        if state.get("acceptance_route"):
            return state
        if skip_mcp_gate:
            return state
        if not gate_allowed:
            updated = dict(state)
            updated["acceptance_route"] = AcceptanceRoute.ESCALATE.value
            updated["verification_decision_written"] = True
            return updated  # type: ignore[return-value]
        if mcp_gate_call is not None:
            payload = mcp_gate_call(state)
            if not payload.get("allowed", False):
                updated = dict(state)
                updated["acceptance_route"] = AcceptanceRoute.REPAIR.value
                updated["verification_decision_written"] = True
                return updated  # type: ignore[return-value]
        return state

    def acceptance_node(state: RunState) -> RunState:
        if state.get("verification_decision_written"):
            return state
        evidence = state.get("evidence_refs") or {}
        vars_ = state.get("checklist_vars") or {}
        blockers = vars_.get("unresolved_blockers") or []
        if not isinstance(blockers, list):
            blockers = [str(blockers)]
        route = acceptance_gate(
            evidence=evidence,
            candidate_commit=str(state.get("candidate_commit") or ""),
            requirements_covered=bool(vars_.get("requirements_covered", True)),
            unresolved_blockers=[str(b) for b in blockers],
        )
        updated = dict(state)
        updated["acceptance_route"] = route.value
        updated["verification_decision_written"] = True
        decision_path = run_directory / f"{state['run_id']}-verification-decision.json"
        decision_path.write_text(
            json.dumps({"acceptance_route": route.value, "run_id": state["run_id"]}),
            encoding="utf-8",
        )
        updated["checkpoint_path"] = str(decision_path)
        return updated  # type: ignore[return-value]

    def route_after_schema(state: RunState) -> str:
        if state.get("acceptance_route"):
            return END
        return "mcp_gate"

    graph = StateGraph(RunState)
    graph.add_node("schema_validate", schema_validate_node)
    graph.add_node("mcp_gate", mcp_gate_node)
    graph.add_node("acceptance", acceptance_node)
    graph.add_edge(START, "schema_validate")
    graph.add_conditional_edges("schema_validate", route_after_schema, {"mcp_gate": "mcp_gate", END: END})
    graph.add_edge("mcp_gate", "acceptance")
    graph.add_edge("acceptance", END)
    return graph.compile()
