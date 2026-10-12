"""Commit / policy_version invalidation stub for evidence staleness."""

from __future__ import annotations

from typing import Literal

StalenessRoute = Literal["continue", "repair"]


def evidence_is_stale(*, candidate_commit: str | None, evidence_commit: str | None) -> bool:
    """True when candidate and evidence commits differ (either may be unset)."""
    if not candidate_commit or not evidence_commit:
        return False
    return candidate_commit != evidence_commit


def staleness_route(
    *,
    candidate_commit: str | None,
    evidence_commit: str | None,
) -> StalenessRoute:
    """Route mismatched revisions to repair; equal commits continue."""
    if evidence_is_stale(candidate_commit=candidate_commit, evidence_commit=evidence_commit):
        return "repair"
    return "continue"
