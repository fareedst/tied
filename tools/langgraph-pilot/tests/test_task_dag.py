"""[PLAN-TIED-LG-P6-MULTI-TASK] Task DAG loader and schedule."""

from __future__ import annotations

from pathlib import Path

import pytest

from tied_langgraph.task_dag import (
    TaskDagCycleError,
    load_task_plan,
    ready_executable_tasks,
    topological_task_order,
)

FIXTURE = Path(__file__).parent / "fixtures" / "langgraph-task-plan-two-task.v1.json"


def test_load_two_task_plan_merge_task() -> None:
    plan = load_task_plan(FIXTURE)
    assert plan.merge_task_id == "merge-main"
    assert plan.segment_preset == "tdd-unit-slice"
    assert set(plan.task_ids) == {"task-alpha", "task-beta", "merge-main"}


def test_topological_order_respects_dependencies() -> None:
    plan = load_task_plan(FIXTURE)
    order = topological_task_order(plan)
    assert order.index("task-alpha") < order.index("merge-main")
    assert order.index("task-beta") < order.index("merge-main")


def test_ready_executable_tasks_excludes_merge_until_parents_done() -> None:
    plan = load_task_plan(FIXTURE)
    assert set(ready_executable_tasks(plan, set())) == {"task-alpha", "task-beta"}
    assert ready_executable_tasks(plan, {"task-alpha", "task-beta"}) == []


def test_cycle_detection_raises() -> None:
    cyclic = {
        "schema_version": "langgraph-task-plan.v1",
        "merge_task_id": "merge-main",
        "tasks": [
            {"id": "a", "depends_on": ["b"]},
            {"id": "b", "depends_on": ["a"]},
        ],
    }
    path = Path(__file__).parent / "fixtures" / "_cyclic_plan.json"
    path.write_text(__import__("json").dumps(cyclic), encoding="utf-8")
    try:
        with pytest.raises(TaskDagCycleError):
            load_task_plan(path)
    finally:
        path.unlink(missing_ok=True)
