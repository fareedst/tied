"""[PLAN-TIED-LG-P5-CHECKLIST] Tracker single-writer updates."""

from __future__ import annotations

from pathlib import Path

import pytest
import yaml

from tied_langgraph.tracker_writer import TrackerWriterError, mark_slug_completed


def _sample_tracker(path: Path) -> None:
    path.write_text(
        yaml.safe_dump(
            {
                "request": "TEST-REQ",
                "steps": [
                    {"slug": "unit-test-red", "disposition": "pending"},
                    {"slug": "unit-test-green", "disposition": "pending"},
                ],
                "execution_evidence": {"completed": [], "request": "TEST-REQ"},
            },
            sort_keys=False,
        ),
        encoding="utf-8",
    )


def test_mark_slug_completed_updates_step_and_execution_list(tmp_path: Path) -> None:
    tracker = tmp_path / "tracker.yaml"
    _sample_tracker(tracker)
    mark_slug_completed(
        tracker_path=tracker,
        slug="unit-test-red",
        evidence_refs=[{"kind": "file_path", "path": "evidence/red.md"}],
    )
    data = yaml.safe_load(tracker.read_text(encoding="utf-8"))
    step = next(s for s in data["steps"] if s["slug"] == "unit-test-red")
    assert step["disposition"] == "completed"
    assert "unit-test-red" in data["execution_evidence"]["completed"]


def test_mark_slug_completed_refuses_missing_slug(tmp_path: Path) -> None:
    tracker = tmp_path / "tracker.yaml"
    _sample_tracker(tracker)
    with pytest.raises(TrackerWriterError):
        mark_slug_completed(tracker_path=tracker, slug="verification-gate", evidence_refs=[])


def test_concurrent_writer_lock(tmp_path: Path) -> None:
    tracker = tmp_path / "tracker.yaml"
    _sample_tracker(tracker)
    lock = tmp_path / f"{tracker.name}.langgraph-writer.lock"
    lock.write_text("other", encoding="utf-8")
    with pytest.raises(TrackerWriterError):
        mark_slug_completed(tracker_path=tracker, slug="unit-test-red", evidence_refs=[])
