"""Task DAG load and schedule — [PLAN-TIED-LG-P6-MULTI-TASK]."""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Literal

TaskKind = Literal["implement", "merge"]


class TaskDagCycleError(ValueError):
    """Task dependency graph contains a cycle."""


class TaskDagError(ValueError):
    """Invalid task plan artifact."""


@dataclass(frozen=True)
class TaskSpec:
    id: str
    depends_on: tuple[str, ...]
    kind: TaskKind = "implement"


@dataclass(frozen=True)
class TaskPlan:
    schema_version: str
    merge_task_id: str
    segment_preset: str
    tasks: tuple[TaskSpec, ...]

    @property
    def task_ids(self) -> set[str]:
        return {t.id for t in self.tasks}

    def task(self, task_id: str) -> TaskSpec:
        for spec in self.tasks:
            if spec.id == task_id:
                return spec
        raise TaskDagError(f"unknown task id: {task_id}")

    def merge_task(self) -> TaskSpec:
        return self.task(self.merge_task_id)


def _parse_task(raw: dict[str, Any]) -> TaskSpec:
    task_id = str(raw.get("id", "")).strip()
    if not task_id:
        raise TaskDagError("task entry missing id")
    deps = tuple(str(d).strip() for d in raw.get("depends_on") or [] if str(d).strip())
    kind: TaskKind = "merge" if raw.get("kind") == "merge" else "implement"
    if task_id and raw.get("kind") == "merge":
        kind = "merge"
    return TaskSpec(id=task_id, depends_on=deps, kind=kind)


def load_task_plan(path: Path) -> TaskPlan:
    """Load langgraph-task-plan.v1 JSON and validate acyclic dependencies."""
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        raise TaskDagError("task plan root must be an object")
    schema = str(data.get("schema_version", ""))
    if not schema.startswith("langgraph-task-plan"):
        raise TaskDagError(f"unsupported schema_version: {schema!r}")
    merge_id = str(data.get("merge_task_id", "")).strip()
    if not merge_id:
        raise TaskDagError("merge_task_id required")
    preset = str(data.get("segment_preset", "tdd-unit-slice"))
    raw_tasks = data.get("tasks")
    if not isinstance(raw_tasks, list) or not raw_tasks:
        raise TaskDagError("tasks must be a non-empty list")
    tasks = tuple(_parse_task(entry) for entry in raw_tasks if isinstance(entry, dict))
    plan = TaskPlan(
        schema_version=schema,
        merge_task_id=merge_id,
        segment_preset=preset,
        tasks=tasks,
    )
    topological_task_order(plan)
    return plan


def topological_task_order(plan: TaskPlan) -> list[str]:
    """Kahn topological sort; raises TaskDagCycleError on cycle."""
    deps: dict[str, set[str]] = {t.id: set(t.depends_on) for t in plan.tasks}
    for task_id, task_deps in deps.items():
        unknown = task_deps - set(deps)
        if unknown:
            raise TaskDagError(f"task {task_id} depends on unknown ids: {sorted(unknown)}")
    incoming = {tid: len(d) for tid, d in deps.items()}
    ready = [tid for tid, count in incoming.items() if count == 0]
    order: list[str] = []
    while ready:
        node = ready.pop(0)
        order.append(node)
        for tid, task_deps in deps.items():
            if node in task_deps:
                incoming[tid] -= 1
                if incoming[tid] == 0:
                    ready.append(tid)
    if len(order) != len(deps):
        raise TaskDagCycleError("task dependency cycle detected")
    return order


def ready_executable_tasks(plan: TaskPlan, completed: set[str]) -> list[str]:
    """Return implement-kind tasks whose dependencies are satisfied and not yet completed."""
    ready: list[str] = []
    for spec in plan.tasks:
        if spec.kind == "merge":
            continue
        if spec.id in completed:
            continue
        if all(dep in completed for dep in spec.depends_on):
            ready.append(spec.id)
    return sorted(ready)


def merge_prerequisites_met(plan: TaskPlan, completed: set[str]) -> bool:
    merge = plan.merge_task()
    return all(dep in completed for dep in merge.depends_on)
