"""Isolated worktree paths per parallel task — [PLAN-TIED-LG-P6-MULTI-TASK]."""

from __future__ import annotations

from pathlib import Path


class WorktreePool:
    """Allocate one directory per task id under a run-scoped base path."""

    def __init__(self, base: Path) -> None:
        self._base = base
        self._base.mkdir(parents=True, exist_ok=True)
        self._allocated: dict[str, Path] = {}

    def allocate(self, task_id: str) -> Path:
        if task_id in self._allocated:
            raise ValueError(f"duplicate worktree allocation for task_id={task_id!r}")
        path = (self._base / task_id).resolve()
        path.mkdir(parents=True, exist_ok=True)
        self._allocated[task_id] = path
        return path

    def path_for(self, task_id: str) -> Path:
        return self._allocated[task_id]

    def paths(self) -> dict[str, Path]:
        return dict(self._allocated)

    def integrate_into(self, target: Path) -> None:
        """Copy per-task markers into a merged tree (hermetic merge stub)."""
        target.mkdir(parents=True, exist_ok=True)
        for task_id, wt in self._allocated.items():
            marker = wt / ".green"
            if marker.is_file():
                (target / f"{task_id}.green").write_text(marker.read_text(encoding="utf-8"), encoding="utf-8")
