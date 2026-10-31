"""[PLAN-TIED-LG-P4-ACCEPTANCE] Verification subgraph composition."""

from pathlib import Path

from tied_langgraph.graphs.verification import build_verification_graph
from tied_langgraph.policies.acceptance import AcceptanceRoute


def _full_evidence(commit: str) -> dict[str, dict[str, str]]:
    sha = "f" * 64
    return {
        "green_test": {"result": "passed", "commit": commit, "artifact_sha256": sha},
        "regression_suite": {"result": "passed", "commit": commit, "artifact_sha256": sha},
        "static_analysis": {"result": "passed", "commit": commit, "artifact_sha256": sha},
        "independent_review": {"result": "passed", "commit": commit, "artifact_sha256": sha},
    }


def test_verification_subgraph_routes_accept(tmp_path: Path) -> None:
    graph = build_verification_graph(
        run_directory=tmp_path,
        gate_allowed=True,
        skip_mcp_gate=True,
    )
    state = {
        "run_id": "p4-test",
        "candidate_commit": "deadbeef",
        "evidence_refs": _full_evidence("deadbeef"),
        "requirements_covered": True,
        "checklist_vars": {"unresolved_blockers": []},
    }
    out = graph.invoke(state)
    assert out.get("acceptance_route") == AcceptanceRoute.ACCEPT.value
    assert out.get("verification_decision_written") is True


def test_verification_subgraph_routes_repair_on_schema(tmp_path: Path) -> None:
    graph = build_verification_graph(
        run_directory=tmp_path,
        gate_allowed=True,
        skip_mcp_gate=True,
    )
    bad = _full_evidence("deadbeef")
    del bad["independent_review"]["artifact_sha256"]
    state = {
        "run_id": "p4-test",
        "candidate_commit": "deadbeef",
        "evidence_refs": bad,
        "requirements_covered": True,
        "checklist_vars": {},
    }
    out = graph.invoke(state)
    assert out.get("acceptance_route") == AcceptanceRoute.REPAIR.value
