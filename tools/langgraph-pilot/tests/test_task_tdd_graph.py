"""[PLAN-TIED-LG-P3-TDD] TDD subgraph transitions with mocked runners."""

from __future__ import annotations

from pathlib import Path

from tied_langgraph.graphs.task_tdd import build_task_tdd_graph
from tied_langgraph.policies.tdd_red import RedClassification
from tied_langgraph.state import RunState


def _base_state(worktree: Path) -> RunState:
    return {
        "run_id": "tdd-unit",
        "request_token": "PLAN-TIED-LG-P3-TDD",
        "policy_version": "v0",
        "baseline_commit": "base",
        "candidate_commit": "base",
        "checklist_vars": {},
        "evidence_refs": {},
        "worktree_path": str(worktree),
        "test_diff": "",
    }


def test_subgraph_routes_to_refactor_on_valid_red_and_green(tmp_path: Path) -> None:
    worktree = tmp_path / "wt"
    worktree.mkdir()
    run_dir = tmp_path / "run"
    phase = {"n": 0}

    def runner_red(_state: RunState) -> dict:
        return {"exit_code": 1, "stdout": "", "stderr": "AssertionError: fail"}

    def runner_green(_state: RunState) -> dict:
        return {"exit_code": 0, "stdout": "ok", "stderr": ""}

    def apply_green(path: Path) -> None:
        (path / ".green").write_text("1", encoding="utf-8")

    graph = build_task_tdd_graph(
        run_directory=run_dir,
        runner_red=runner_red,
        runner_green=runner_green,
        apply_green=apply_green,
    )
    final = graph.invoke(_base_state(worktree))
    assert final["red_classification"] == RedClassification.VALID_RED.value
    assert final["tdd_phase"] == "refactor"
    assert final.get("green_blocked") is False


def test_subgraph_stops_on_invalid_red(tmp_path: Path) -> None:
    worktree = tmp_path / "wt"
    worktree.mkdir()
    run_dir = tmp_path / "run"

    def runner_red(_state: RunState) -> dict:
        return {"exit_code": 1, "stdout": "", "stderr": "SyntaxError: bad"}

    graph = build_task_tdd_graph(
        run_directory=run_dir,
        runner_red=runner_red,
        runner_green=lambda _s: {"exit_code": 0, "stdout": "", "stderr": ""},
        apply_green=lambda _p: None,
    )
    final = graph.invoke(_base_state(worktree))
    assert final["red_classification"] == RedClassification.INVALID_RED.value
    assert final.get("tdd_phase") == "red_gate"
