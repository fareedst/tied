"""[PLAN-TIED-LG-P3-TDD] Hermetic RED→GREEN composition."""

from __future__ import annotations

import os
import shutil
import stat
from pathlib import Path

import pytest

from tied_langgraph.graphs.task_tdd import build_task_tdd_graph
from tied_langgraph.ledger import load_ledger
from tied_langgraph.policies.tdd_red import RedClassification
from tied_langgraph.runners.subprocess_test import run_subprocess_test
from tied_langgraph.state import RunState

FIXTURE_ROOT = Path(__file__).resolve().parent / "fixtures" / "tdd-mini-repo"


def _copy_mini_repo(dest: Path) -> None:
    shutil.copytree(FIXTURE_ROOT, dest, dirs_exist_ok=True)
    script = dest / "run_tests.sh"
    script.chmod(script.stat().st_mode | stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)


def test_hermetic_red_green_composition(tmp_path: Path) -> None:
    worktree = tmp_path / "mini"
    _copy_mini_repo(worktree)
    run_dir = tmp_path / "run"

    def runner_red(state: RunState) -> dict:
        result = run_subprocess_test(
            run_directory=run_dir,
            run_id=state["run_id"],
            request_token=state["request_token"],
            cwd=Path(state["worktree_path"]),
            command=["/bin/bash", "run_tests.sh"],
            commit=state.get("baseline_commit"),
            tool="tdd_red_run",
        )
        return {"exit_code": result.exit_code, "stdout": result.stdout, "stderr": result.stderr}

    def runner_green(state: RunState) -> dict:
        result = run_subprocess_test(
            run_directory=run_dir,
            run_id=state["run_id"],
            request_token=state["request_token"],
            cwd=Path(state["worktree_path"]),
            command=["/bin/bash", "run_tests.sh"],
            commit=state.get("candidate_commit"),
            tool="tdd_green_run",
        )
        return {"exit_code": result.exit_code, "stdout": result.stdout, "stderr": result.stderr}

    def apply_green(path: Path) -> None:
        (path / ".green").write_text("ok\n", encoding="utf-8")

    graph = build_task_tdd_graph(
        run_directory=run_dir,
        runner_red=runner_red,
        runner_green=runner_green,
        apply_green=apply_green,
    )
    initial: RunState = {
        "run_id": "hermetic-tdd",
        "request_token": "PLAN-TIED-LG-P3-TDD",
        "policy_version": "v0",
        "baseline_commit": "baseline",
        "candidate_commit": "candidate",
        "checklist_vars": {},
        "evidence_refs": {},
        "worktree_path": str(worktree),
        "test_diff": "",
    }
    final = graph.invoke(initial)
    assert final["red_classification"] == RedClassification.VALID_RED.value
    assert final["tdd_phase"] == "refactor"
    ledger = load_ledger(run_dir / "run-ledger.json")
    assert len(ledger["observations"]) >= 2
    tools = {obs["tool"] for obs in ledger["observations"]}
    assert "tdd_red_run" in tools
    assert "tdd_green_run" in tools


@pytest.mark.integration
def test_fixture_client_integration_optional() -> None:
    root = os.environ.get("LANGGRAPH_FIXTURE_CLIENT_ROOT")
    if not root:
        pytest.skip("LANGGRAPH_FIXTURE_CLIENT_ROOT not set")
    client = Path(root)
    if not (client / "package.json").is_file():
        pytest.skip("fixture client missing package.json")
