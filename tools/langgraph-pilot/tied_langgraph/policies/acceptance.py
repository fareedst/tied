"""Deterministic acceptance gate — [PLAN-TIED-LG-P4-ACCEPTANCE]."""

from __future__ import annotations

from enum import Enum
from typing import Any


class AcceptanceRoute(str, Enum):
    REPAIR = "repair"
    REPLAN = "replan"
    ESCALATE = "escalate"
    ACCEPT = "accept"


_DEFAULT_REQUIRED = (
    "green_test",
    "regression_suite",
    "static_analysis",
    "independent_review",
)


def required_evidence_kinds() -> tuple[str, ...]:
    return _DEFAULT_REQUIRED


def acceptance_gate(
    *,
    evidence: dict[str, Any],
    candidate_commit: str,
    requirements_covered: bool,
    unresolved_blockers: list[str],
) -> AcceptanceRoute:
    """Route progress authorization per conceptual doc §5 (+ review evidence for P4)."""
    for kind in _DEFAULT_REQUIRED:
        record = evidence.get(kind) or {}
        if record.get("result") != "passed" or record.get("commit") != candidate_commit:
            return AcceptanceRoute.REPAIR

    if not requirements_covered:
        return AcceptanceRoute.REPLAN

    if unresolved_blockers:
        return AcceptanceRoute.ESCALATE

    return AcceptanceRoute.ACCEPT
