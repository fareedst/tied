"""[PLAN-TIED-LG-P6-MULTI-TASK] Parallel task plan orchestration."""

from __future__ import annotations

from pathlib import Path

import yaml

from tied_langgraph.checklist_segment import resolve_segment
from tied_langgraph.graphs.project_multi import run_multi_task_plan, uses_send_fanout
from tied_langgraph.ledger import load_ledger


def _tracker_template(request: str) -> dict:
    slugs = resolve_segment(preset="tdd-unit-slice")
    return {
        "request": request,
        "steps": [{"slug": s, "disposition": "pending"} for s in slugs],
        "execution_evidence": {"completed": [], "request": request},
    }


def _full_evidence(commit: str) -> dict[str, dict[str, str]]:
    sha = "b" * 64
    return {
        "green_test": {"result": "passed", "commit": commit, "artifact_sha256": sha},
        "regression_suite": {"result": "passed", "commit": commit, "artifact_sha256": sha},
        "static_analysis": {"result": "passed", "commit": commit, "artifact_sha256": sha},
        "independent_review": {"result": "passed", "commit": commit, "artifact_sha256": sha},
    }


def test_two_task_parallel_merge_regression(tmp_path: Path) -> None:
    plan_path = Path(__file__).parent / "fixtures" / "langgraph-task-plan-two-task.v1.json"
    run_dir = tmp_path / "run"
    tracker_alpha = tmp_path / "tracker-alpha.yaml"
    tracker_beta = tmp_path / "tracker-beta.yaml"
    tracker_alpha.write_text(
        yaml.safe_dump(_tracker_template("PLAN-P6-A"), sort_keys=False),
        encoding="utf-8",
    )
    tracker_beta.write_text(
        yaml.safe_dump(_tracker_template("PLAN-P6-B"), sort_keys=False),
        encoding="utf-8",
    )

    result = run_multi_task_plan(
        task_plan_path=plan_path,
        run_directory=run_dir,
        tracker_paths={
            "task-alpha": tracker_alpha,
            "task-beta": tracker_beta,
        },
        request_token="PLAN-TIED-LG-P6-MULTI-TASK",
        run_id="p6-parallel-happy",
        candidate_commit="abc123",
        evidence_refs=_full_evidence("abc123"),
        max_parallel=2,
    )
    assert result.get("merge_complete") is True
    assert result.get("merge_blocked") is not True
    assert "task-alpha" in result.get("completed_tasks", [])
    assert "task-beta" in result.get("completed_tasks", [])

    merge_artifact = run_dir / "merge-regression.json"
    assert merge_artifact.is_file()

    ledger = load_ledger(run_dir / "run-ledger.json")
    tools = {obs["tool"] for obs in ledger.get("observations", [])}
    assert "merge_regression" in tools
    assert "checklist_slug:unit-test-red" in tools


def test_beta_failure_blocks_merge(tmp_path: Path) -> None:
    plan_path = Path(__file__).parent / "fixtures" / "langgraph-task-plan-two-task.v1.json"
    run_dir = tmp_path / "run-fail"
    tracker_alpha = tmp_path / "ta.yaml"
    tracker_beta = tmp_path / "tb.yaml"
    tracker_alpha.write_text(
        yaml.safe_dump(_tracker_template("PLAN-P6-A"), sort_keys=False),
        encoding="utf-8",
    )
    tracker_beta.write_text(
        yaml.safe_dump(_tracker_template("PLAN-P6-B"), sort_keys=False),
        encoding="utf-8",
    )

    def failing_green(_state):  # noqa: ANN001
        return {"exit_code": 1, "stdout": "", "stderr": "forced failure"}

    result = run_multi_task_plan(
        task_plan_path=plan_path,
        run_directory=run_dir,
        tracker_paths={"task-alpha": tracker_alpha, "task-beta": tracker_beta},
        request_token="PLAN-TIED-LG-P6-MULTI-TASK",
        run_id="p6-fault-beta",
        candidate_commit="deadbeef",
        evidence_refs=_full_evidence("deadbeef"),
        max_parallel=2,
        inject_task_runners={"task-beta": {"runner_green": failing_green}},
    )
    assert result.get("merge_blocked") is True
    assert result.get("merge_complete") is not True
    assert "task-beta" in result.get("failed_tasks", [])
    assert not (run_dir / "merge-regression.json").exists()


def test_send_fanout_wiring_present() -> None:
    assert uses_send_fanout() is True
