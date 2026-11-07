"""[PLAN-TIED-LG-P5-CHECKLIST] Project graph slug dispatch."""

from __future__ import annotations

from pathlib import Path

import yaml

from tied_langgraph.checklist_segment import resolve_segment
from tied_langgraph.graphs.project import run_checklist_segment
from tied_langgraph.ledger import load_ledger
from tied_langgraph.policies.acceptance import AcceptanceRoute
from tied_langgraph.tracker_writer import mark_slug_completed


def _full_evidence(commit: str) -> dict[str, dict[str, str]]:
    sha = "a" * 64
    return {
        "green_test": {"result": "passed", "commit": commit, "artifact_sha256": sha},
        "regression_suite": {"result": "passed", "commit": commit, "artifact_sha256": sha},
        "static_analysis": {"result": "passed", "commit": commit, "artifact_sha256": sha},
        "independent_review": {"result": "passed", "commit": commit, "artifact_sha256": sha},
    }


def test_run_default_segment_updates_tracker_and_ledger(tmp_path: Path) -> None:
    worktree = tmp_path / "wt"
    worktree.mkdir()
    run_dir = tmp_path / "run"
    tracker = tmp_path / "tracker.yaml"
    tracker.write_text(
        yaml.safe_dump(
            {
                "request": "PLAN-P5",
                "steps": [
                    {"slug": "unit-test-red", "disposition": "pending"},
                    {"slug": "unit-test-green", "disposition": "pending"},
                    {"slug": "composition-integration", "disposition": "pending"},
                ],
                "execution_evidence": {"completed": [], "request": "PLAN-P5"},
            },
            sort_keys=False,
        ),
        encoding="utf-8",
    )

    segment = resolve_segment(preset="tdd-unit-slice")
    final = run_checklist_segment(
        run_directory=run_dir,
        tracker_path=tracker,
        segment=segment,
        worktree_path=worktree,
        request_token="PLAN-TIED-LG-P5-CHECKLIST",
        run_id="p5-composition",
        candidate_commit="cafebabe",
        evidence_refs=_full_evidence("cafebabe"),
    )
    assert final.get("segment_complete") is True
    assert final.get("acceptance_route") == AcceptanceRoute.ACCEPT.value

    data = yaml.safe_load(tracker.read_text(encoding="utf-8"))
    for slug in segment:
        step = next(s for s in data["steps"] if s["slug"] == slug)
        assert step["disposition"] == "completed"
        assert slug in data["execution_evidence"]["completed"]

    ledger = load_ledger(run_dir / "run-ledger.json")
    tools = {obs["tool"] for obs in ledger.get("observations", [])}
    assert "checklist_slug:unit-test-red" in tools
    assert "checklist_slug:composition-integration" in tools


def test_mark_slug_completed_exported_for_single_writer_policy() -> None:
    assert callable(mark_slug_completed)
