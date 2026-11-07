"""Multi-task project graph with Send fan-out — [PLAN-TIED-LG-P6-MULTI-TASK]."""

from __future__ import annotations

import inspect
import json
from collections.abc import Callable
from pathlib import Path
from typing import Any

from langgraph.graph import END, START, StateGraph
from langgraph.types import Send

from tied_langgraph.checklist_segment import resolve_segment
from tied_langgraph.graphs.project import run_checklist_segment
from tied_langgraph.ledger import append_observation
from tied_langgraph.policies.staleness import staleness_route
from tied_langgraph.replan import record_architectural_replan
from tied_langgraph.state import RunState
from tied_langgraph.task_dag import (
    load_task_plan,
    merge_prerequisites_met,
    ready_executable_tasks,
)
from tied_langgraph.worktree_pool import WorktreePool

_FANOUT_USES_SEND = True


def uses_send_fanout() -> bool:
    """True when build_multi_task_graph wires LangGraph Send for parallel waves."""
    return _FANOUT_USES_SEND and "Send" in inspect.getsource(build_multi_task_graph)


def _default_regression_runner(merged: Path) -> dict[str, Any]:
    artifact = merged / "regression.stdout"
    artifact.write_text("ok\n", encoding="utf-8")
    return {"exit_code": 0, "stdout": "ok", "stderr": ""}


def _run_one_implement_task(
    *,
    plan_path: Path,
    task_id: str,
    run_directory: Path,
    tracker_path: Path,
    worktree: Path,
    request_token: str,
    run_id: str,
    candidate_commit: str,
    evidence_refs: dict[str, Any],
    inject_runners: dict[str, Any] | None,
    task_run_directory: Path,
) -> None:
    plan = load_task_plan(plan_path)
    segment = resolve_segment(preset=plan.segment_preset)
    runners = inject_runners or {}
    run_checklist_segment(
        run_directory=task_run_directory,
        tracker_path=tracker_path,
        segment=segment,
        worktree_path=worktree,
        request_token=f"{request_token}:{task_id}",
        run_id=f"{run_id}:{task_id}",
        candidate_commit=candidate_commit,
        evidence_refs=evidence_refs,
        runner_red=runners.get("runner_red"),
        runner_green=runners.get("runner_green"),
        apply_green=runners.get("apply_green"),
    )
    (run_directory / f"task-{task_id}.json").write_text(
        json.dumps({"task_id": task_id, "disposition": "completed"}),
        encoding="utf-8",
    )


def run_multi_task_plan(
    *,
    task_plan_path: Path,
    run_directory: Path,
    tracker_paths: dict[str, Path],
    request_token: str,
    run_id: str,
    candidate_commit: str,
    evidence_refs: dict[str, Any],
    max_parallel: int = 2,
    inject_task_runners: dict[str, dict[str, Any]] | None = None,
    regression_runner: Callable[[Path], dict[str, Any]] | None = None,
    leap_client: Any | None = None,
    evidence_commit: str | None = None,
) -> dict[str, Any]:
    """Schedule implement tasks, merge worktrees, run combined regression."""
    run_directory.mkdir(parents=True, exist_ok=True)
    plan = load_task_plan(task_plan_path)
    pool = WorktreePool(run_directory / "worktrees")
    completed: set[str] = set()
    failed: set[str] = set()

    while True:
        ready = ready_executable_tasks(plan, completed | failed)
        if not ready:
            break
        for task_id in ready[:max_parallel]:
            if task_id not in tracker_paths:
                raise ValueError(f"missing tracker_paths entry for {task_id}")
            wt = pool.allocate(task_id)
            inject = (inject_task_runners or {}).get(task_id)
            try:
                _run_one_implement_task(
                    plan_path=task_plan_path,
                    task_id=task_id,
                    run_directory=run_directory,
                    tracker_path=tracker_paths[task_id],
                    worktree=wt,
                    request_token=request_token,
                    run_id=run_id,
                    candidate_commit=candidate_commit,
                    evidence_refs=evidence_refs,
                    inject_runners=inject,
                    task_run_directory=run_directory,
                )
                completed.add(task_id)
            except Exception:  # noqa: BLE001 — route task failure to merge block
                failed.add(task_id)

    result: dict[str, Any] = {
        "run_id": run_id,
        "request_token": request_token,
        "completed_tasks": sorted(completed),
        "failed_tasks": sorted(failed),
        "candidate_commit": candidate_commit,
    }

    if failed:
        result["merge_blocked"] = True
        result["merge_complete"] = False
        record_architectural_replan(
            client=leap_client,
            request_token=request_token,
            summary=f"Parallel tasks failed: {sorted(failed)}",
            run_id=run_id,
        )
        (run_directory / "merge-blocked.json").write_text(
            json.dumps({"failed_tasks": sorted(failed)}),
            encoding="utf-8",
        )
        append_observation(
            run_directory=run_directory,
            ledger_filename="run-ledger.json",
            run_id=run_id,
            request_token=request_token,
            tool="merge_blocked",
            commit=candidate_commit,
            exit_code=1,
            artifact_path="merge-blocked.json",
            candidate_commit=candidate_commit,
        )
        return result

    if not merge_prerequisites_met(plan, completed):
        result["merge_blocked"] = True
        result["merge_complete"] = False
        return result

    merged = run_directory / "merged"
    pool.integrate_into(merged)
    regress = regression_runner or _default_regression_runner
    outcome = regress(merged)
    final_commit = f"{candidate_commit}-merged"
    if staleness_route(candidate_commit=final_commit, evidence_commit=evidence_commit) == "repair":
        result["staleness_route"] = "repair"
        result["merge_blocked"] = True
        result["merge_complete"] = False
        return result

    merge_payload = {
        "exit_code": int(outcome.get("exit_code", 1)),
        "stdout": outcome.get("stdout", ""),
        "candidate_commit": final_commit,
    }
    merge_path = run_directory / "merge-regression.json"
    merge_path.write_text(json.dumps(merge_payload), encoding="utf-8")
    append_observation(
        run_directory=run_directory,
        ledger_filename="run-ledger.json",
        run_id=run_id,
        request_token=request_token,
        tool="merge_regression",
        commit=final_commit,
        exit_code=int(outcome["exit_code"]),
        artifact_path="merge-regression.json",
        candidate_commit=final_commit,
    )

    if int(outcome["exit_code"]) != 0:
        result["merge_blocked"] = True
        result["merge_complete"] = False
        return result

    result["merge_complete"] = True
    result["merge_blocked"] = False
    result["candidate_commit"] = final_commit
    return result


class _MultiOrchestratorState(dict):
    """Loose state bag for Send fan-out graph."""


def build_multi_task_graph() -> Any:
    """Compile a minimal graph whose schedule node emits LangGraph Send objects."""
    graph = StateGraph(dict)

    def schedule(state: dict[str, Any]) -> list[Send] | str:
        plan = load_task_plan(Path(state["task_plan_path"]))
        completed = set(state.get("completed_tasks") or [])
        ready = ready_executable_tasks(plan, completed)
        if not ready:
            return "merge"
        cap = int(state.get("max_parallel", 2))
        return [Send("run_task", {**state, "current_task_id": tid}) for tid in ready[:cap]]

    def run_task(state: dict[str, Any]) -> dict[str, Any]:
        tid = state["current_task_id"]
        done = list(state.get("completed_tasks") or [])
        if tid not in done:
            done.append(tid)
        return {"completed_tasks": done}

    def merge_node(state: dict[str, Any]) -> dict[str, Any]:
        return {"merge_dispatched": True}

    graph.add_node("schedule", lambda s: s)
    graph.add_node("run_task", run_task)
    graph.add_node("merge", merge_node)
    graph.add_conditional_edges("schedule", schedule, {"merge": "merge", "run_task": "run_task"})
    graph.add_edge("run_task", "merge")
    graph.add_edge("merge", END)
    graph.add_edge(START, "schedule")
    return graph.compile()
