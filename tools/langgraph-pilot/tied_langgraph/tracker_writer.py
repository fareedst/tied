"""Single-writer checklist tracker updates — [PLAN-TIED-LG-P5-CHECKLIST]."""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any

import yaml

WRITER_ID = "langgraph-pilot"
LOCK_SUFFIX = ".langgraph-writer.lock"


class TrackerWriterError(RuntimeError):
    """Tracker update refused."""


def _lock_path(tracker_path: Path) -> Path:
    return tracker_path.with_suffix(tracker_path.suffix + LOCK_SUFFIX)


def _acquire_lock(tracker_path: Path, writer_id: str) -> Path:
    lock = _lock_path(tracker_path)
    if lock.exists():
        existing = lock.read_text(encoding="utf-8").strip()
        if existing and existing != writer_id:
            raise TrackerWriterError(f"tracker locked by {existing!r}")
    lock.write_text(writer_id, encoding="utf-8")
    return lock


def _release_lock(lock: Path) -> None:
    if lock.is_file():
        lock.unlink()


def mark_slug_completed(
    *,
    tracker_path: Path,
    slug: str,
    evidence_refs: list[Any],
    writer_id: str = WRITER_ID,
) -> None:
    """Mark one checklist slug completed on tracker YAML (single writer)."""
    if not tracker_path.is_file():
        raise TrackerWriterError(f"tracker not found: {tracker_path}")

    lock = _acquire_lock(tracker_path, writer_id)
    try:
        data = yaml.safe_load(tracker_path.read_text(encoding="utf-8"))
        if not isinstance(data, dict):
            raise TrackerWriterError("tracker root must be a mapping")

        steps = data.get("steps")
        if not isinstance(steps, list):
            raise TrackerWriterError("tracker steps must be a list")

        matched = False
        for step in steps:
            if isinstance(step, dict) and step.get("slug") == slug:
                step["disposition"] = "completed"
                if evidence_refs:
                    step["evidence_refs"] = evidence_refs
                matched = True
                break
        if not matched:
            raise TrackerWriterError(f"slug {slug!r} not in tracker")

        exec_ev = data.setdefault("execution_evidence", {})
        if not isinstance(exec_ev, dict):
            raise TrackerWriterError("execution_evidence must be a mapping")
        completed = exec_ev.setdefault("completed", [])
        if not isinstance(completed, list):
            raise TrackerWriterError("execution_evidence.completed must be a list")
        if slug not in completed:
            completed.append(slug)

        tracker_path.write_text(
            yaml.safe_dump(data, sort_keys=False, default_flow_style=False),
            encoding="utf-8",
        )
    finally:
        _release_lock(lock)


def assert_single_writer(tracker_path: Path) -> None:
    """Raise when another writer holds the tracker lock."""
    lock = _lock_path(tracker_path)
    if lock.is_file():
        holder = lock.read_text(encoding="utf-8").strip()
        if holder and holder != WRITER_ID:
            raise TrackerWriterError(f"tracker locked by {holder!r}")
    # Prevent concurrent OS-level editors without going through mark_slug_completed.
    if os.environ.get("LANGGRAPH_TRACKER_DUAL_WRITE") == "1":
        raise TrackerWriterError("LANGGRAPH_TRACKER_DUAL_WRITE forbidden for production pilot")
