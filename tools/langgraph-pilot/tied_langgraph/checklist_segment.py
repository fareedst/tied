"""Checklist segment resolution — [PLAN-TIED-LG-P5-CHECKLIST]."""

from __future__ import annotations

from pathlib import Path
from typing import Any

import yaml

SEGMENT_PRESETS: dict[str, list[str]] = {
    "tdd-unit-slice": [
        "unit-test-red",
        "unit-test-green",
        "composition-integration",
    ],
}


class SegmentOrderError(ValueError):
    """Segment slugs are not contiguous in the master checklist order."""


def load_master_slugs(checklist_yaml: Path) -> list[str]:
    """Return checklist step slugs in master YAML order."""
    raw: Any = yaml.safe_load(checklist_yaml.read_text(encoding="utf-8"))
    if not isinstance(raw, dict):
        raise ValueError("checklist root must be a mapping")
    steps = raw.get("steps")
    if not isinstance(steps, list):
        raise ValueError("checklist steps must be a list")
    slugs: list[str] = []
    for step in steps:
        if isinstance(step, dict) and isinstance(step.get("slug"), str):
            slugs.append(step["slug"])
    if not slugs:
        raise ValueError("checklist has no step slugs")
    return slugs


def validate_contiguous(master: list[str], segment: list[str]) -> None:
    """Ensure segment slugs appear in order without gaps in master."""
    try:
        indices = [master.index(slug) for slug in segment]
    except ValueError as exc:
        raise SegmentOrderError(f"slug not found in master checklist: {exc}") from exc
    for i in range(1, len(indices)):
        if indices[i] != indices[i - 1] + 1:
            raise SegmentOrderError(
                f"segment not contiguous at {segment[i - 1]!r} -> {segment[i]!r}"
            )


def resolve_segment(
    *,
    checklist_yaml: Path | None = None,
    preset: str | None = None,
    slugs: list[str] | None = None,
) -> list[str]:
    """Resolve a slug segment from preset name and/or explicit slug list."""
    if slugs is None:
        if not preset:
            raise ValueError("preset or slugs required")
        if preset not in SEGMENT_PRESETS:
            raise ValueError(f"unknown preset {preset!r}")
        segment = list(SEGMENT_PRESETS[preset])
    else:
        segment = list(slugs)

    if checklist_yaml is not None:
        master = load_master_slugs(checklist_yaml)
        validate_contiguous(master, segment)
    return segment
