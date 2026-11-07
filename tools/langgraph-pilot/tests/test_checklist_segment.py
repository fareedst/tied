"""[PLAN-TIED-LG-P5-CHECKLIST] Segment loader and ordering."""

from __future__ import annotations

from pathlib import Path

import pytest

from tied_langgraph.checklist_segment import (
    SegmentOrderError,
    load_master_slugs,
    resolve_segment,
    validate_contiguous,
)


def test_preset_tdd_unit_slice() -> None:
    segment = resolve_segment(preset="tdd-unit-slice")
    assert segment == ["unit-test-red", "unit-test-green", "composition-integration"]


def test_resolve_explicit_slugs() -> None:
    segment = resolve_segment(slugs=["unit-test-red", "unit-test-green"])
    assert len(segment) == 2


def test_load_master_slugs_from_repo_checklist() -> None:
    root = Path(__file__).resolve().parents[3]
    checklist = root / "tied-bundle/docs/agent-req-implementation-checklist.yaml"
    slugs = load_master_slugs(checklist)
    assert "unit-test-red" in slugs
    assert slugs.index("unit-test-red") < slugs.index("unit-test-green")
    assert slugs.index("unit-test-green") < slugs.index("composition-integration")


def test_validate_contiguous_accepts_default_slice() -> None:
    master = ["a", "unit-test-red", "unit-test-green", "composition-integration", "z"]
    validate_contiguous(master, ["unit-test-red", "unit-test-green", "composition-integration"])


def test_validate_contiguous_rejects_gap() -> None:
    master = ["unit-test-red", "risk-assessment", "unit-test-green"]
    with pytest.raises(SegmentOrderError):
        validate_contiguous(master, ["unit-test-red", "unit-test-green"])


def test_resolve_rejects_non_contiguous_against_master(tmp_path: Path) -> None:
    checklist = tmp_path / "c.yaml"
    checklist.write_text(
        "steps:\n  - slug: unit-test-red\n  - slug: risk-assessment\n  - slug: unit-test-green\n",
        encoding="utf-8",
    )
    with pytest.raises(SegmentOrderError):
        resolve_segment(checklist_yaml=checklist, slugs=["unit-test-red", "unit-test-green"])
