"""Single-task TDD subgraph — [PLAN-TIED-LG-P3-TDD]."""

from __future__ import annotations

from collections.abc import Callable
from pathlib import Path
from typing import Any

from langgraph.graph import END, START, StateGraph

from tied_langgraph.ledger import load_ledger
from tied_langgraph.policies.tdd_red import RedClassification, classify_red_result, implement_allowed
from tied_langgraph.policies.test_weakening import detect_test_weakening
from tied_langgraph.state import RunState


TestRunner = Callable[[RunState], dict[str, Any]]
GreenApplier = Callable[[Path], None]


def _worktree(state: RunState) -> Path:
    raw = state.get("worktree_path")
    if not raw:
        raise ValueError("worktree_path required for TDD subgraph")
    return Path(raw)


def build_task_tdd_graph(
    *,
    run_directory: Path,
    runner_red: TestRunner,
    runner_green: TestRunner,
    apply_green: GreenApplier,
    ledger_filename: str = "run-ledger.json",
) -> Any:
    run_directory.mkdir(parents=True, exist_ok=True)

    def red_run_node(state: RunState) -> RunState:
        outcome = runner_red(state)
        updated = dict(state)
        updated["tdd_phase"] = "red"
        updated["last_exit_code"] = int(outcome["exit_code"])
        updated["checklist_vars"] = {
            **(state.get("checklist_vars") or {}),
            "red_stdout": outcome.get("stdout", ""),
            "red_stderr": outcome.get("stderr", ""),
        }
        return updated  # type: ignore[return-value]

    def red_gate_node(state: RunState) -> RunState:
        vars_ = state.get("checklist_vars") or {}
        red = classify_red_result(
            exit_code=int(state.get("last_exit_code") or 0),
            stdout=str(vars_.get("red_stdout", "")),
            stderr=str(vars_.get("red_stderr", "")),
        )
        updated = dict(state)
        updated["red_classification"] = red.value
        updated["tdd_route"] = "green" if implement_allowed(red) else "repair"
        updated["tdd_phase"] = "red_gate"
        return updated  # type: ignore[return-value]

    def green_apply_node(state: RunState) -> RunState:
        apply_green(_worktree(state))
        updated = dict(state)
        updated["tdd_phase"] = "green_apply"
        return updated  # type: ignore[return-value]

    def green_run_node(state: RunState) -> RunState:
        outcome = runner_green(state)
        updated = dict(state)
        updated["tdd_phase"] = "green"
        updated["last_exit_code"] = int(outcome["exit_code"])
        updated["checklist_vars"] = {
            **(state.get("checklist_vars") or {}),
            "green_stdout": outcome.get("stdout", ""),
            "green_stderr": outcome.get("stderr", ""),
        }
        return updated  # type: ignore[return-value]

    def green_gate_node(state: RunState) -> RunState:
        ledger = load_ledger(run_directory / ledger_filename)
        diff_text = state.get("test_diff") or ""
        weakening = detect_test_weakening(diff_text=diff_text, ledger=ledger)
        raw_exit = state.get("last_exit_code")
        exit_code = int(raw_exit) if raw_exit is not None else 1
        updated = dict(state)
        updated["green_blocked"] = weakening or exit_code != 0
        if updated["green_blocked"]:
            updated["tdd_phase"] = "green_gate"
            updated["tdd_route"] = "repair"
        else:
            updated["tdd_phase"] = "refactor"
            updated["tdd_route"] = "done"
        return updated  # type: ignore[return-value]

    def route_after_red(state: RunState) -> str:
        return "green_apply" if state.get("tdd_route") == "green" else END

    graph = StateGraph(RunState)
    graph.add_node("red_run", red_run_node)
    graph.add_node("red_gate", red_gate_node)
    graph.add_node("green_apply", green_apply_node)
    graph.add_node("green_run", green_run_node)
    graph.add_node("green_gate", green_gate_node)

    graph.add_edge(START, "red_run")
    graph.add_edge("red_run", "red_gate")
    graph.add_conditional_edges("red_gate", route_after_red, {"green_apply": "green_apply", END: END})
    graph.add_edge("green_apply", "green_run")
    graph.add_edge("green_run", "green_gate")
    graph.add_edge("green_gate", END)
    return graph.compile()
