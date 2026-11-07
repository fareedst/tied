"""[PLAN-TIED-LG-P6-MULTI-TASK] Worktree pool isolation."""

from __future__ import annotations

from pathlib import Path

import pytest

from tied_langgraph.worktree_pool import WorktreePool


def test_allocate_unique_paths_per_task(tmp_path: Path) -> None:
    pool = WorktreePool(tmp_path / "worktrees")
    alpha = pool.allocate("task-alpha")
    beta = pool.allocate("task-beta")
    assert alpha != beta
    assert alpha.is_dir() and beta.is_dir()
    assert pool.path_for("task-alpha") == alpha


def test_duplicate_task_id_refused(tmp_path: Path) -> None:
    pool = WorktreePool(tmp_path / "worktrees")
    pool.allocate("task-alpha")
    with pytest.raises(ValueError, match="duplicate"):
        pool.allocate("task-alpha")
